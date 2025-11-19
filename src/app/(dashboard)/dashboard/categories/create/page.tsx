import { getCategories } from "@/services/categories/actions/category.actions";
import CreateCategory from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Categoría",
  description:
    "Crea una nueva categoría para organizar tus productos. Define el nombre, slug y establece relaciones jerárquicas con otras categorías.",
};

const Page = async () => {
  const categories = await getCategories();

  return <CreateCategory categories={categories} />;
};

export default Page;
