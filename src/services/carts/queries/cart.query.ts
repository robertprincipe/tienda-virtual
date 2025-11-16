import { useQuery } from "@tanstack/react-query";

import { getCart } from "../actions/cart.actions";

export const useCart = (id: number) =>
  useQuery({
    queryKey: ["cart", id],
    queryFn: async () => await getCart(id),
    enabled: Number.isFinite(id) && id > 0,
  });
