import type {
  ReviewListItem,
  ReviewWithRelations,
} from "@/schemas/product-review.schema";

export interface PaginatedReviews {
  message: string;
  result: {
    data: ReviewListItem[];
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

export type ReviewDetail = ReviewWithRelations;
