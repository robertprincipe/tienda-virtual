import { getCategories } from "@/services/categories/actions/category.actions";
import { getProduct } from "@/services/products/actions/product.actions";
import { notFound } from "next/navigation";

import EditProductPage from "./page.client";

type PageProps = {
  params: Promise<{ productId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const productId = Number(resolvedParams.productId);

  const [product, categories] = await Promise.all([
    getProduct(productId),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <EditProductPage product={product} categories={categories} />;
};

export default Page;
