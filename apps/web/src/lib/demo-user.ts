// Real accounts/listings/notifications now live in Supabase
// (lib/supabase/queries.ts). Only shared types used by the still-mocked
// admin listings page remain here.

export type ListingStatus = "published" | "pending" | "rejected" | "expired";

export interface UserListing {
  slug: string;
  title: string;
  description?: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF";
  city: string;
  categoryName: string;
  image: string;
  status: ListingStatus;
  views: number;
  postedLabel: string;
  expiresLabel: string;
  rejectionReason?: string;
}
