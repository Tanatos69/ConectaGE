"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR, SUPABASE_URL } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

function normalizePhone(raw: string): string {
  return raw.replace(/[^+0-9]/g, "");
}

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\+[0-9]{6,15}$/, "Introduce un número de WhatsApp válido, ej. +240222000000"));

/**
 * Photos are uploaded directly from the browser to the `listing-images`
 * bucket (Storage RLS restricts writes to the user's own {uid}/ folder).
 * The action only accepts image URLs that live inside that folder — so a
 * client can't attach someone else's images path or an external URL.
 */
function ownStorageImageSchema(userId: string) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/listing-images/${userId}/`;
  return z
    .array(z.string().startsWith(prefix, "Imagen no válida"))
    .max(10, "Máximo 10 fotos");
}

const listingInputSchema = z.object({
  title: z.string().trim().min(5, "El título debe tener al menos 5 caracteres").max(100),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(2000),
  price: z.number().min(0).max(999_999_999_999).nullable(),
  priceType: z.enum(["fixed", "negotiable", "free", "on_request"]),
  currency: z.enum(["XAF", "USD", "EUR"]),
  // Not a static enum anymore — categories live in the database now.
  // Existence + is_active is checked against it below instead.
  categorySlug: z.string().trim().min(1, "Selecciona una categoría").max(60),
  subcategorySlug: z.string().trim().max(60).default(""),
  city: z.string().trim().min(1, "Indica la ciudad").max(60),
  region: z.string().trim().max(60).default(""),
  condition: z.enum(["new", "used", "refurbished"]).nullable(),
  whatsapp: phoneSchema,
  showPhone: z.boolean().default(false),
  phone: z.string().trim().max(20).default(""),
  listingType: z.enum(["offer", "wanted"]),
  extraFields: z.record(z.string(), z.string().max(120)).default({}),
  /** Only shown/editable for stock-style categories; null elsewhere. */
  quantity: z.number().int().min(0).max(999_999).nullable(),
});

export type ListingInput = z.input<typeof listingInputSchema> & { images: string[] };

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "anuncio"}-${suffix}`;
}

export async function createListingAction(input: ListingInput): Promise<ActionResult & { slug?: string }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para publicar." };

  const parsed = listingInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const imagesParsed = ownStorageImageSchema(user.id).safeParse(input.images ?? []);
  if (!imagesParsed.success) return { error: imagesParsed.error.issues[0].message };

  const d = parsed.data;

  // categorySlug has no hard FK (soft reference, same as subcategorySlug
  // always was) — this replaces the old static Zod enum with an explicit
  // existence + is_active check against the real table.
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", d.categorySlug)
    .is("parent_id", null)
    .eq("is_active", true)
    .maybeSingle();
  if (!category) return { error: "Selecciona una categoría válida." };

  const slug = slugify(d.title);

  const { error } = await supabase.from("listings").insert({
    // seller_id always comes from the server-side session, never the client.
    seller_id: user.id,
    title: d.title,
    slug,
    description: d.description,
    price: d.priceType === "fixed" || d.priceType === "negotiable" ? d.price : null,
    price_type: d.priceType,
    currency: d.currency,
    category_slug: d.categorySlug,
    subcategory_slug: d.subcategorySlug,
    city: d.city,
    region: d.region,
    condition: d.condition,
    images: imagesParsed.data,
    whatsapp: d.whatsapp,
    show_phone: d.showPhone,
    phone: d.showPhone ? normalizePhone(d.phone) : "",
    listing_type: d.listingType,
    extra_fields: d.extraFields,
    quantity: d.quantity,
  });

  if (error) return { error: "No se pudo publicar el anuncio. Intenta de nuevo." };

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath(`/categoria/${d.categorySlug}`);
  return { success: true, slug };
}

const listingUpdateSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(0).max(999_999_999_999).nullable(),
  priceType: z.enum(["fixed", "negotiable", "free", "on_request"]),
  city: z.string().trim().min(1, "Indica la ciudad").max(60),
  condition: z.enum(["new", "used", "refurbished"]).nullable(),
  whatsapp: phoneSchema,
  // Unlike category/images/extraFields, quantity is a fact that naturally
  // changes over time (like price) — editable post-publish for the
  // categories that show it at all.
  quantity: z.number().int().min(0).max(999_999).nullable(),
});

export async function updateListingAction(
  id: string,
  input: z.input<typeof listingUpdateSchema>,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = listingUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const d = parsed.data;
  // RLS (seller_id = auth.uid()) enforces ownership; .eq is defense-in-depth.
  const { error } = await supabase
    .from("listings")
    .update({
      title: d.title,
      description: d.description,
      price: d.priceType === "fixed" || d.priceType === "negotiable" ? d.price : null,
      price_type: d.priceType,
      city: d.city,
      condition: d.condition,
      whatsapp: d.whatsapp,
      quantity: d.quantity,
    })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: "No se pudo guardar el anuncio." };

  revalidatePath("/mi-cuenta/anuncios");
  revalidatePath("/");
  return { success: true };
}

export async function deleteListingAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) return { error: "No se pudo eliminar el anuncio." };

  revalidatePath("/mi-cuenta/anuncios");
  revalidatePath("/");
  return { success: true };
}
