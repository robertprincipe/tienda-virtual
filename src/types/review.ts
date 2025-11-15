export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;

  // Relations
  user?: {
    id: number;
    name: string;
    email: string;
  };

  product?: {
    id: number;
    name: string;
    slug: string;
    sku: string;
  };

  // Timestamps
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
