import type { UserListItem } from "@/schemas/admin-user.schema";

export interface PaginatedUsers {
  message: string;
  result: {
    data: UserListItem[];
    count: number;
    pageCount: number;
    total: number;
    nextPage: number | null;
    currentPage: number;
    minMax: {
      min: number;
      max: number;
    };
  };
}
