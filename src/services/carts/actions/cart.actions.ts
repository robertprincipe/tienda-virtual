"use server";

import { db } from "@/drizzle/db";
import { cartItems, carts, products, users } from "@/drizzle/schema";
import {
  cartFormSchema,
  type CartFormValues,
  type CartListItem,
  type CartWithRelations,
  type GetPaginatedCartsQueryProps,
} from "@/schemas/cart.schema";
import type { PaginatedCarts } from "@/types/cart";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";

const buildOrderBy = (sort?: string) => {
  const [column, direction] = sort?.split(".") ?? ["createdAt", "desc"];

  switch (column) {
    case "status":
      return direction === "asc" ? asc(carts.status) : desc(carts.status);
    case "expiresAt":
      return direction === "asc" ? asc(carts.expiresAt) : desc(carts.expiresAt);
    case "updatedAt":
      return direction === "asc" ? asc(carts.updatedAt) : desc(carts.updatedAt);
    case "createdAt":
    default:
      return direction === "asc"
        ? asc(carts.createdAt)
        : desc(carts.createdAt);
  }
};

const buildFilters = (input: GetPaginatedCartsQueryProps) => {
  const search = input.search?.trim();

  const searchFilter = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        sql`CAST(${carts.id} AS TEXT) ILIKE ${`%${search}%`}`
      )
    : undefined;

  return and(
    searchFilter,
    input.status ? eq(carts.status, input.status) : undefined,
    input.userId ? eq(carts.userId, input.userId) : undefined
  );
};

const dedupeItems = (items: CartFormValues["items"]) => {
  const map = new Map<number, number>();

  items.forEach((item) => {
    const current = map.get(item.productId) ?? 0;
    map.set(item.productId, current + item.quantity);
  });

  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

const ensureProductsExist = async (productIds: number[]) => {
  if (productIds.length === 0) {
    return;
  }

  const existing = await db.query.products.findMany({
    where: inArray(products.id, productIds),
    columns: {
      id: true,
    },
  });

  if (existing.length !== productIds.length) {
    throw new Error("Alguno de los productos seleccionados no existe");
  }
};

export const getCartsPaginated = async (
  input: GetPaginatedCartsQueryProps
): Promise<PaginatedCarts> => {
  const filters = buildFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const cartColumns = getTableColumns(carts);
  const userColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
  };

  const itemsCount = sql<number>`(
    select count(*)
    from cart_items
    where cart_items.cart_id = ${carts.id}
  )`.as("itemsCount");

  const totalQuantity = sql<number>`(
    select coalesce(sum(cart_items.quantity), 0)
    from cart_items
    where cart_items.cart_id = ${carts.id}
  )`.as("totalQuantity");

  const totalValue = sql<string>`(
    select coalesce(sum(cart_items.quantity * (products.price::numeric)), 0)::text
    from cart_items
    join products on products.id = cart_items.product_id
    where cart_items.cart_id = ${carts.id}
  )`.as("totalValue");

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...cartColumns,
        user: userColumns,
        itemsCount,
        totalQuantity,
        totalValue,
      })
      .from(carts)
      .leftJoin(users, eq(users.id, carts.userId))
      .where(filters)
      .orderBy(buildOrderBy(input.sort))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(carts)
      .leftJoin(users, eq(users.id, carts.userId))
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  return {
    message: "Carts fetched successfully",
    result: {
      data: data as CartListItem[],
      count: data.length,
      pageCount,
      total,
      nextPage: input.page < pageCount ? input.page + 1 : null,
      currentPage: input.page,
      minMax: {
        min: data.length > 0 ? (input.page - 1) * input.per_page + 1 : 0,
        max:
          data.length > 0
            ? (input.page - 1) * input.per_page + data.length
            : 0,
      },
    },
  };
};

export const getCart = async (id: number) => {
  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, id),
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
              price: true,
              stock: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return null;
  }

  return cart as CartWithRelations;
};

export const createCart = async (input: CartFormValues) => {
  const data = cartFormSchema.parse(input);
  const items = dedupeItems(data.items);
  await ensureProductsExist(items.map((item) => item.productId));

  const result = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(carts)
      .values({
        userId: data.userId ?? null,
        status: data.status,
        expiresAt: data.expiresAt ?? null,
      })
      .returning({ id: carts.id });

    if (items.length > 0) {
      await tx.insert(cartItems).values(
        items.map((item) => ({
          cartId: created.id,
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
    }

    return created.id;
  });

  return {
    message: `Carrito #${result} creado correctamente`,
    result: {
      id: result,
    },
  };
};

export const updateCart = async (input: CartFormValues & { id: number }) => {
  const { id, ...rest } = input;
  const data = cartFormSchema.parse(rest);
  const items = dedupeItems(data.items);
  await ensureProductsExist(items.map((item) => item.productId));

  const updated = await db.transaction(async (tx) => {
    const [cartRecord] = await tx
      .update(carts)
      .set({
        userId: data.userId ?? null,
        status: data.status,
        expiresAt: data.expiresAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, id))
      .returning({ id: carts.id });

    if (!cartRecord) {
      throw new Error("El carrito no existe");
    }

    await tx.delete(cartItems).where(eq(cartItems.cartId, id));

    if (items.length > 0) {
      await tx.insert(cartItems).values(
        items.map((item) => ({
          cartId: id,
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
    }

    return cartRecord.id;
  });

  return {
    message: `Carrito #${updated} actualizado correctamente`,
    result: {
      id: updated,
    },
  };
};

export const deleteCart = async (id: number) => {
  const deleted = await db.transaction(async (tx) => {
    await tx.delete(cartItems).where(eq(cartItems.cartId, id));

    const [removed] = await tx
      .delete(carts)
      .where(eq(carts.id, id))
      .returning({ id: carts.id });

    return removed?.id;
  });

  if (!deleted) {
    throw new Error("El carrito no existe");
  }

  return {
    message: `Carrito #${deleted} eliminado correctamente`,
    result: {
      id: deleted,
    },
  };
};

export const getCartUsers = async () => {
  return await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: (users, { asc }) => asc(users.name),
  });
};
