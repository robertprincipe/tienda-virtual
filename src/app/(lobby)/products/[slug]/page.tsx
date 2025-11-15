import { getProductBySlug } from "@/services/products/actions/product.actions";
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

  return <ProductDetailClient product={product} />;
};

export default Page;
