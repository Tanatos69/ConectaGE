"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

const reviewSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Escribe un comentario").max(1000),
});

export async function submitReviewAction(input: {
  listingId: string;
  rating: number;
  comment: string;
  listingSlug: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = reviewSchema.safeParse(input);
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
    return { error: "No se pudo publicar tu reseña. Intenta de nuevo." };
  }

  revalidatePath(`/anuncios/${input.listingSlug}`);
  return { success: true };
}

const replySchema = z.object({
  reviewId: z.string().uuid(),
  reply: z.string().trim().min(1, "Escribe una respuesta").max(1000),
});

export async function replyToReviewAction(input: {
  reviewId: string;
  reply: string;
  listingSlug: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // RLS (reviews_seller_update) + the protect_review_columns trigger enforce
  // that only the listing's own seller can set seller_reply.
  const { error } = await supabase
    .from("reviews")
    .update({ seller_reply: parsed.data.reply })
    .eq("id", parsed.data.reviewId);

  if (error) return { error: "No se pudo publicar la respuesta." };

  revalidatePath(`/anuncios/${input.listingSlug}`);
  return { success: true };
}
