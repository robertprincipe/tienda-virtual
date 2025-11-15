import { SelectCategory } from "@/schemas/category.schema";
import { SelectProduct } from "@/schemas/product.schema";

export interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  value_formatted?: string;
  min_subtotal: number | null;
  min_subtotal_formatted?: string | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  starts_at: string | null;
  ends_at: string | null;
  starts_at_formatted?: string | null;
  ends_at_formatted?: string | null;
  is_active: boolean;
  is_valid?: boolean;
  redemptions_count?: number;
  remaining_uses?: number | null;
  products?: SelectProduct[];
  categories?: SelectCategory[];
  products_count?: number;
  categories_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CouponFormData {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_subtotal?: number | null;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  product_ids?: number[];
  category_ids?: number[];
}

export interface CouponFilters {
  search?: string;
  type?: "percent" | "fixed" | string;
  is_active?: boolean | string;
  is_valid?: boolean | string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginatedCoupons {
  data: Coupon[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface SelectableItem {
  id: number;
  name: string;
  image_url?: string | null;
  sku?: string;
}
