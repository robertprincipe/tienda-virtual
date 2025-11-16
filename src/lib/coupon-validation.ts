/**
 * Utilities para validación de cupones
 */

import { db } from "@/drizzle/db";
import {
  coupons,
  couponProducts,
  couponCategories,
  products,
} from "@/drizzle/schema";
import { couponRedemptions } from "@/drizzle/schema/orders";
import { eq, and, count, sql } from "drizzle-orm";
import type { CartItemWithProduct } from "@/services/cart/actions/cart.actions";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: number;
    code: string;
    type: "percent" | "fixed";
    value: number;
    eligibleProductIds: number[];
    eligibleCategoryIds: number[];
  };
}

/**
 * Valida un cupón completo
 */
export async function validateCoupon(
  couponCode: string,
  cartItems: CartItemWithProduct[],
  userId?: number
): Promise<CouponValidationResult> {
  // 1. Buscar el cupón
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, couponCode))
    .limit(1);

  if (!coupon) {
    return {
      valid: false,
      error: "Cupón no encontrado",
    };
  }

  // 2. Verificar si está activo
  if (!coupon.isActive) {
    return {
      valid: false,
      error: "Este cupón no está activo",
    };
  }

  // 3. Verificar fechas
  const now = new Date();

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      error: "Este cupón aún no está disponible",
    };
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return {
      valid: false,
      error: "Este cupón ha expirado",
    };
  }

  // 4. Verificar usos máximos globales
  if (coupon.maxUses !== null) {
    const [redemptionCount] = await db
      .select({ count: count() })
      .from(couponRedemptions)
      .where(eq(couponRedemptions.couponId, coupon.id));

    if (redemptionCount && redemptionCount.count >= coupon.maxUses) {
      return {
        valid: false,
        error: "Este cupón ya alcanzó su límite de usos",
      };
    }
  }

  // 5. Verificar usos máximos por usuario (solo si está autenticado)
  if (userId && coupon.maxUsesPerUser !== null) {
    const [userRedemptionCount] = await db
      .select({ count: count() })
      .from(couponRedemptions)
      .where(
        and(
          eq(couponRedemptions.couponId, coupon.id),
          eq(couponRedemptions.userId, userId)
        )
      );

    if (
      userRedemptionCount &&
      userRedemptionCount.count >= coupon.maxUsesPerUser
    ) {
      return {
        valid: false,
        error: "Ya has usado este cupón el máximo de veces permitidas",
      };
    }
  }

  // 6. Verificar subtotal mínimo
  const cartSubtotal = cartItems.reduce((acc, item) => {
    return acc + parseFloat(item.product.price) * item.quantity;
  }, 0);

  if (
    coupon.minSubtotal !== null &&
    cartSubtotal < parseFloat(coupon.minSubtotal)
  ) {
    return {
      valid: false,
      error: `El subtotal mínimo para este cupón es $${coupon.minSubtotal}`,
    };
  }

  // 7. Obtener productos y categorías asociadas al cupón
  const eligibleProductIds = await db
    .select({ productId: couponProducts.productId })
    .from(couponProducts)
    .where(eq(couponProducts.couponId, coupon.id))
    .then((rows) => rows.map((r) => r.productId));

  const eligibleCategoryIds = await db
    .select({ categoryId: couponCategories.categoryId })
    .from(couponCategories)
    .where(eq(couponCategories.couponId, coupon.id))
    .then((rows) => rows.map((r) => r.categoryId));

  // 8. Si hay restricciones de productos o categorías, verificar que al menos un item aplica
  const hasRestrictions =
    eligibleProductIds.length > 0 || eligibleCategoryIds.length > 0;

  if (hasRestrictions) {
    // Necesitamos obtener las categorías de los productos del carrito
    const cartProductIds = cartItems.map((item) => item.productId);

    const cartProducts = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(
        sql`${products.id} IN ${sql.raw(`(${cartProductIds.join(",")})`)}`
      );

    const productCategoryMap = new Map(
      cartProducts.map((p) => [p.id, p.categoryId])
    );

    const hasEligibleItem = cartItems.some((item) => {
      const isEligibleProduct = eligibleProductIds.includes(item.productId);
      const categoryId = productCategoryMap.get(item.productId);
      const isEligibleCategory =
        categoryId !== undefined && eligibleCategoryIds.includes(categoryId);

      return isEligibleProduct || isEligibleCategory;
    });

    if (!hasEligibleItem) {
      return {
        valid: false,
        error:
          "Este cupón no es aplicable a ninguno de los productos en tu carrito",
      };
    }
  }

  // 9. Todo válido
  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: parseFloat(coupon.value),
      eligibleProductIds,
      eligibleCategoryIds,
    },
  };
}

/**
 * Valida un cupón sin items (para verificación previa)
 */
export async function validateCouponBasic(
  couponCode: string,
  userId?: number
): Promise<CouponValidationResult> {
  // Buscar el cupón
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, couponCode))
    .limit(1);

  if (!coupon) {
    return {
      valid: false,
      error: "Cupón no encontrado",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      error: "Este cupón no está activo",
    };
  }

  const now = new Date();

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      error: "Este cupón aún no está disponible",
    };
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return {
      valid: false,
      error: "Este cupón ha expirado",
    };
  }

  if (coupon.maxUses !== null) {
    const [redemptionCount] = await db
      .select({ count: count() })
      .from(couponRedemptions)
      .where(eq(couponRedemptions.couponId, coupon.id));

    if (redemptionCount && redemptionCount.count >= coupon.maxUses) {
      return {
        valid: false,
        error: "Este cupón ya alcanzó su límite de usos",
      };
    }
  }

  if (userId && coupon.maxUsesPerUser !== null) {
    const [userRedemptionCount] = await db
      .select({ count: count() })
      .from(couponRedemptions)
      .where(
        and(
          eq(couponRedemptions.couponId, coupon.id),
          eq(couponRedemptions.userId, userId)
        )
      );

    if (
      userRedemptionCount &&
      userRedemptionCount.count >= coupon.maxUsesPerUser
    ) {
      return {
        valid: false,
        error: "Ya has usado este cupón el máximo de veces permitidas",
      };
    }
  }

  const eligibleProductIds = await db
    .select({ productId: couponProducts.productId })
    .from(couponProducts)
    .where(eq(couponProducts.couponId, coupon.id))
    .then((rows) => rows.map((r) => r.productId));

  const eligibleCategoryIds = await db
    .select({ categoryId: couponCategories.categoryId })
    .from(couponCategories)
    .where(eq(couponCategories.couponId, coupon.id))
    .then((rows) => rows.map((r) => r.categoryId));

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: parseFloat(coupon.value),
      eligibleProductIds,
      eligibleCategoryIds,
    },
  };
}
