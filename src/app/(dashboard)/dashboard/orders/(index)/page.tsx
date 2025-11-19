import { paginatedOrdersSchema } from "@/schemas/order.schema";
import { getOrdersPaginated } from "@/services/orders/actions/order.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import OrdersIndex from "./page.client";

export const metadata: Metadata = {
  title: "Pedidos",
  description:
    "Administra todos los pedidos de tu tienda. Visualiza el estado de las órdenes, procesa pagos y gestiona envíos de manera eficiente.",
};

type OrdersPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: OrdersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = paginatedOrdersSchema.parse(resolvedSearchParams);

  const ordersPromise = getOrdersPaginated(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <OrdersIndex ordersPromise={ordersPromise} />
    </div>
  );
};

export default Page;
