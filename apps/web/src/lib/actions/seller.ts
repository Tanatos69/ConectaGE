"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

const requestSchema = z.object({
  storeName: z.string().trim().min(3, "El nombre de la tienda debe tener al menos 3 caracteres").max(60),
  message: z.string().trim().max(500).default(""),
});

/** Buyer asks to become a seller; an admin approves from /admin/vendedores. */
export async function requestSellerStatusAction(input: {
  storeName: string;
  message: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { error } = await supabase.from("seller_requests").insert({
    user_id: user.id,
    store_name: parsed.data.storeName,
    message: parsed.data.message,
  });

  if (error) {
    // Unique partial index: one pending request per user.
    if (error.code === "23505") {
      return { error: "Ya tienes una solicitud pendiente de revisión." };
    }
    return { error: "No se pudo enviar la solicitud. Intenta de nuevo." };
  }

  revalidatePath("/mi-cuenta/tienda");
  return { success: true };
}

const tiendaSchema = z.object({
  name: z.string().trim().min(3).max(60),
  tagline: z.string().trim().max(100).default(""),
  description: z.string().trim().max(1000).default(""),
  city: z.string().trim().max(60).default(""),
  address: z.string().trim().max(120).default(""),
  neighborhood: z.string().trim().max(60).default(""),
  businessHours: z.string().trim().max(120).default(""),
  instagram: z.string().trim().max(60).default(""),
  facebook: z.string().trim().max(60).default(""),
  logo: z.string().max(500).default(""),
});

export async function updateTiendaAction(
  input: z.input<typeof tiendaSchema>,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = tiendaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const d = parsed.data;
  // RLS: owners can only update their own row; owner_id/verified are
  // additionally trigger-protected.
  const { error } = await supabase
    .from("tiendas")
    .update({
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      city: d.city,
      address: d.address,
      neighborhood: d.neighborhood,
      business_hours: d.businessHours,
      instagram: d.instagram,
      facebook: d.facebook,
      logo: d.logo || null,
    })
    .eq("owner_id", user.id);

  if (error) return { error: "No se pudo guardar la tienda." };

  revalidatePath("/mi-cuenta/tienda");
  return { success: true };
}
