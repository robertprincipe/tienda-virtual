import type { CartListItem, CartWithRelations } from "@/schemas/cart.schema";
import type { SelectProduct } from "@/schemas/product.schema";

export interface CartItem {
  id: number;
  quantity: number;
  product: Pick<SelectProduct, "name" | "price" | "compareAtPrice">;
}

export interface Cart {
  id: number;
  user_id: number;
  status: "active" | "completed" | "abandoned";
  coupon_code: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  total: number;
  total_formatted: string;
  item_count: number;
  items: CartItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CartItemFormData {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemFormData {
  quantity: number;
}

export interface PaginatedCarts {
  message: string;
  result: {
    data: CartListItem[];
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

export type CartDetail = CartWithRelations;
