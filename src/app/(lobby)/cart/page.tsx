import { Metadata } from "next";
import CartPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Carrito de Compras",
  description:
    "Revisa los productos en tu carrito de compras y procede con tu compra.",
};

export default function CartPage() {
  return <CartPageClient />;
}
