import { getProductBySlug } from "@/services/products/actions/product.actions";
import { hasUserReviewedProduct } from "@/services/reviews/actions/review.actions";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/app/(lobby)/products/[slug]/page.client";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const Page = async ({ params }: ProductDetailPageProps) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "active") {
    notFound();
  }

  const session = await getSession();

  // Check if user has already reviewed this product
  const hasReviewed = session.user
    ? await hasUserReviewedProduct(product.id, session.user.id)
    : false;

  return (
    <ProductDetailClient
      product={product}
      user={session.user || null}
      hasReviewed={hasReviewed}
    />
  );
};

export default Page;
