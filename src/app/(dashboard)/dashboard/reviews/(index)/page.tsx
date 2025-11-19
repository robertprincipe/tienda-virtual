import { paginatedReviewsSchema } from "@/schemas/product-review.schema";
import { getReviewsPaginated } from "@/services/reviews/actions/review.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import ReviewsIndex from "./page.client";

export const metadata: Metadata = {
  title: "Reseñas",
  description:
    "Administra las reseñas y calificaciones de productos. Modera comentarios, responde a clientes y mantén la calidad de las opiniones publicadas.",
};

type ReviewsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: ReviewsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = paginatedReviewsSchema.parse(resolvedSearchParams);

  const reviewsPromise = getReviewsPaginated(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ReviewsIndex reviewsPromise={reviewsPromise} />
    </div>
  );
};

export default Page;
