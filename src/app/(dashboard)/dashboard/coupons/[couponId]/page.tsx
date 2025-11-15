import { notFound } from "next/navigation";

import { getCoupon } from "@/services/coupons/actions/coupon.actions";

import CouponDetailPage from "./page.client";

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
