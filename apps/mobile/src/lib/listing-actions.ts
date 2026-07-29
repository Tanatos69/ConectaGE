import type { ListingRow, TiendaRow } from "@conectage/shared";
import { decideInitialStatus, slugify, normalizePhone } from "@conectage/shared";
import { getSupabaseClient } from "./supabase/client";
import { getSiteSettings, getProfile, getTiendaByOwner } from "./queries";
import { uploadImages } from "./storage";

/**
 * Client-side port of web's createListingAction. Uploads picked photos, then
 * computes the initial moderation status with the same shared rule the web
 * uses (decideInitialStatus), and inserts the row. seller_id comes from the
 * passed session user id; RLS enforces it matches auth.uid().
 */
export interface CreateListingInput {
  userId: string;
  title: string;
  description: string;
  price: number | null;
  priceType: ListingRow["price_type"];
  currency: ListingRow["currency"];
  categorySlug: string;
  subcategorySlug: string;
  city: string;
  region: string;
  condition: ListingRow["condition"];
  whatsapp: string;
  showPhone: boolean;
  phone: string;
  listingType: ListingRow["listing_type"];
  quantity: number | null;
  /** Local file:// URIs from the picker (already compressed). */
  imageUris: string[];
}

export async function createListing(
  input: CreateListingInput,
): Promise<{ slug: string; pending: boolean }> {
  const supabase = getSupabaseClient();

  const [settings, profile, tienda] = await Promise.all([
    getSiteSettings(),
    getProfile(input.userId),
    getTiendaByOwner(input.userId),
  ]);

  const images = await uploadImages(input.userId, input.imageUris, "listing-images");

  const accountAgeDays = profile?.created_at
    ? (Date.now() - new Date(profile.created_at).getTime()) / 86_400_000
    : 0;

  const status = decideInitialStatus({
    settings,
    title: input.title,
    description: input.description,
    price: input.price,
    tiendaVerified: Boolean(tienda?.verified),
    accountAgeDays,
  });

  const slug = slugify(input.title);
  const priced = input.priceType === "fixed" || input.priceType === "negotiable";

  const { error } = await supabase.from("listings").insert({
    seller_id: input.userId,
    status,
    title: input.title,
    slug,
    description: input.description,
    price: priced ? input.price : null,
    price_type: input.priceType,
    currency: input.currency,
    category_slug: input.categorySlug,
    subcategory_slug: input.subcategorySlug,
    city: input.city,
    region: input.region,
    condition: input.condition,
    images,
    whatsapp: normalizePhone(input.whatsapp),
    show_phone: input.showPhone,
    phone: input.showPhone ? normalizePhone(input.phone) : "",
    listing_type: input.listingType,
    extra_fields: {},
    quantity: input.quantity,
  });
  if (error) throw new Error(error.message);

  return { slug, pending: status === "pending" };
}

export interface UpdateListingInput {
  title: string;
  description: string;
  price: number | null;
  priceType: ListingRow["price_type"];
  city: string;
  condition: ListingRow["condition"];
  whatsapp: string;
  quantity: number | null;
}

export async function updateListing(id: string, input: UpdateListingInput): Promise<void> {
  const supabase = getSupabaseClient();
  const priced = input.priceType === "fixed" || input.priceType === "negotiable";
  const { error } = await supabase
    .from("listings")
    .update({
      title: input.title,
      description: input.description,
      price: priced ? input.price : null,
      price_type: input.priceType,
      city: input.city,
      condition: input.condition,
      whatsapp: normalizePhone(input.whatsapp),
      quantity: input.quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Pause (→ expired) or republish (→ published) an own listing. */
export async function setListingStatus(id: string, status: ListingRow["status"]): Promise<void> {
  const { error } = await getSupabaseClient().from("listings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Tiendas ──────────────────────────────────────────────────────────────────

export type TiendaInput = Pick<
  TiendaRow,
  | "name"
  | "tagline"
  | "city"
  | "address"
  | "neighborhood"
  | "business_hours"
  | "instagram"
  | "facebook"
  | "category_slug"
  | "whatsapp"
  | "description"
> & { logoUri?: string | null; bannerUri?: string | null };

export async function createTienda(userId: string, input: TiendaInput): Promise<{ slug: string }> {
  const supabase = getSupabaseClient();
  const slug = slugify(input.name);

  const { logoUri, bannerUri, ...fields } = input;
  const { uploadImages: _u } = await import("./storage");
  const [logo, banner] = await Promise.all([
    logoUri ? _u(userId, [logoUri], "avatars").then((u) => u[0]) : Promise.resolve(null),
    bannerUri ? _u(userId, [bannerUri], "avatars").then((u) => u[0]) : Promise.resolve(null),
  ]);

  const { error } = await supabase.from("tiendas").insert({
    owner_id: userId,
    slug,
    ...fields,
    whatsapp: normalizePhone(input.whatsapp),
    logo,
    banner,
  });
  if (error) throw new Error(error.message);
  return { slug };
}

export async function updateTienda(id: string, userId: string, input: TiendaInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { logoUri, bannerUri, ...fields } = input;
  const patch: Record<string, unknown> = { ...fields, whatsapp: normalizePhone(input.whatsapp) };

  if (logoUri && !/^https?:\/\//.test(logoUri)) {
    const { uploadImages: u } = await import("./storage");
    patch.logo = (await u(userId, [logoUri], "avatars"))[0];
  }
  if (bannerUri && !/^https?:\/\//.test(bannerUri)) {
    const { uploadImages: u } = await import("./storage");
    patch.banner = (await u(userId, [bannerUri], "avatars"))[0];
  }

  const { error } = await supabase.from("tiendas").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}
