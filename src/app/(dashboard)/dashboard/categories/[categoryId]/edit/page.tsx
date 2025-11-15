import {
  getCategories,
  getCategory,
} from "@/services/categories/actions/category.actions";
import EditCategory from "./page.client";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ categoryId: number }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;

  const data = await getCategory(params.categoryId);

  const categories = await getCategories();

  if (!data) {
    notFound();
  }

  return <EditCategory category={data} categories={categories} />;
};

export default Page;
