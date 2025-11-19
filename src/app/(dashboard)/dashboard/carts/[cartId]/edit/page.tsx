import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getCart, getCartUsers } from "@/services/carts/actions/cart.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import EditCartPage from "./page.client";

export const metadata: Metadata = {
  title: "Editar Carrito",
  description:
    "Modifica un carrito existente. Actualiza productos, cantidades y estado del carrito.",
};

type PageProps = {
  params: Promise<{ cartId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const cartId = Number(resolvedParams.cartId);

  const [cart, users, products] = await Promise.all([
    getCart(cartId),
    getCartUsers(),
    getProducts(),
  ]);

  if (!cart) {
    notFound();
  }

  return <EditCartPage cart={cart} users={users} products={products} />;
};

export default Page;
