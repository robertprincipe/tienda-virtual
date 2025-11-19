import { notFound } from "next/navigation";
import { Metadata } from "next";

import {
  getReview,
  getReviewUsers,
} from "@/services/reviews/actions/review.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import EditReviewPage from "./page.client";

export const metadata: Metadata = {
  title: "Editar Reseña",
  description:
    "Modifica una reseña existente. Actualiza calificación, comentario y estado de aprobación.",
};

type PageProps = {
  params: Promise<{ reviewId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const reviewId = Number(resolvedParams.reviewId);

  const [review, users, products] = await Promise.all([
    getReview(reviewId),
    getReviewUsers(),
    getProducts(),
  ]);

  if (!review) {
    notFound();
  }

  return <EditReviewPage review={review} users={users} products={products} />;
};

export default Page;
