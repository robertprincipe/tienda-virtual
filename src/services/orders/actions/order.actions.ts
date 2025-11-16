"use server";

import { db } from "@/drizzle/db";
import { carts, cartItems, products, users } from "@/drizzle/schema";
import { orders, orderItems, couponRedemptions } from "@/drizzle/schema/orders";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { validateCoupon } from "@/lib/coupon-validation";
import { calculateOrderTotals } from "@/lib/order-calculations";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
  type ShippingAddress,
} from "@/schemas/checkout.schema";
import { nanoid } from "nanoid";
import type { CartItemWithProduct } from "@/services/cart/actions/cart.actions";

export interface PlaceOrderResult {
  success: boolean;
  error?: string;
  publicId?: string;
}

/**
 * Generar un public_id único para la orden
 */
function generatePublicId(): string {
  return `ORD-${nanoid(12)}`;
}

/**
 * Obtener dirección del usuario desde la base de datos
 */
async function getUserAddress(userId: number): Promise<ShippingAddress | null> {
  const [user] = await db
    .select({
      name: users.name,
      line1: users.line1,
      line2: users.line2,
      city: users.city,
      region: users.region,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.name || !user.line1 || !user.city) {
    return null;
  }

  return {
    fullName: user.name,
    line1: user.line1,
    line2: user.line2 || undefined,
    city: user.city,
    region: user.region || undefined,
    postalCode: undefined,
    countryCode: "PE", // Default
    phone: user.phone || undefined,
  };
}

/**
 * Cargar carrito con items completos
 */
async function loadCartForCheckout(cartId: number): Promise<{
  cart: typeof carts.$inferSelect;
  items: CartItemWithProduct[];
} | null> {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  if (!cart) {
    return null;
  }

  const items = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        slug: products.slug,
        stock: products.stock,
        categoryId: products.categoryId,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  return {
    cart,
    items: items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice || null,
      },
    })),
  };
}

/**
 * Server action principal para crear una orden
 */
export async function placeOrder(
  formData: CheckoutFormInput,
  cartId: number
): Promise<PlaceOrderResult> {
  try {
    // 1. Validar los datos del formulario
    const validated = checkoutFormSchema.parse(formData);

    // 2. Obtener sesión
    const session = await getSession();
    const userId = session.user?.id;

    // 3. Cargar el carrito
    const cartData = await loadCartForCheckout(cartId);

    if (!cartData) {
      return {
        success: false,
        error: "Carrito no encontrado",
      };
    }

    const { items } = cartData;

    if (items.length === 0) {
      return {
        success: false,
        error: "El carrito está vacío",
      };
    }

    // 4. Verificar stock de cada producto
    for (const item of items) {
      if (item.product.stock < item.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}`,
        };
      }
    }

    // 5. Determinar dirección de envío
    let shippingAddress: ShippingAddress;

    if (validated.useStoredAddress && userId) {
      const userAddress = await getUserAddress(userId);
      if (!userAddress) {
        return {
          success: false,
          error: "No se encontró dirección almacenada",
        };
      }
      shippingAddress = userAddress;
    } else {
      shippingAddress = {
        fullName: validated.fullName,
        line1: validated.line1,
        line2: validated.line2,
        city: validated.city,
        region: validated.region,
        postalCode: validated.postalCode,
        countryCode: validated.countryCode,
        phone: validated.phone,
      };
    }

    // 6. Validar y aplicar cupón si existe
    let couponData: {
      id: number;
      code: string;
      type: "percent" | "fixed";
      value: number;
      eligibleProductIds: number[];
      eligibleCategoryIds: number[];
    } | null = null;

    if (validated.couponCode) {
      const validation = await validateCoupon(
        validated.couponCode,
        items,
        userId
      );

      if (!validation.valid || !validation.coupon) {
        return {
          success: false,
          error: validation.error || "Cupón inválido",
        };
      }

      couponData = validation.coupon;
    }

    // 7. Calcular montos finales
    const calculation = calculateOrderTotals(items, {
      couponType: couponData?.type,
      couponValue: couponData?.value,
      eligibleProductIds: couponData?.eligibleProductIds,
      eligibleCategoryIds: couponData?.eligibleCategoryIds,
      countryCode: shippingAddress.countryCode,
    });

    // 8. Crear la orden en una transacción
    const result = await db.transaction(async (tx) => {
      // Generar publicId único
      const publicId = generatePublicId();

      // Insertar orden
      const [order] = await tx
        .insert(orders)
        .values({
          publicId,
          userId: userId || null,
          email: validated.email,
          status: "created",
          subtotal: calculation.subtotal.toFixed(2),
          discount: calculation.discount.toFixed(2),
          tax: calculation.tax.toFixed(2),
          shipping: calculation.shipping.toFixed(2),
          total: calculation.total.toFixed(2),
          couponCode: couponData?.code || null,
          notes: validated.notes || null,
          fullName: shippingAddress.fullName,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || null,
          city: shippingAddress.city,
          region: shippingAddress.region || null,
          postalCode: shippingAddress.postalCode || null,
          countryCode: shippingAddress.countryCode,
          phone: shippingAddress.phone || null,
        })
        .returning({ id: orders.id, publicId: orders.publicId });

      // Insertar order_items
      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          unitPrice: item.product.price,
          quantity: item.quantity.toString(),
        });

        // Reducir stock
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      // Registrar redención de cupón
      if (couponData) {
        await tx.insert(couponRedemptions).values({
          couponId: couponData.id,
          userId: userId || null,
          orderId: order.id,
        });
      }

      // Vaciar carrito (eliminar items, no el carrito)
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

      // Marcar carrito como convertido
      await tx
        .update(carts)
        .set({ status: "converted" })
        .where(eq(carts.id, cartId));

      return order;
    });

    return {
      success: true,
      publicId: result.publicId,
    };
  } catch (error) {
    console.error("Error placing order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la orden",
    };
  }
}

/**
 * Obtener detalles de una orden por publicId
 */
export async function getOrderByPublicId(publicId: string) {
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.publicId, publicId))
      .limit(1);

    if (!order) {
      return {
        success: false,
        error: "Orden no encontrada",
      };
    }

    // Obtener items de la orden
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        unitPrice: orderItems.unitPrice,
        quantity: orderItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      success: true,
      data: {
        ...order,
        items,
      },
    };
  } catch (error) {
    console.error("Error getting order:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener la orden",
    };
  }
}
