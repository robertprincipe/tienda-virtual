import { paginatedProductsSchema } from "@/schemas/product.schema";
import { getProductsPaginated } from "@/services/products/actions/product.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import ProductsIndex from "./page.client";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Gestiona el catálogo de productos de tu tienda. Agrega nuevos productos, actualiza precios, controla inventario y administra la disponibilidad.",
};

type ProductsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: ProductsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = paginatedProductsSchema.parse(resolvedSearchParams);

  const productsPromise = getProductsPaginated(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProductsIndex productsPromise={productsPromise} />
    </div>
  );
};

export default Page;
