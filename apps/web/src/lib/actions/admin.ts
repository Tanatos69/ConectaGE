"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import type { ActionResult } from "./auth";

/**
 * Every action here runs with the service-role client (bypasses RLS), so the
 * FIRST step is always verifying the caller's own session is an admin.
 */
async function requireAdmin(): Promise<{ adminId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { error: "Acceso restringido a administradores." };
  return { adminId: user.id };
}

function storeSlugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return base || "tienda";
}

export async function approveSellerRequestAction(requestId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();

  const { data: request } = await admin
    .from("seller_requests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle();
  if (!request) return { error: "Solicitud no encontrada o ya revisada." };

  const { data: requester } = await admin
    .from("profiles")
    .select("id, phone, city")
    .eq("id", request.user_id)
    .maybeSingle();
  if (!requester) return { error: "El usuario solicitante ya no existe." };

  // Unique-suffix the slug if the store name is taken.
  let slug = storeSlugify(request.store_name);
  const { data: slugTaken } = await admin.from("tiendas").select("id").eq("slug", slug).maybeSingle();
  if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error: tiendaError } = await admin.from("tiendas").insert({
    owner_id: request.user_id,
    slug,
    name: request.store_name,
    city: requester.city ?? "",
    whatsapp: requester.phone ?? "",
  });
  if (tiendaError && tiendaError.code !== "23505") {
    return { error: "No se pudo crear la tienda." };
  }

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", request.user_id);
  if (roleError) return { error: "No se pudo actualizar el rol del usuario." };

  await admin
    .from("seller_requests")
    .update({ status: "approved", reviewed_by: gate.adminId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  revalidatePath("/admin/vendedores");
  return { success: true };
}

export async function rejectSellerRequestAction(requestId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("seller_requests")
    .update({ status: "rejected", reviewed_by: gate.adminId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) return { error: "No se pudo rechazar la solicitud." };

  revalidatePath("/admin/vendedores");
  return { success: true };
}
