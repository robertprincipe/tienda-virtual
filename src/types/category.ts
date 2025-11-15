import { SelectCategory } from "@/schemas/category.schema";

export interface CategoryFormData {
  name: string;
  slug?: string;
  image?: File | null;
  parent_id?: number | null;
  description?: string;
  is_active?: boolean;
  delete_image?: boolean;
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean | string;
  parent_id?: number | string | null;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
}

export interface PaginatedCategories {
  data: SelectCategory[];
  pageCount: number;
  total: number;
  nextPage: number | null;
}
