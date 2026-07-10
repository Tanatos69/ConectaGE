"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import { getSiteSettings } from "@/lib/supabase/settings";
import type { ActionResult } from "./auth";

const PLAN_PRICE_KEY = {
  7: "featured_price_7d",
  15: "featured_price_15d",
  30: "featured_price_30d",
} as const;

export type FeaturedPlanDays = keyof typeof PLAN_PRICE_KEY;

/**
 * Self-serve "Destacar mi anuncio": creates a pending featured_request that
 * the admin confirms in /admin/destacados once the (offline) payment arrives.
 * Runs with the user's own session — RLS featured_requests_own_insert
 * enforces user_id = auth.uid(); no service role involved.
 */
export async function requestFeaturedAction(
  listingId: string,
  planDays: FeaturedPlanDays,
  paymentMethod: "bank_transfer" | "mobile_money",
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };
  if (![7, 15, 30].includes(planDays)) return { error: "Plan no válido." };
  if (!["bank_transfer", "mobile_money"].includes(paymentMethod)) {
    return { error: "Método de pago no válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, status, is_featured, featured_until")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing || listing.seller_id !== user.id) return { error: "Anuncio no encontrado." };
  if (listing.status !== "published") {
    return { error: "Solo se pueden destacar anuncios publicados." };
  }
  if (
    listing.is_featured &&
    listing.featured_until &&
    new Date(listing.featured_until) > new Date()
  ) {
    return { error: "Este anuncio ya está destacado. Espera a que termine el período actual." };
  }

  const { data: existing } = await supabase
    .from("featured_requests")
    .select("id")
    .eq("listing_id", listingId)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) {
    return { error: "Ya tienes una solicitud pendiente para este anuncio." };
  }

  const settings = await getSiteSettings();
  const amount = settings[PLAN_PRICE_KEY[planDays]];

  const { error } = await supabase.from("featured_requests").insert({
    listing_id: listingId,
    user_id: user.id,
    plan_days: planDays,
    amount,
    payment_method: paymentMethod,
    status: "pending",
  });
  if (error) return { error: "No se pudo registrar la solicitud. Intenta de nuevo." };

  revalidatePath("/mi-cuenta/anuncios");
  revalidatePath("/admin/destacados");
  return { success: true };
}
