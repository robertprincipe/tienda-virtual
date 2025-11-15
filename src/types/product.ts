export interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    category_id: number | null;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    short_desc: string | null;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    purchase_price: number | null;
    weight_grams: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    status: 'active' | 'draft' | 'archived';
    images?: ProductImage[];
    primary_image?: ProductImage | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image: string;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ProductFormData {
    name: string;
    slug?: string;
    sku: string;
    category_id?: number | null;
    short_desc?: string;
    description?: string;
    price: number;
    compare_at_price?: number | null;
    purchase_price?: number | null;
    weight_grams?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    status: 'active' | 'draft' | 'archived';
    images?: File[];
}

export interface ProductFilters {
    search?: string;
    category_id?: number | string | null;
    status?: 'active' | 'draft' | 'archived' | string;
    min_price?: number | string;
    max_price?: number | string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}


