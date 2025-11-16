"use server";

import { db } from "@/drizzle/db";
import { categories, productImages, products } from "@/drizzle/schema";
import { slugify } from "@/lib/utils";
import {
  productFormSchema,
  type GetPaginatedProductsQueryProps,
  type ProductFormValues,
  type ProductListItem,
  type ProductWithRelations,
} from "@/schemas/product.schema";
import type { PaginatedProducts } from "@/types/product";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  sql,
} from "drizzle-orm";

const decimalToDbValue = (value?: number | null) => {
  if (value === undefined || value === null) {
    return null;
  }

  return value.toString();
};

const buildOrderBy = (sort?: string) => {
  const [column, direction] = sort?.split(".") ?? ["createdAt", "desc"];

  switch (column) {
    case "name":
      return direction === "asc" ? asc(products.name) : desc(products.name);
    case "price":
      return direction === "asc" ? asc(products.price) : desc(products.price);
    case "stock":
      return direction === "asc" ? asc(products.stock) : desc(products.stock);
    case "status":
      return direction === "asc" ? asc(products.status) : desc(products.status);
    case "createdAt":
    default:
      return direction === "asc"
        ? asc(products.createdAt)
        : desc(products.createdAt);
  }
};

const buildFilters = (input: GetPaginatedProductsQueryProps) => {
  const categoryFilter =
    input.categoryId &&
    Array.isArray(input.categoryId) &&
    input.categoryId.length > 0
      ? sql`${products.categoryId} IN (${sql.join(
          input.categoryId.map((id) => sql`${id}`),
          sql`, `
        )})`
      : undefined;

  return and(
    input.search ? ilike(products.name, `%${input.search}%`) : undefined,
    categoryFilter,
    input.status ? eq(products.status, input.status) : undefined,
    input.minPrice
      ? sql`CAST(${products.price} AS DECIMAL) >= ${input.minPrice}`
      : undefined,
    input.maxPrice
      ? sql`CAST(${products.price} AS DECIMAL) <= ${input.maxPrice}`
      : undefined,
    input.inStock !== undefined
      ? input.inStock
        ? sql`${products.stock} > 0`
        : sql`${products.stock} = 0 OR ${products.stock} IS NULL`
      : undefined
  );
};

export const getProductsPaginated = async (
  input: GetPaginatedProductsQueryProps
): Promise<PaginatedProducts> => {
  const filters = buildFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const productColumns = getTableColumns(products);
  const categoryColumns = {
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
  };

  const primaryImage = sql<string | null>`(
    select product_images.image_url
    from product_images
    where product_images.product_id = ${products.id}
    order by product_images.sort_order asc
    limit 1
  )`.as("primaryImage");

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...productColumns,
        category: categoryColumns,
        primaryImage,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(filters)
      .orderBy(buildOrderBy(input.sort))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(products)
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  return {
    message: "Products fetched successfully",
    result: {
      data: data as ProductListItem[],
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

export const getProducts = async () => {
  const items = await db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      price: true,
    },
    orderBy: (products, { asc }) => asc(products.name),
  });

  return items;
};

export const getProduct = async (id: number) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      images: {
        orderBy: (productImages, { asc }) => asc(productImages.sortOrder),
      },
    },
  });

  return product as ProductWithRelations | null;
};

export const getProductBySlug = async (slug: string) => {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      images: {
        orderBy: (productImages, { asc }) => asc(productImages.sortOrder),
      },
    },
  });

  return product as ProductWithRelations | null;
};

export const createProduct = async (input: ProductFormValues) => {
  const data = productFormSchema.parse(input);

  const slugValue = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  const result = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(products)
      .values({
        name: data.name,
        slug: slugValue,
        sku: data.sku,
        categoryId: data.categoryId,
        shortDesc: data.shortDesc ?? null,
        description: data.description || null,
        stock: data.stock ?? 0,
        price: decimalToDbValue(data.price) ?? "0",
        compareAtPrice: decimalToDbValue(data.compareAtPrice),
        purchasePrice: decimalToDbValue(data.purchasePrice),
        weightGrams: decimalToDbValue(data.weightGrams),
        length: decimalToDbValue(data.length),
        width: decimalToDbValue(data.width),
        height: decimalToDbValue(data.height),
        status: data.status,
      })
      .returning({ id: products.id });

    if (data.images?.length) {
      await tx.insert(productImages).values(
        data.images.map((image, index) => ({
          productId: created.id,
          imageUrl: image.url,
          altText: image.altText,
          sortOrder: index,
        }))
      );
    }

    return created;
  });

  return {
    message: `Producto con id ${result.id} creado correctamente`,
    result: {
      id: result.id,
    },
  };
};

export const updateProduct = async (
  input: ProductFormValues & { id: number }
) => {
  const { id, ...rest } = input;
  const data = productFormSchema.parse(rest);

  const slugValue = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(products)
      .set({
        name: data.name,
        slug: slugValue,
        sku: data.sku,
        categoryId: data.categoryId,
        shortDesc: data.shortDesc ?? null,
        description: data.description || null,
        stock: data.stock ?? 0,
        price: decimalToDbValue(data.price) ?? "0",
        compareAtPrice: decimalToDbValue(data.compareAtPrice),
        purchasePrice: decimalToDbValue(data.purchasePrice),
        weightGrams: decimalToDbValue(data.weightGrams),
        length: decimalToDbValue(data.length),
        width: decimalToDbValue(data.width),
        height: decimalToDbValue(data.height),
        status: data.status,
      })
      .where(eq(products.id, id))
      .returning({ id: products.id });

    await tx.delete(productImages).where(eq(productImages.productId, id));

    if (data.images?.length) {
      await tx.insert(productImages).values(
        data.images.map((image, index) => ({
          productId: id,
          imageUrl: image.url,
          altText: image.altText,
          sortOrder: index,
        }))
      );
    }

    return updated;
  });

  return {
    message: `Producto con id ${result.id} actualizado correctamente`,
    result: {
      id: result.id,
    },
  };
};

export const deleteProduct = async (id: number) => {
  const result = await db.transaction(async (tx) => {
    await tx.delete(productImages).where(eq(productImages.productId, id));

    const [deleted] = await tx
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deleted;
  });

  return {
    message: `Producto con id ${result.id} eliminado correctamente`,
    result: {
      id: result.id,
    },
  };
};

/**
 * Get featured products (active products with images, limited to specified count)
 * @param limit - Maximum number of products to return (default: 8)
 */
export const getFeaturedProducts = async (limit = 8) => {
  const items = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      shortDesc: products.shortDesc,
      description: products.description,
      stock: products.stock,
      primaryImage: sql<string | null>`(
        select product_images.image_url
        from product_images
        where product_images.product_id = ${products.id}
        order by product_images.sort_order asc
        limit 1
      )`.as("primaryImage"),
    })
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  return items;
};
