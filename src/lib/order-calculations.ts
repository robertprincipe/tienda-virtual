/**
 * Utilities para cálculo de montos en órdenes
 */

import type { CartItemWithProduct } from "@/services/cart/actions/cart.actions";

export interface OrderCalculation {
  subtotal: number;
  eligibleSubtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface DiscountResult {
  discount: number;
  eligibleItemIds: number[];
  appliedToItems: Array<{
    itemId: number;
    productId: number;
    productName: string;
    discount: number;
  }>;
}

/**
 * Calcula el subtotal general del carrito
 */
export function calculateSubtotal(items: CartItemWithProduct[]): number {
  return items.reduce((acc, item) => {
    const price = parseFloat(item.product.price);
    return acc + price * item.quantity;
  }, 0);
}

type CartItemWithCategory = CartItemWithProduct & {
  product: CartItemWithProduct["product"] & { categoryId?: number };
};

/**
 * Calcula el subtotal elegible basado en productos/categorías específicas
 */
export function calculateEligibleSubtotal(
  items: CartItemWithCategory[],
  eligibleProductIds: number[] = [],
  eligibleCategoryIds: number[] = []
): { subtotal: number; eligibleItemIds: number[] } {
  // Si no hay restricciones, todo es elegible
  const hasRestrictions =
    eligibleProductIds.length > 0 || eligibleCategoryIds.length > 0;

  if (!hasRestrictions) {
    return {
      subtotal: calculateSubtotal(items),
      eligibleItemIds: items.map((item) => item.id),
    };
  }

  let subtotal = 0;
  const eligibleItemIds: number[] = [];

  items.forEach((item) => {
    const isEligible =
      eligibleProductIds.includes(item.productId) ||
      (item.product.categoryId !== undefined &&
        eligibleCategoryIds.includes(item.product.categoryId));

    if (isEligible) {
      const price = parseFloat(item.product.price);
      subtotal += price * item.quantity;
      eligibleItemIds.push(item.id);
    }
  });

  return { subtotal, eligibleItemIds };
}

/**
 * Calcula el descuento aplicado por un cupón
 */
export function calculateDiscount(
  couponType: "percent" | "fixed",
  couponValue: number,
  eligibleSubtotal: number,
  items: CartItemWithCategory[],
  eligibleItemIds: number[]
): DiscountResult {
  let discount = 0;
  const appliedToItems: DiscountResult["appliedToItems"] = [];

  if (couponType === "percent") {
    // Descuento porcentual
    discount = (eligibleSubtotal * couponValue) / 100;

    // Calcular descuento proporcional por item
    if (eligibleSubtotal > 0) {
      items.forEach((item) => {
        if (eligibleItemIds.includes(item.id)) {
          const itemSubtotal = parseFloat(item.product.price) * item.quantity;
          const itemDiscount = (itemSubtotal * couponValue) / 100;

          appliedToItems.push({
            itemId: item.id,
            productId: item.productId,
            productName: item.product.name,
            discount: itemDiscount,
          });
        }
      });
    }
  } else {
    // Descuento fijo
    discount = Math.min(couponValue, eligibleSubtotal);

    // Distribuir el descuento proporcionalmente entre items elegibles
    if (eligibleSubtotal > 0 && discount > 0) {
      items.forEach((item) => {
        if (eligibleItemIds.includes(item.id)) {
          const itemSubtotal = parseFloat(item.product.price) * item.quantity;
          const proportion = itemSubtotal / eligibleSubtotal;
          const itemDiscount = discount * proportion;

          appliedToItems.push({
            itemId: item.id,
            productId: item.productId,
            productName: item.product.name,
            discount: itemDiscount,
          });
        }
      });
    }
  }

  return {
    discount: Math.max(0, discount),
    eligibleItemIds,
    appliedToItems,
  };
}

/**
 * Calcula el tax (placeholder por ahora)
 * Puedes implementar lógica personalizada aquí
 */
export function calculateTax(
  subtotal: number,
  discount: number,
  taxRate: number = 0
): number {
  const taxableAmount = Math.max(0, subtotal - discount);
  return taxableAmount * taxRate;
}

/**
 * Calcula el shipping (placeholder por ahora)
 * Puedes implementar lógica personalizada aquí (por peso, destino, etc.)
 */
export function calculateShipping(
  items: CartItemWithProduct[],
  _countryCode?: string
): number {
  // Placeholder: envío gratis para pedidos > $50, sino $5
  const subtotal = calculateSubtotal(items);
  if (subtotal >= 50) {
    return 0;
  }
  return 5;
}

/**
 * Calcula todos los montos de una orden
 */
export function calculateOrderTotals(
  items: CartItemWithCategory[],
  options: {
    couponType?: "percent" | "fixed";
    couponValue?: number;
    eligibleProductIds?: number[];
    eligibleCategoryIds?: number[];
    taxRate?: number;
    countryCode?: string;
  } = {}
): OrderCalculation & { discountDetails?: DiscountResult } {
  const subtotal = calculateSubtotal(items);

  let discount = 0;
  let eligibleSubtotal = subtotal;
  let discountDetails: DiscountResult | undefined;

  // Si hay cupón, calcular descuento
  if (options.couponType && options.couponValue !== undefined) {
    const eligible = calculateEligibleSubtotal(
      items,
      options.eligibleProductIds || [],
      options.eligibleCategoryIds || []
    );

    eligibleSubtotal = eligible.subtotal;

    discountDetails = calculateDiscount(
      options.couponType,
      options.couponValue,
      eligibleSubtotal,
      items,
      eligible.eligibleItemIds
    );

    discount = discountDetails.discount;
  }

  const tax = calculateTax(subtotal, discount, options.taxRate || 0);
  const shipping = calculateShipping(items, options.countryCode);
  const total = Math.max(0, subtotal - discount + tax + shipping);

  return {
    subtotal,
    eligibleSubtotal,
    discount,
    tax,
    shipping,
    total,
    discountDetails,
  };
}
