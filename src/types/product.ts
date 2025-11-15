import type {
  ProductListItem,
  ProductWithRelations,
} from "@/schemas/product.schema";

export interface PaginatedProducts {
  data: ProductListItem[];
  pageCount: number;
  total: number;
  nextPage: number | null;
}

export type ProductDetail = ProductWithRelations;
