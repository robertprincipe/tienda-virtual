import { paginatedCartsSchema } from "@/schemas/cart.schema";
import { getCartsPaginated } from "@/services/carts/actions/cart.actions";
import { type SearchParams } from "@/types/params";

import CartsIndex from "./page.client";

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
