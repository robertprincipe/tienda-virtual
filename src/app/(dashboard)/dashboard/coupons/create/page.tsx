import { getCategories } from "@/services/categories/actions/category.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import CreateCouponPage from "./page.client";

const Page = async () => {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return <CreateCouponPage categories={categories} products={products} />;
};

export default Page;
