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

// ── Admin role management ────────────────────────────────────────────────────
// The FIRST admin is still bootstrapped by hand in Supabase Studio (there is
// intentionally no in-app path when zero admins exist). These actions let
// existing admins manage the rest without touching the database directly.

export async function grantAdminAction(email: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const normalized = email.toLowerCase().trim();
  if (!normalized) return { error: "Introduce un correo electrónico." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, email")
    .eq("email", normalized)
    .maybeSingle();

  if (!profile) {
    return { error: "No existe ninguna cuenta con ese correo. Esa persona debe registrarse primero." };
  }
  if (profile.role === "admin") {
    return { error: "Esa cuenta ya es administradora." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);
  if (error) return { error: "No se pudo conceder el acceso. Intenta de nuevo." };

  revalidatePath("/admin/ajustes");
  return { success: true };
}

export async function revokeAdminAction(userId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  // Blocking self-demotion guarantees the platform always keeps ≥1 admin.
  if (userId === gate.adminId) {
    return { error: "No puedes revocar tu propio acceso de administrador." };
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (!target || target.role !== "admin") {
    return { error: "Esa cuenta no es administradora." };
  }

  // Demoted admins keep seller status if they own a tienda.
  const { data: tienda } = await admin
    .from("tiendas")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  const { error } = await admin
    .from("profiles")
    .update({ role: tienda ? "seller" : "buyer" })
    .eq("id", userId);
  if (error) return { error: "No se pudo revocar el acceso. Intenta de nuevo." };

  revalidatePath("/admin/ajustes");
  return { success: true };
}

// ── Content moderation ───────────────────────────────────────────────────────

export async function adminDeleteListingAction(listingId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) return { error: "No se pudo eliminar el anuncio." };

  revalidatePath("/admin/anuncios");
  revalidatePath("/admin/reportes");
  revalidatePath("/");
  return { success: true };
}

export async function adminDeleteReviewAction(reviewId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", reviewId);
  if (error) return { error: "No se pudo eliminar la reseña." };

  revalidatePath("/admin/resenas");
  return { success: true };
}

export async function resolveReportAction(
  reportId: string,
  outcome: "resolved" | "dismissed",
  options?: { deleteListing?: boolean },
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();

  const { data: report } = await admin
    .from("reports")
    .select("listing_slug")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return { error: "Reporte no encontrado." };

  if (outcome === "resolved" && options?.deleteListing) {
    // Cascades: the reports rows for this listing go with it, so mark first.
    await admin
      .from("reports")
      .update({
        status: "resolved",
        reviewed_by: gate.adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("listing_slug", report.listing_slug)
      .eq("status", "pending");
    const { error } = await admin
      .from("listings")
      .delete()
      .eq("slug", report.listing_slug);
    if (error) return { error: "No se pudo eliminar el anuncio reportado." };
  } else {
    const { error } = await admin
      .from("reports")
      .update({
        status: outcome,
        reviewed_by: gate.adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (error) return { error: "No se pudo actualizar el reporte." };
  }

  revalidatePath("/admin/reportes");
  revalidatePath("/admin/anuncios");
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
