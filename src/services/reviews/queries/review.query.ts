import { useQuery } from "@tanstack/react-query";

import { getReview } from "../actions/review.actions";

export const useReview = (id: number) =>
  useQuery({
    queryKey: ["review", id],
    queryFn: async () => await getReview(id),
    enabled: Number.isFinite(id) && id > 0,
  });
