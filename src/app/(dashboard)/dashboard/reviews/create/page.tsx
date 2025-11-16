import { getReviewUsers } from "@/services/reviews/actions/review.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import CreateReviewPage from "./page.client";

const Page = async () => {
  const [users, products] = await Promise.all([
    getReviewUsers(),
    getProducts(),
  ]);

  return <CreateReviewPage users={users} products={products} />;
};

export default Page;
