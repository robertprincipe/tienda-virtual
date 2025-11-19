import { getCategories } from "@/services/categories/actions/category.actions";
import { Metadata } from "next";

import CreateProductPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Producto",
  description:
    "Agrega un nuevo producto a tu catálogo. Configura nombre, precio, inventario, imágenes y detalles para empezar a vender.",
};

const Page = async () => {
  const categories = await getCategories();

  return <CreateProductPage categories={categories} />;
};

export default Page;
