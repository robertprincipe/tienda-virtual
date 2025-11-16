import { getCartUsers } from "@/services/carts/actions/cart.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import CreateCartPage from "./page.client";

const Page = async () => {
  const [users, products] = await Promise.all([
    getCartUsers(),
    getProducts(),
  ]);

  return <CreateCartPage users={users} products={products} />;
};

export default Page;
