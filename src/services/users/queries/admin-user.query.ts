import { useQuery } from "@tanstack/react-query";

import { getUser } from "../actions/admin-user.actions";

export const useAdminUser = (id: number) =>
  useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => await getUser(id),
    enabled: Number.isFinite(id) && id > 0,
  });
