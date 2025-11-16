import { getOrderUsers } from "@/services/orders/actions/order.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import CreateOrderPage from "./page.client";

const Page = async () => {
  const [users, products] = await Promise.all([
    getOrderUsers(),
    getProducts(),
  ]);

  return <CreateOrderPage users={users} products={products} />;
};

export default Page;
