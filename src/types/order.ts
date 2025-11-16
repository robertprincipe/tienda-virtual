import type { OrderListItem, OrderWithRelations } from "@/schemas/order.schema";

export interface PaginatedOrders {
  message: string;
  result: {
    data: OrderListItem[];
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

export type OrderDetail = OrderWithRelations;
