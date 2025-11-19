import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getCategories } from "@/services/categories/actions/category.actions";
import { getCoupon } from "@/services/coupons/actions/coupon.actions";
import { getProducts } from "@/services/products/actions/product.actions";

import EditCouponPage from "./page.client";

export const metadata: Metadata = {
  title: "Editar Cupón",
  description:
    "Modifica un cupón de descuento existente. Actualiza código, descuento, fechas y restricciones de uso.",
};

type PageProps = {
  params: Promise<{ couponId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const couponId = Number(resolvedParams.couponId);

  const [coupon, categories, products] = await Promise.all([
    getCoupon(couponId),
    getCategories(),
    getProducts(),
  ]);

  if (!coupon) {
    notFound();
  }

  return (
    <EditCouponPage
      coupon={coupon}
      categories={categories}
      products={products}
    />
  );
};

export default Page;
