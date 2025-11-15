import { getCategories } from "@/services/categories/actions/category.actions";
import CreateCategory from "./page.client";

const Page = async () => {
  const categories = await getCategories();

  return <CreateCategory categories={categories} />;
};

export default Page;
