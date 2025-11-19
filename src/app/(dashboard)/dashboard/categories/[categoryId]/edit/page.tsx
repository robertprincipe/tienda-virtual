import {
  getCategories,
  getCategory,
} from "@/services/categories/actions/category.actions";
import EditCategory from "./page.client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Categoría",
  description:
    "Modifica la información de una categoría existente. Actualiza nombre, slug y relaciones con otras categorías.",
};

type PageProps = {
  params: Promise<{ categoryId: number }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;

  const data = await getCategory(params.categoryId);

  if (!data) {
    notFound();
  }

  return <EditCategory category={data} />;
};

export default Page;
