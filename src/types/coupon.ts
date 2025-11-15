import type {
  CouponListItem,
  CouponWithRelations,
} from "@/schemas/coupon.schema";
import type { CouponFiltersInput } from "@/schemas/coupon.schema";

export type CouponFilters = CouponFiltersInput;

export interface PaginatedCoupons {
  message: string;
  result: {
    data: CouponListItem[];
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

export type CouponDetail = CouponWithRelations;
