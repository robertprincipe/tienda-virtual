"use server";

import { db } from "@/drizzle/db";
import {
  categories,
  couponCategories,
  couponProducts,
  coupons,
  products,
} from "@/drizzle/schema";
import {
  couponFormSchema,
  type CouponFormValues,
  type CouponListItem,
  type CouponWithRelations,
  type GetPaginatedCouponsQueryProps,
} from "@/schemas/coupon.schema";
import type { PaginatedCoupons } from "@/types/coupon";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";

const decimalOrNull = (value?: number | null) => {
  if (value === undefined || value === null) {
    return null;
  }

  return value.toString();
};

const buildOrderBy = (input: GetPaginatedCouponsQueryProps) => {
  const column = input.sort_by ?? "createdAt";
  const direction = input.sort_order ?? "desc";

  switch (column) {
    case "code":
      return direction === "asc" ? asc(coupons.code) : desc(coupons.code);
    case "type":
      return direction === "asc" ? asc(coupons.type) : desc(coupons.type);
    case "value":
      return direction === "asc" ? asc(coupons.value) : desc(coupons.value);
    case "startsAt":
      return direction === "asc"
        ? asc(coupons.startsAt)
        : desc(coupons.startsAt);
    case "endsAt":
      return direction === "asc"
        ? asc(coupons.endsAt)
        : desc(coupons.endsAt);
    case "createdAt":
    default:
      return direction === "asc"
        ? asc(coupons.createdAt)
        : desc(coupons.createdAt);
  }
};

const buildFilters = (input: GetPaginatedCouponsQueryProps) => {
  const now = new Date();

  const isValidCondition = and(
    eq(coupons.isActive, true),
    or(isNull(coupons.startsAt), lte(coupons.startsAt, now)),
    or(isNull(coupons.endsAt), gte(coupons.endsAt, now))
  );

  const isInvalidCondition = or(
    eq(coupons.isActive, false),
    and(isNotNull(coupons.startsAt), gt(coupons.startsAt, now)),
    and(isNotNull(coupons.endsAt), lt(coupons.endsAt, now))
  );

  return and(
    input.search ? ilike(coupons.code, `%${input.search}%`) : undefined,
    input.type ? eq(coupons.type, input.type) : undefined,
    typeof input.is_active === "boolean"
      ? eq(coupons.isActive, input.is_active)
      : undefined,
    typeof input.is_valid === "boolean"
      ? input.is_valid
        ? isValidCondition
        : isInvalidCondition
      : undefined
  );
};

export const getCouponsPaginated = async (
  input: GetPaginatedCouponsQueryProps
): Promise<PaginatedCoupons> => {
  const filters = buildFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const couponColumns = getTableColumns(coupons);

  const productsCount = sql<number>`(
    select count(*)
    from coupon_products
    where coupon_products.coupon_id = ${coupons.id}
  )`.as("productsCount");

  const categoriesCount = sql<number>`(
    select count(*)
    from coupon_categories
    where coupon_categories.coupon_id = ${coupons.id}
  )`.as("categoriesCount");

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...couponColumns,
        productsCount,
        categoriesCount,
      })
      .from(coupons)
      .where(filters)
      .orderBy(buildOrderBy(input))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(coupons)
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page) || 1;

  return {
    data: data as CouponListItem[],
    total,
    pageCount,
    nextPage: input.page < pageCount ? input.page + 1 : null,
  };
};

export const getCoupon = async (id: number): Promise<CouponWithRelations | null> => {
  const coupon = await db.query.coupons.findFirst({
    where: eq(coupons.id, id),
  });

  if (!coupon) {
    return null;
  }

  const [relatedProducts, relatedCategories] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
      })
      .from(couponProducts)
      .innerJoin(products, eq(couponProducts.productId, products.id))
      .where(eq(couponProducts.couponId, id)),
    db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(couponCategories)
      .innerJoin(categories, eq(couponCategories.categoryId, categories.id))
      .where(eq(couponCategories.couponId, id)),
  ]);

  return {
    ...coupon,
    products: relatedProducts,
    categories: relatedCategories,
  };
};

export const createCoupon = async (input: CouponFormValues) => {
  const data = couponFormSchema.parse(input);

  const result = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(coupons)
      .values({
        code: data.code.trim(),
        type: data.type,
        value: decimalOrNull(data.value) ?? "0",
        minSubtotal: decimalOrNull(data.minSubtotal),
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        isActive: data.isActive ?? true,
      })
      .returning({ id: coupons.id });

    if (data.productIds?.length) {
      await tx.insert(couponProducts).values(
        data.productIds.map((productId) => ({
          couponId: created.id,
          productId,
        }))
      );
    }

    if (data.categoryIds?.length) {
      await tx.insert(couponCategories).values(
        data.categoryIds.map((categoryId) => ({
          couponId: created.id,
          categoryId,
        }))
      );
    }

    return created;
  });

  return {
    message: `Cupón con id ${result.id} creado correctamente`,
    result: {
      id: result.id,
    },
  };
};

export const updateCoupon = async (input: CouponFormValues & { id: number }) => {
  const { id, ...rest } = input;
  const data = couponFormSchema.parse(rest);

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(coupons)
      .set({
        code: data.code.trim(),
        type: data.type,
        value: decimalOrNull(data.value) ?? "0",
        minSubtotal: decimalOrNull(data.minSubtotal),
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        isActive: data.isActive ?? true,
      })
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });

    await tx.delete(couponProducts).where(eq(couponProducts.couponId, id));
    await tx.delete(couponCategories).where(eq(couponCategories.couponId, id));

    if (data.productIds?.length) {
      await tx.insert(couponProducts).values(
        data.productIds.map((productId) => ({ couponId: id, productId }))
      );
    }

    if (data.categoryIds?.length) {
      await tx.insert(couponCategories).values(
        data.categoryIds.map((categoryId) => ({ couponId: id, categoryId }))
      );
    }

    return updated;
  });

  return {
    message: `Cupón con id ${result.id} actualizado correctamente`,
    result: {
      id: result.id,
    },
  };
};

export const deleteCoupon = async (id: number) => {
  const [deleted] = await db
    .delete(coupons)
    .where(eq(coupons.id, id))
    .returning({ id: coupons.id });

  return {
    message: `Cupón con id ${deleted.id} eliminado correctamente`,
    result: {
      id: deleted.id,
    },
  };
};
