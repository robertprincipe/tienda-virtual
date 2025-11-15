import { useQuery } from "@tanstack/react-query";

import { getCoupon } from "../actions/coupon.actions";

export const useCoupon = (id: number) =>
  useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => await getCoupon(id),
    enabled: Number.isFinite(id) && id > 0,
  });
