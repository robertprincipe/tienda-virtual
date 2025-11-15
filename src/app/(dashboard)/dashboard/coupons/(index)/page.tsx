import { paginatedCouponsSchema } from "@/schemas/coupon.schema";
import { getCouponsPaginated } from "@/services/coupons/actions/coupon.actions";
import { type SearchParams } from "@/types/params";

import CouponsIndex from "./page.client";

type CouponsPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: CouponsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const query = paginatedCouponsSchema.parse(resolvedSearchParams);

  const coupons = await getCouponsPaginated(query);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CouponsIndex coupons={coupons} />
    </div>
  );
};

export default Page;
