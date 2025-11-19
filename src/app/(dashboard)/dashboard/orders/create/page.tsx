import { getOrderUsers } from "@/services/orders/actions/order.actions";
import { getProducts } from "@/services/products/actions/product.actions";
import { Metadata } from "next";

import CreateOrderPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Pedido",
  description:
    "Registra un nuevo pedido manualmente. Selecciona cliente, productos y configura los detalles del pedido desde el panel de administración.",
};

const Page = async () => {
  const [users, products] = await Promise.all([getOrderUsers(), getProducts()]);

  return <CreateOrderPage users={users} products={products} />;
};

export default Page;
