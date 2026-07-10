"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

const reportSchema = z.object({
  listingSlug: z.string().trim().min(1).max(120),
  reason: z.enum(["fraud", "prohibited", "wrong_category", "duplicate", "offensive", "other"]),
  details: z.string().trim().max(500).default(""),
});

export async function reportListingAction(input: {
  listingSlug: string;
  reason: string;
  details: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para reportar un anuncio." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    listing_slug: parsed.data.listingSlug,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya has reportado este anuncio. Gracias." };
    if (error.code === "23503") return { error: "Este anuncio ya no existe." };
    return { error: "No se pudo enviar el reporte. Intenta de nuevo." };
  }

  return { success: true };
}
