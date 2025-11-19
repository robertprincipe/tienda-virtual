import { paginatedCouponsSchema } from "@/schemas/coupon.schema";
import { getCouponsPaginated } from "@/services/coupons/actions/coupon.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import CouponsIndex from "./page.client";

export const metadata: Metadata = {
  title: "Cupones",
  description:
    "Administra cupones de descuento y promociones. Crea códigos promocionales, establece reglas de uso y controla la vigencia de las ofertas.",
};

type CouponsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: CouponsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const query = paginatedCouponsSchema.parse(resolvedSearchParams);

  const couponsPromise = getCouponsPaginated(query);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CouponsIndex couponsPromise={couponsPromise} />
    </div>
  );
};

export default Page;
