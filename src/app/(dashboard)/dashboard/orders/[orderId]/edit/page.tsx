import { notFound } from "next/navigation";

import {
  getOrder,
  getOrderUsers,
} from "@/services/orders/actions/order.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import EditOrderPage from "./page.client";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const orderId = Number(resolvedParams.orderId);

  const [order, users, products] = await Promise.all([
    getOrder(orderId),
    getOrderUsers(),
    getProducts(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <EditOrderPage order={order} users={users} products={products} />
  );
};

export default Page;
