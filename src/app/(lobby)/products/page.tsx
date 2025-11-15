import { publicProductsSchema } from "@/schemas/product.schema";
import { getProductsPaginated } from "@/services/products/actions/product.actions";
import { getCategories } from "@/services/categories/actions/category.actions";
import { type SearchParams } from "@/types/params";
import ProductsClient from "@/app/(lobby)/products/page.client";

type ProductsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: ProductsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = publicProductsSchema.parse(resolvedSearchParams);

  const [products, categories] = await Promise.all([
    getProductsPaginated(search),
    getCategories(),
  ]);

  return <ProductsClient products={products} categories={categories} />;
};

export default Page;
