import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getCoupon } from "@/services/coupons/actions/coupon.actions";

import CouponDetailPage from "./page.client";

export const metadata: Metadata = {
  title: "Detalle de Cupón",
  description:
    "Visualiza la información completa del cupón. Revisa sus reglas, fechas de vigencia y estadísticas de uso.",
};

type PageProps = {
  params: Promise<{ couponId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const couponId = Number(resolvedParams.couponId);

  const coupon = await getCoupon(couponId);

  if (!coupon) {
    notFound();
  }

  return <CouponDetailPage coupon={coupon} />;
};

export default Page;
