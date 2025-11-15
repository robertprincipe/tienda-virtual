import type {
  CouponListItem,
  CouponWithRelations,
} from "@/schemas/coupon.schema";
import type { CouponFiltersInput } from "@/schemas/coupon.schema";

export type CouponFilters = CouponFiltersInput;

export interface PaginatedCoupons {
  data: CouponListItem[];
  pageCount: number;
  total: number;
  nextPage: number | null;
}

export type CouponDetail = CouponWithRelations;
