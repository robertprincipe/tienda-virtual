import { getCategories } from "@/services/categories/actions/category.actions";

import CreateProductPage from "./page.client";

const Page = async () => {
  const categories = await getCategories();

  return <CreateProductPage categories={categories} />;
};

export default Page;
