export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_price_formatted: string;
  subtotal: number;
  subtotal_formatted: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    image_url: string | null;
    category: {
      id: number;
      name: string;
    } | null;
  };
}

export interface Order {
  id: number;
  public_id: string;
  user_id: number | null;
  email: string;
  status:
    | 'created'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'canceled'
    | 'refunded';
  status_label: string;

  // Amounts
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;

  // Formatted amounts
  subtotal_formatted: string;
  discount_formatted: string;
  tax_formatted: string;
  shipping_formatted: string;
  total_formatted: string;

  coupon_code: string | null;
  notes: string | null;

  // Shipping address
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string | null;
  country_code: string;
  phone: string | null;

  // Shipping details
  shipping_method_name: string | null;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;

  // Timestamps
  placed_at: string;
  updated_at: string | null;
  canceled_at: string | null;

  // Relationships
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items?: OrderItem[];
  items_count?: number;
}

export interface OrderFormData {
  coupon_code?: string;
  notes?: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postal_code?: string;
  country_code: string;
  phone?: string;
  shipping_method_name?: string;
}

export interface UpdateOrderFormData {
  status?: Order['status'];
  notes?: string;
  shipping_carrier?: string;
  shipping_tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderFilters {
  search?: string;
  status?: Order['status'];
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CouponValidation {
  valid: boolean;
  coupon?: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    discount: number;
    discount_formatted: string;
  };
  error?: string;
}
