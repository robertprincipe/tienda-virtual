import { getCategories } from "@/services/categories/actions/category.actions";
import { getProducts } from "@/services/products/actions/product.actions";
import { Metadata } from "next";

import CreateCouponPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Cupón",
  description:
    "Crea un nuevo cupón de descuento. Define código, tipo de descuento, fechas de vigencia y restricciones de uso.",
};

const Page = async () => {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return <CreateCouponPage categories={categories} products={products} />;
};

export default Page;
