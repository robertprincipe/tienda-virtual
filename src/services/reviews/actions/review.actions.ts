"use server";

import { db } from "@/drizzle/db";
import { productReviews } from "@/drizzle/schema/orders";
import { products } from "@/drizzle/schema/products";
import { getSession } from "@/lib/session";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/schemas/review.schema";
import { eq } from "drizzle-orm";

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
