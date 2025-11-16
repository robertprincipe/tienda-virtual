"use server";

import { db } from "@/drizzle/db";
import { productReviews } from "@/drizzle/schema/orders";
import { products } from "@/drizzle/schema/products";
import { users } from "@/drizzle/schema/users";
import { getSession } from "@/lib/session";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/schemas/review.schema";
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
import {
  reviewFormSchema,
  type GetPaginatedReviewsQueryProps,
  type ReviewFormValues,
  type ReviewListItem,
  type ReviewWithRelations,
} from "@/schemas/product-review.schema";
import type { PaginatedReviews } from "@/types/review";

/**
 * Create a product review
 * @param input - Review data (productId, rating, title, body)
 */
export const createReview = async (input: CreateReviewInput) => {
  const session = await getSession();
  if (!session.user) {
    throw new Error("Debes iniciar sesión para dejar una reseña");
  }

  const userId = session.user.id;

  // Validate input
  const data = createReviewSchema.parse(input);

  // Verify product exists and is active
  const product = await db.query.products.findFirst({
    where: eq(products.id, data.productId),
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (product.status !== "active") {
    throw new Error("No se pueden dejar reseñas en este producto");
  }

  // Check if user already reviewed this product
  const existingReview = await db.query.productReviews.findFirst({
    where: (reviews, { and, eq }) =>
      and(eq(reviews.productId, data.productId), eq(reviews.userId, userId)),
  });

  if (existingReview) {
    throw new Error("Ya has dejado una reseña para este producto");
  }

  // Create review (auto-approved by default)
  const [review] = await db
    .insert(productReviews)
    .values({
      productId: data.productId,
      userId: userId,
      rating: data.rating.toString(), // Convert to string for decimal type
      title: data.title || null,
      body: data.body || null,
      isApproved: true, // Auto-approved
    })
    .returning();

  return review;
};

/**
 * Check if user has already reviewed a product
 * @param productId - Product ID to check
 * @param userId - User ID to check
 */
export const hasUserReviewedProduct = async (
  productId: number,
  userId: number
): Promise<boolean> => {
  const existingReview = await db.query.productReviews.findFirst({
    where: (reviews, { and, eq }) =>
      and(eq(reviews.productId, productId), eq(reviews.userId, userId)),
  });

  return !!existingReview;
};

/**
 * Get approved reviews for a product
 * @param productId - Product ID
 */
export const getApprovedReviews = async (productId: number) => {
  const reviews = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      body: productReviews.body,
      createdAt: productReviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
        photoUrl: users.photoUrl,
      },
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.isApproved, true)
      )
    )
    .orderBy(desc(productReviews.createdAt));

  return reviews;
};

const ratingToDbValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

const buildReviewSort = (sort?: string) => {
  const [column, direction] = sort?.split(".") ?? ["createdAt", "desc"];

  switch (column) {
    case "rating":
      return direction === "asc"
        ? asc(productReviews.rating)
        : desc(productReviews.rating);
    case "isApproved":
      return direction === "asc"
        ? asc(productReviews.isApproved)
        : desc(productReviews.isApproved);
    case "createdAt":
    default:
      return direction === "asc"
        ? asc(productReviews.createdAt)
        : desc(productReviews.createdAt);
  }
};

const buildReviewFilters = (input: GetPaginatedReviewsQueryProps) => {
  const search = input.search?.trim();

  const searchFilter = search
    ? or(
        ilike(productReviews.title, `%${search}%`),
        ilike(productReviews.body, `%${search}%`),
        ilike(products.name, `%${search}%`),
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    : undefined;

  return and(
    searchFilter,
    input.isApproved !== undefined
      ? eq(productReviews.isApproved, input.isApproved)
      : undefined
  );
};

export const getReviewsPaginated = async (
  input: GetPaginatedReviewsQueryProps
): Promise<PaginatedReviews> => {
  const filters = buildReviewFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const reviewColumns = getTableColumns(productReviews);
  const productColumns = {
    id: products.id,
    name: products.name,
    slug: products.slug,
  };
  const userColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
  };

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...reviewColumns,
        product: productColumns,
        user: userColumns,
      })
      .from(productReviews)
      .leftJoin(products, eq(products.id, productReviews.productId))
      .leftJoin(users, eq(users.id, productReviews.userId))
      .where(filters)
      .orderBy(buildReviewSort(input.sort))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(productReviews)
      .leftJoin(products, eq(products.id, productReviews.productId))
      .leftJoin(users, eq(users.id, productReviews.userId))
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  // Convert rating from string to number for each review
  const dataWithNumberRating = data.map((review) => ({
    ...review,
    rating: Number(review.rating),
  })) satisfies ReviewListItem[];

  return {
    message: "Reviews fetched successfully",
    result: {
      data: dataWithNumberRating,
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

export const getReview = async (id: number) => {
  const review = await db.query.productReviews.findFirst({
    where: eq(productReviews.id, id),
    with: {
      product: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!review) {
    return null;
  }

  return {
    ...review,
    rating: Number(review.rating),
  } satisfies ReviewWithRelations;
};

export const createReviewAdmin = async (input: ReviewFormValues) => {
  const data = reviewFormSchema.parse(input);

  const [created] = await db
    .insert(productReviews)
    .values({
      productId: data.productId,
      userId: data.userId ?? null,
      rating: ratingToDbValue(data.rating),
      title: data.title ?? null,
      body: data.body ?? null,
      isApproved: data.isApproved ?? false,
    })
    .returning({ id: productReviews.id });

  return {
    message: `Reseña #${created.id} creada correctamente`,
    result: {
      id: created.id,
    },
  };
};

export const updateReviewAdmin = async (
  input: ReviewFormValues & { id: number }
) => {
  const { id, ...rest } = input;
  const data = reviewFormSchema.parse(rest);

  const [updated] = await db
    .update(productReviews)
    .set({
      productId: data.productId,
      userId: data.userId ?? null,
      rating: ratingToDbValue(data.rating),
      title: data.title ?? null,
      body: data.body ?? null,
      isApproved: data.isApproved ?? false,
      updatedAt: new Date(),
    })
    .where(eq(productReviews.id, id))
    .returning({ id: productReviews.id });

  if (!updated) {
    throw new Error("La reseña no existe");
  }

  return {
    message: `Reseña #${updated.id} actualizada correctamente`,
    result: {
      id: updated.id,
    },
  };
};

export const deleteReviewAdmin = async (id: number) => {
  const [deleted] = await db
    .delete(productReviews)
    .where(eq(productReviews.id, id))
    .returning({ id: productReviews.id });

  if (!deleted) {
    throw new Error("La reseña no existe");
  }

  return {
    message: `Reseña #${deleted.id} eliminada correctamente`,
    result: {
      id: deleted.id,
    },
  };
};

export const getReviewUsers = async () => {
  return await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: (users, { asc }) => asc(users.name),
  });
};

/**
 * Get random approved reviews for homepage testimonials
 * @param limit - Maximum number of reviews to return (default: 4)
 */
export const getRandomApprovedReviews = async (limit = 4) => {
  const reviews = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      body: productReviews.body,
      createdAt: productReviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
        photoUrl: users.photoUrl,
      },
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
      },
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .leftJoin(products, eq(productReviews.productId, products.id))
    .where(eq(productReviews.isApproved, true))
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return reviews.map((review) => ({
    ...review,
    rating: Number(review.rating),
  }));
};
