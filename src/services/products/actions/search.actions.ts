"use server";

import { db } from "@/drizzle/db";
import { productImages, products } from "@/drizzle/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

/**
 * Search products for dropdown (limited results)
 * @param query - Search query
 * @param limit - Maximum number of results (default 3)
 */
export const searchProductsDropdown = async (
  query: string,
  limit: number = 3
) => {
  const searchTerm = query.trim();

  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const results = await db
    .selectDistinct({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      createdAt: products.createdAt,
      image: sql<string | null>`(
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = products.id
        ORDER BY pi.sort_order ASC
        LIMIT 1
      )`,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        or(
          ilike(products.name, `%${searchTerm}%`),
          ilike(products.description, `%${searchTerm}%`),
          ilike(products.sku, `%${searchTerm}%`)
        )
      )
    )
    .orderBy(desc(products.createdAt))
    .limit(limit);

  return results;
};

/**
 * Search products for search page (paginated)
 * @param query - Search query
 * @param page - Page number
 * @param perPage - Items per page
 * @param sort - Sort option
 */
export const searchProducts = async ({
  query,
  page = 1,
  perPage = 12,
  sort = "relevance",
}: {
  query: string;
  page?: number;
  perPage?: number;
  sort?: string;
}) => {
  const searchTerm = query.trim();
  const offset = (page - 1) * perPage;

  if (!searchTerm || searchTerm.length < 2) {
    return {
      products: [],
      total: 0,
      page,
      perPage,
      totalPages: 0,
    };
  }

  const whereCondition = and(
    eq(products.status, "active"),
    or(
      ilike(products.name, `%${searchTerm}%`),
      ilike(products.description, `%${searchTerm}%`),
      ilike(products.sku, `%${searchTerm}%`)
    )
  );

  // Get total count
  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereCondition);

  // Build order by clause
  let orderByClause;
  switch (sort) {
    case "price-asc":
      orderByClause = products.price;
      break;
    case "price-desc":
      orderByClause = desc(products.price);
      break;
    case "name-asc":
      orderByClause = products.name;
      break;
    case "name-desc":
      orderByClause = desc(products.name);
      break;
    case "relevance":
    default:
      // Order by most recent for relevance
      orderByClause = desc(products.createdAt);
      break;
  }

  // Get products with images
  const results = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      shortDesc: products.shortDesc,
      image: sql<string | null>`(
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = products.id
        ORDER BY pi.sort_order ASC
        LIMIT 1
      )`,
    })
    .from(products)
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(perPage)
    .offset(offset);

  const totalPages = Math.ceil(total / perPage);

  return {
    products: results,
    total,
    page,
    perPage,
    totalPages,
  };
};
