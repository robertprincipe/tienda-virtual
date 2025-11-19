import { getReviewUsers } from "@/services/reviews/actions/review.actions";
import { getProducts } from "@/services/products/actions/product.actions";
import { Metadata } from "next";

import CreateReviewPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Reseña",
  description:
    "Agrega una nueva reseña de producto. Selecciona usuario, producto y registra calificación y comentario.",
};

const Page = async () => {
  const [users, products] = await Promise.all([
    getReviewUsers(),
    getProducts(),
  ]);

  return <CreateReviewPage users={users} products={products} />;
};

export default Page;
