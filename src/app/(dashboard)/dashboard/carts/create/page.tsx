import { getCartUsers } from "@/services/carts/actions/cart.actions";
import { getProducts } from "@/services/products/actions/product.actions";
import { Metadata } from "next";

import CreateCartPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Carrito",
  description:
    "Crea un nuevo carrito de compras manualmente. Selecciona usuario y agrega productos al carrito.",
};

const Page = async () => {
  const [users, products] = await Promise.all([getCartUsers(), getProducts()]);

  return <CreateCartPage users={users} products={products} />;
};

export default Page;
