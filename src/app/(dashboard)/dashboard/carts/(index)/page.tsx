import { paginatedCartsSchema } from "@/schemas/cart.schema";
import { getCartsPaginated } from "@/services/carts/actions/cart.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import CartsIndex from "./page.client";

export const metadata: Metadata = {
  title: "Carritos",
  description:
    "Visualiza y gestiona los carritos de compra de tus clientes. Analiza carritos abandonados y las tendencias de compra en tiempo real.",
};

type CartsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: CartsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = paginatedCartsSchema.parse(resolvedSearchParams);

  const cartsPromise = getCartsPaginated(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CartsIndex cartsPromise={cartsPromise} />
    </div>
  );
};

export default Page;
