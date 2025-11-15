import type {
  ProductListItem,
  ProductWithRelations,
} from "@/schemas/product.schema";

export interface PaginatedProducts {
  message: string;
  result: {
    data: ProductListItem[];
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

export type ProductDetail = ProductWithRelations;
