import { useQuery } from "@tanstack/react-query";

import { getProduct, getProducts } from "../actions/product.actions";

export const useProductsList = () =>
  useQuery({
    queryKey: ["products", "list"],
    queryFn: async () => await getProducts(),
  });

export const useProduct = (id: number) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => await getProduct(id),
    enabled: Number.isFinite(id) && id > 0,
  });
