"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // RLS (auth.uid() = user_id) enforces ownership; .eq is defense-in-depth.
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "No se pudo actualizar la notificación." };

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/notificaciones");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) return { error: "No se pudieron marcar como leídas." };

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/notificaciones");
  return { success: true };
}
