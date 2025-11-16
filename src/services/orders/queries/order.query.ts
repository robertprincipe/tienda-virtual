import { useQuery } from "@tanstack/react-query";

import { getOrder } from "../actions/order.actions";

export const useOrder = (id: number) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => await getOrder(id),
    enabled: Number.isFinite(id) && id > 0,
  });
