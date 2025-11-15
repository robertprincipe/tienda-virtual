export interface StoreSetting {
  id: number;

  // Company information
  company_name: string;
  legal_name: string | null;
  tax_id: string | null;
  ruc: string | null;
  email: string | null;
  phone: string | null;

  // Company address
  company_line1: string | null;
  company_line2: string | null;
  company_city: string | null;
  company_region: string | null;
  company_postal_code: string | null;
  company_country_code: string | null;

  // Branding
  primary_color: string;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;

  // Store settings
  currency: string;
  timezone: string;
  logo_url: string | null;
  logo_path: string | null;

  // Policies
  privacy_policy_html: string | null;
  terms_html: string | null;
  shipping_policy_html: string | null;
  refund_policy_html: string | null;

  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

export interface Currency {
  code: string;
  name: string;
}

export interface Timezone {
  value: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}
