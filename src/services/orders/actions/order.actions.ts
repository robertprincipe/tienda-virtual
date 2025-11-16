"use server";

import { db } from "@/drizzle/db";
import { carts, cartItems, products, users } from "@/drizzle/schema";
import { orders, orderItems, couponRedemptions } from "@/drizzle/schema/orders";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { cookies } from "next/headers";
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
import {
  orderFormSchema,
  type GetPaginatedOrdersQueryProps,
  type OrderFormValues,
  type OrderListItem,
  type OrderWithRelations,
} from "@/schemas/order.schema";
import type { PaginatedOrders } from "@/types/order";

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
        primaryImage: sql<string | null>`(
          select product_images.image_url
          from product_images
          where product_images.product_id = ${products.id}
          order by product_images.sort_order asc
          limit 1
        )`.as("primaryImage"),
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
        primaryImage: item.product.primaryImage,
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

    // Si es usuario anónimo, eliminar la cookie del carrito
    if (!userId) {
      const cookieStore = await cookies();
      cookieStore.delete("cart_id");
    }

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

type NormalizedOrderItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

const normalizeOrderItems = (
  items: OrderFormValues["items"]
): NormalizedOrderItem[] => {
  const map = new Map<number, NormalizedOrderItem>();

  items.forEach((item) => {
    const current = map.get(item.productId);
    if (current) {
      map.set(item.productId, {
        productId: item.productId,
        quantity: current.quantity + item.quantity,
        unitPrice: item.unitPrice,
      });
    } else {
      map.set(item.productId, {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }
  });

  return Array.from(map.values()).filter(
    (item) => item.quantity > 0 && item.unitPrice >= 0
  );
};

const decimalToDbValue = (value: number) => value.toFixed(2);

const buildOrderSort = (sort?: string) => {
  const [column, direction] = sort?.split(".") ?? ["placedAt", "desc"];

  switch (column) {
    case "status":
      return direction === "asc" ? asc(orders.status) : desc(orders.status);
    case "total":
      return direction === "asc" ? asc(orders.total) : desc(orders.total);
    case "createdAt":
      return direction === "asc"
        ? asc(orders.createdAt)
        : desc(orders.createdAt);
    case "placedAt":
    default:
      return direction === "asc" ? asc(orders.placedAt) : desc(orders.placedAt);
  }
};

const buildOrderFilters = (input: GetPaginatedOrdersQueryProps) => {
  const search = input.search?.trim();

  const searchFilter = search
    ? or(
        ilike(orders.publicId, `%${search}%`),
        ilike(orders.email, `%${search}%`),
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    : undefined;

  return and(
    searchFilter,
    input.status ? eq(orders.status, input.status) : undefined,
    input.from ? sql`${orders.placedAt} >= ${input.from}` : undefined,
    input.to ? sql`${orders.placedAt} <= ${input.to}` : undefined
  );
};

const calculateOrderAmounts = (
  items: NormalizedOrderItem[],
  data: OrderFormValues
) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const discount = data.discount ?? 0;
  const tax = data.tax ?? 0;
  const shipping = data.shipping ?? 0;
  const total = Math.max(0, subtotal - discount + tax + shipping);

  return { subtotal, discount, tax, shipping, total };
};

export const getOrdersPaginated = async (
  input: GetPaginatedOrdersQueryProps
): Promise<PaginatedOrders> => {
  const filters = buildOrderFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const orderColumns = getTableColumns(orders);
  const userColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
  };

  const itemsCount = sql<number>`(
    select count(*)
    from order_items
    where order_items.order_id = ${orders.id}
  )`.as("itemsCount");

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...orderColumns,
        user: userColumns,
        itemsCount,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(filters)
      .orderBy(buildOrderSort(input.sort))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  return {
    message: "Orders fetched successfully",
    result: {
      data: data as OrderListItem[],
      count: data.length,
      pageCount,
      total,
      nextPage: input.page < pageCount ? input.page + 1 : null,
      currentPage: input.page,
      minMax: {
        min: data.length > 0 ? (input.page - 1) * input.per_page + 1 : 0,
        max:
          data.length > 0 ? (input.page - 1) * input.per_page + data.length : 0,
      },
    },
  };
};

export const getOrder = async (id: number) => {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
          },
        },
        orderBy: (orderItems, { asc }) => asc(orderItems.id),
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  } as OrderWithRelations;
};

export const createOrder = async (input: OrderFormValues) => {
  const data = orderFormSchema.parse(input);
  const items = normalizeOrderItems(data.items);

  if (items.length === 0) {
    throw new Error("Agrega al menos un producto al pedido");
  }

  const totals = calculateOrderAmounts(items, data);

  const orderId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        publicId: generatePublicId(),
        userId: data.userId ?? null,
        email: data.email,
        status: data.status ?? "created",
        subtotal: decimalToDbValue(totals.subtotal),
        discount: decimalToDbValue(totals.discount),
        tax: decimalToDbValue(totals.tax),
        shipping: decimalToDbValue(totals.shipping),
        total: decimalToDbValue(totals.total),
        couponCode: data.couponCode ?? null,
        notes: data.notes ?? null,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        region: data.region ?? null,
        postalCode: data.postalCode ?? null,
        countryCode: data.countryCode,
        phone: data.phone ?? null,
        shippingMethodName: data.shippingMethodName ?? null,
        shippingCarrier: data.shippingCarrier ?? null,
        shippingTrackingNumber: data.shippingTrackingNumber ?? null,
        shippedAt: data.shippedAt ?? null,
        deliveredAt: data.deliveredAt ?? null,
        placedAt: data.placedAt ?? new Date(),
        canceledAt: data.canceledAt ?? null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      items.map((item) => ({
        orderId: created.id,
        productId: item.productId,
        unitPrice: decimalToDbValue(item.unitPrice),
        quantity: item.quantity.toString(),
      }))
    );

    return created.id;
  });

  return {
    message: `Orden #${orderId} creada correctamente`,
    result: {
      id: orderId,
    },
  };
};

export const updateOrder = async (input: OrderFormValues & { id: number }) => {
  const { id, ...rest } = input;
  const data = orderFormSchema.parse(rest);
  const items = normalizeOrderItems(data.items);

  if (items.length === 0) {
    throw new Error("Agrega al menos un producto al pedido");
  }

  const totals = calculateOrderAmounts(items, data);

  const updatedId = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orders)
      .set({
        userId: data.userId ?? null,
        email: data.email,
        status: data.status ?? "created",
        subtotal: decimalToDbValue(totals.subtotal),
        discount: decimalToDbValue(totals.discount),
        tax: decimalToDbValue(totals.tax),
        shipping: decimalToDbValue(totals.shipping),
        total: decimalToDbValue(totals.total),
        couponCode: data.couponCode ?? null,
        notes: data.notes ?? null,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        region: data.region ?? null,
        postalCode: data.postalCode ?? null,
        countryCode: data.countryCode,
        phone: data.phone ?? null,
        shippingMethodName: data.shippingMethodName ?? null,
        shippingCarrier: data.shippingCarrier ?? null,
        shippingTrackingNumber: data.shippingTrackingNumber ?? null,
        shippedAt: data.shippedAt ?? null,
        deliveredAt: data.deliveredAt ?? null,
        placedAt: data.placedAt ?? new Date(),
        canceledAt: data.canceledAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning({ id: orders.id });

    if (!updated) {
      throw new Error("La orden no existe");
    }

    await tx.delete(orderItems).where(eq(orderItems.orderId, id));

    await tx.insert(orderItems).values(
      items.map((item) => ({
        orderId: id,
        productId: item.productId,
        unitPrice: decimalToDbValue(item.unitPrice),
        quantity: item.quantity.toString(),
      }))
    );

    return updated.id;
  });

  return {
    message: `Orden #${updatedId} actualizada correctamente`,
    result: {
      id: updatedId,
    },
  };
};

export const deleteOrder = async (id: number) => {
  const [deleted] = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning({ id: orders.id });

  if (!deleted) {
    throw new Error("La orden no existe");
  }

  return {
    message: `Orden #${deleted.id} eliminada correctamente`,
    result: {
      id: deleted.id,
    },
  };
};

/**
 * Obtener órdenes de un usuario específico
 */
export async function getUserOrders(userId: number): Promise<{
  success: boolean;
  data?: OrderListItem[];
  error?: string;
}> {
  try {
    const userOrders = await db
      .select({
        ...getTableColumns(orders),
        itemsCount: sql<number>`(
          select count(*)
          from order_items
          where order_items.order_id = ${orders.id}
        )`.as("itemsCount"),
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.placedAt));

    return {
      success: true,
      data: userOrders as OrderListItem[],
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return {
      success: false,
      error: "Error al obtener las órdenes del usuario",
    };
  }
}

export const getOrderUsers = async () => {
  return await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: (users, { asc }) => asc(users.name),
  });
};
