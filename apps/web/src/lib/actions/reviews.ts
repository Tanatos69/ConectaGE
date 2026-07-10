"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

const CONTACT_REQUIRED_ERROR =
  "Solo quienes han contactado con el vendedor por WhatsApp pueden dejar una reseña.";

const ratingSchema = z.number().int().min(1).max(5);
const commentSchema = z.string().trim().min(1, "Escribe un comentario").max(1000);

export async function submitReviewAction(input: {
  listingId: string;
  rating: number;
  comment: string;
  listingSlug: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = z
    .object({ listingId: z.string().uuid(), rating: ratingSchema, comment: commentSchema })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para dejar una reseña." };

  const { error } = await supabase.from("reviews").insert({
    listing_id: parsed.data.listingId,
    reviewer_id: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya has dejado una reseña en este anuncio." };
    // RLS rejects reviews without a prior WhatsApp contact (anti-bombing).
    if (error.code === "42501") return { error: CONTACT_REQUIRED_ERROR };
    return { error: "No se pudo publicar tu reseña. Intenta de nuevo." };
  }

  revalidatePath(`/anuncios/${input.listingSlug}`);
  return { success: true };
}

export async function submitStoreReviewAction(input: {
  tiendaSlug: string;
  rating: number;
  comment: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = z
    .object({
      tiendaSlug: z.string().trim().min(1).max(80),
      rating: ratingSchema,
      comment: commentSchema,
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para dejar una reseña." };

  const { error } = await supabase.from("reviews").insert({
    tienda_slug: parsed.data.tiendaSlug,
    reviewer_id: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya has dejado una reseña en esta tienda." };
    if (error.code === "42501") return { error: CONTACT_REQUIRED_ERROR };
    return { error: "No se pudo publicar tu reseña. Intenta de nuevo." };
  }

  revalidatePath(`/tienda/${input.tiendaSlug}`);
  return { success: true };
}

export async function replyToReviewAction(input: {
  reviewId: string;
  reply: string;
  /** Page to refresh, e.g. /anuncios/[slug] or /tienda/[slug]. */
  path: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = z
    .object({
      reviewId: z.string().uuid(),
      reply: z.string().trim().min(1, "Escribe una respuesta").max(1000),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // RLS + the protect_review_columns trigger enforce that only the reviewed
  // listing's/store's own seller can set seller_reply.
  const { error } = await supabase
    .from("reviews")
    .update({ seller_reply: parsed.data.reply })
    .eq("id", parsed.data.reviewId);

  if (error) return { error: "No se pudo publicar la respuesta." };

  if (input.path.startsWith("/")) revalidatePath(input.path);
  return { success: true };
}
