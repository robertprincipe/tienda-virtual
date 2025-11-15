import { paginatedProductsSchema } from "@/schemas/product.schema";
import { getProductsPaginated } from "@/services/products/actions/product.actions";
import { type SearchParams } from "@/types/params";

import ProductsIndex from "./page.client";

type ProductsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: ProductsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = paginatedProductsSchema.parse(resolvedSearchParams);

  const products = await getProductsPaginated(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProductsIndex products={products} />
    </div>
  );
};

export default Page;
