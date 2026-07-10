"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { SearchCriteria } from "@/lib/search";
import type { ActionResult } from "./auth";

const MAX_SAVED_SEARCHES = 20;

/**
 * Saved searches live in the saved_searches table (migration 0016) with
 * own-row RLS — every action here runs with the user's own session.
 */
export async function addSavedSearchAction(
  label: string,
  criteria: SearchCriteria,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para guardar búsquedas." };

  const trimmedLabel = label.trim().slice(0, 120) || "Búsqueda";

  const { data: existing } = await supabase
    .from("saved_searches")
    .select("id, criteria")
    .eq("user_id", user.id);
  const rows = (existing ?? []) as { id: string; criteria: SearchCriteria }[];
  if (rows.length >= MAX_SAVED_SEARCHES) {
    return { error: `Máximo ${MAX_SAVED_SEARCHES} búsquedas guardadas. Elimina alguna primero.` };
  }
  const key = JSON.stringify(criteria);
  if (rows.some((r) => JSON.stringify(r.criteria) === key)) {
    return { error: "Ya tienes guardada esta búsqueda." };
  }

  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    label: trimmedLabel,
    criteria,
  });
  if (error) return { error: "No se pudo guardar la búsqueda." };

  revalidatePath("/mi-cuenta/busquedas");
  return { success: true };
}

export async function removeSavedSearchAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  // RLS restricts the delete to the caller's own rows.
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar la búsqueda." };

  revalidatePath("/mi-cuenta/busquedas");
  return { success: true };
}

export async function toggleSearchAlertsAction(id: string, alerts: boolean): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.from("saved_searches").update({ alerts }).eq("id", id);
  if (error) return { error: "No se pudo actualizar la alerta." };

  revalidatePath("/mi-cuenta/busquedas");
  return { success: true };
}
