/** Row shapes for the tables created in supabase/migrations/0001_init.sql. */

export type UserRole = "buyer" | "seller" | "admin";
export type RequestStatus = "pending" | "approved" | "rejected";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  role: UserRole;
  verified: boolean;
  gender: Gender | null;
  age_range: AgeRange | null;
  created_at: string;
}

export type AnalyticsEventType = "search" | "view_listing" | "whatsapp_click";

export interface EventRow {
  id: string;
  user_id: string | null;
  event_type: AnalyticsEventType;
  query: string | null;
  category_slug: string | null;
  city: string | null;
  listing_type: string | null;
  listing_slug: string | null;
  device: "mobile" | "desktop" | null;
  created_at: string;
}

export interface SellerRequest {
  id: string;
  user_id: string;
  store_name: string;
  message: string;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface TiendaRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string;
  banner: string | null;
  logo: string | null;
  city: string;
  address: string;
  neighborhood: string;
  business_hours: string;
  instagram: string;
  facebook: string;
  category_slug: string;
  whatsapp: string;
  description: string;
  verified: boolean;
  created_at: string;
}

export type NotificationKind =
  | "listing_published"
  | "seller_request_approved"
  | "seller_request_rejected";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationKind;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ListingRow {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  price: number | null;
  price_type: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF" | "USD" | "EUR";
  category_slug: string;
  subcategory_slug: string;
  city: string;
  region: string;
  condition: "new" | "used" | "refurbished" | null;
  images: string[];
  whatsapp: string;
  show_phone: boolean;
  phone: string;
  listing_type: "offer" | "wanted";
  status: "published" | "pending" | "rejected" | "expired";
  extra_fields: Record<string, string>;
  views_count: number;
  created_at: string;
  updated_at: string;
}
