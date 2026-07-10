"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";
import { DEFAULT_ICON_NAME } from "@/lib/categories";
import { DEFAULT_SETTINGS, type SiteSettingKey } from "@/lib/supabase/settings";
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

/**
 * Best-effort audit trail (admin_audit_log, migration 0015): records who did
 * what to what at the success point of every admin action. Fire-and-forget —
 * a logging failure must never fail the action itself.
 */
async function auditLog(
  admin: ReturnType<typeof createAdminClient>,
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await admin.from("admin_audit_log").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      meta: meta ?? null,
    });
  } catch {
    // Never let audit logging break the action.
  }
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

/** Shared by every path that removes a listing outright, so the seller is
 * told once, consistently, instead of drifting between two message strings. */
async function notifyListingRemoved(
  admin: ReturnType<typeof createAdminClient>,
  listing: { seller_id: string; title: string },
): Promise<void> {
  await admin.from("notifications").insert({
    user_id: listing.seller_id,
    type: "listing_removed",
    title: listing.title,
    message: `Tu anuncio "${listing.title}" ha sido eliminado por un administrador.`,
  });
}

/** Guards against ever leaving the platform without at least one admin. */
async function isLastAdmin(admin: ReturnType<typeof createAdminClient>, role: string): Promise<boolean> {
  if (role !== "admin") return false;
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return (count ?? 0) <= 1;
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

  await auditLog(admin, gate.adminId, "seller_request_approved", "user", request.user_id, {
    store: request.store_name,
  });
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

  await auditLog(admin, gate.adminId, "seller_request_rejected", "seller_request", requestId);
  revalidatePath("/admin/vendedores");
  return { success: true };
}

/**
 * Manual buyer→seller promotion (item 3) — an admin picks an arbitrary
 * buyer, not a request that user submitted themselves. Mirrors
 * approveSellerRequestAction's tienda-creation logic exactly so a manually
 * promoted seller ends up in the same valid state (role='seller' AND owns a
 * tienda) as a request-approved one — 'seller' without a tienda is a state
 * nothing else in this app expects.
 */
export async function promoteToSellerAction(userId: string, storeName: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const name = storeName.trim();
  if (name.length < 3) return { error: "El nombre de la tienda debe tener al menos 3 caracteres." };

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("id, role, phone, city")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "Ese usuario ya no existe." };
  if (target.role !== "buyer") {
    return { error: "Solo se puede convertir en vendedora una cuenta de comprador." };
  }

  let slug = storeSlugify(name);
  const { data: slugTaken } = await admin.from("tiendas").select("id").eq("slug", slug).maybeSingle();
  if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error: tiendaError } = await admin.from("tiendas").insert({
    owner_id: userId,
    slug,
    name,
    city: target.city ?? "",
    whatsapp: target.phone ?? "",
  });
  if (tiendaError) return { error: "No se pudo crear la tienda." };

  const { error: roleError } = await admin.from("profiles").update({ role: "seller" }).eq("id", userId);
  if (roleError) return { error: "No se pudo actualizar el rol del usuario." };

  await auditLog(admin, gate.adminId, "promote_to_seller", "user", userId, { store: name });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
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

  await auditLog(admin, gate.adminId, "grant_admin", "user", profile.id, { email: normalized });
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

  await auditLog(admin, gate.adminId, "revoke_admin", "user", userId);
  revalidatePath("/admin/ajustes");
  return { success: true };
}

// ── Account moderation (block / delete) ──────────────────────────────────────
// Blocking is reversible (a stored reason, lifted anytime); deletion is not.
// Both refuse to target yourself or the platform's last remaining admin.

export async function blockUserAction(userId: string, reason: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  if (userId === gate.adminId) return { error: "No puedes bloquear tu propia cuenta." };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "Indica un motivo para el bloqueo." };

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "Ese usuario ya no existe." };
  if (await isLastAdmin(admin, target.role)) {
    return { error: "No puedes bloquear al único administrador restante." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: new Date().toISOString(), blocked_reason: trimmedReason, blocked_by: gate.adminId })
    .eq("id", userId);
  if (error) return { error: "No se pudo bloquear la cuenta." };

  await auditLog(admin, gate.adminId, "block_user", "user", userId, { reason: trimmedReason });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  return { success: true };
}

export async function unblockUserAction(userId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: null, blocked_reason: null, blocked_by: null })
    .eq("id", userId);
  if (error) return { error: "No se pudo desbloquear la cuenta." };

  await auditLog(admin, gate.adminId, "unblock_user", "user", userId);
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  return { success: true };
}

/**
 * Bulk block: same guards as the single version (never self, never an
 * admin), applied per user; users that fail a guard are skipped, not fatal.
 */
export async function bulkBlockUsersAction(userIds: string[], reason: string): Promise<ActionResult & { blocked?: number }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "Indica un motivo para el bloqueo." };
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return { error: "Selecciona al menos un usuario." };
  if (ids.length > 100) return { error: "Máximo 100 usuarios por operación." };

  const admin = createAdminClient();
  const { data: targets } = await admin.from("profiles").select("id, role").in("id", ids);

  const blockable = ((targets ?? []) as { id: string; role: string }[])
    .filter((t) => t.id !== gate.adminId && t.role !== "admin")
    .map((t) => t.id);
  if (blockable.length === 0) {
    return { error: "Ninguno de los usuarios seleccionados se puede bloquear." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: new Date().toISOString(), blocked_reason: trimmedReason, blocked_by: gate.adminId })
    .in("id", blockable);
  if (error) return { error: "No se pudieron bloquear las cuentas." };

  await auditLog(admin, gate.adminId, "bulk_block_users", "user", null, {
    ids: blockable,
    reason: trimmedReason,
  });
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  return { success: true, blocked: blockable.length };
}

export async function bulkUnblockUsersAction(userIds: string[]): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return { error: "Selecciona al menos un usuario." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: null, blocked_reason: null, blocked_by: null })
    .in("id", ids);
  if (error) return { error: "No se pudieron desbloquear las cuentas." };

  await auditLog(admin, gate.adminId, "bulk_unblock_users", "user", null, { ids });
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  return { success: true };
}

/** Admin-side edit of a user's basic profile fields (support corrections). */
export async function adminUpdateUserProfileAction(
  userId: string,
  input: { fullName: string; phone: string; city: string },
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const fullName = input.fullName.trim();
  if (fullName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ full_name: fullName, phone: input.phone.trim(), city: input.city.trim() })
    .eq("id", userId);
  if (error) return { error: "No se pudo actualizar el perfil." };

  await auditLog(admin, gate.adminId, "update_user_profile", "user", userId, {
    fullName,
    phone: input.phone.trim(),
    city: input.city.trim(),
  });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  return { success: true };
}

/**
 * Internal admin note about a user, stored as an audit-log row (never on
 * profiles — that table is world-readable, see migration 0015 notes).
 */
export async function addUserNoteAction(userId: string, note: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmed = note.trim();
  if (!trimmed) return { error: "Escribe una nota." };
  if (trimmed.length > 1000) return { error: "La nota no puede superar 1000 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin.from("admin_audit_log").insert({
    admin_id: gate.adminId,
    action: "note",
    target_type: "user",
    target_id: userId,
    meta: { note: trimmed },
  });
  if (error) return { error: "No se pudo guardar la nota." };

  revalidatePath(`/admin/usuarios/${userId}`);
  return { success: true };
}

/**
 * Permanent, irreversible. Deletes the auth.users row via the Admin Auth
 * API — every table below cascades from profiles(id) on delete cascade
 * (listings, reviews, reports, tiendas, notifications, favorites, follows,
 * listing_contacts...), since profiles.id itself cascades from auth.users.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  if (userId === gate.adminId) return { error: "No puedes eliminar tu propia cuenta." };

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "Ese usuario ya no existe." };
  if (await isLastAdmin(admin, target.role)) {
    return { error: "No puedes eliminar al único administrador restante." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "No se pudo eliminar la cuenta." };

  await auditLog(admin, gate.adminId, "delete_user", "user", userId);
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  return { success: true };
}

// ── Content moderation ───────────────────────────────────────────────────────

export async function adminDeleteListingAction(listingId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();

  const { data: listing } = await admin
    .from("listings")
    .select("seller_id, title")
    .eq("id", listingId)
    .maybeSingle();

  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) return { error: "No se pudo eliminar el anuncio." };

  if (listing) await notifyListingRemoved(admin, listing);

  await auditLog(admin, gate.adminId, "delete_listing", "listing", listingId, {
    title: listing?.title,
  });
  revalidatePath("/admin/anuncios");
  revalidatePath("/admin/moderacion");
  revalidatePath("/admin/reportes");
  revalidatePath("/");
  return { success: true };
}

/**
 * "Take it down while it's investigated" (item 11) and "revoke on
 * spot-checking" (item 8) are the same operation: flip status to the
 * existing 'rejected' value (never a new enum value — see the migration's
 * notes) with a reason. The DB trigger from 0009 notifies the seller
 * automatically; unlike a hard delete this is reversible by editing the
 * listing back, and does not resolve any report tied to it.
 */
export async function unpublishListingAction(listingId: string, reason: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "Indica un motivo." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("listings")
    .update({ status: "rejected", rejection_reason: trimmedReason })
    .eq("id", listingId);
  if (error) return { error: "No se pudo despublicar el anuncio." };

  await auditLog(admin, gate.adminId, "unpublish_listing", "listing", listingId, {
    reason: trimmedReason,
  });
  revalidatePath("/admin/moderacion");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
  return { success: true };
}

/** Publishes a listing waiting in the pre-publish moderation queue. */
export async function approveListingAction(listingId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("seller_id, title, status")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return { error: "Anuncio no encontrado." };
  if (listing.status !== "pending") return { error: "Este anuncio no está pendiente de revisión." };

  const { error } = await admin
    .from("listings")
    .update({ status: "published", rejection_reason: null })
    .eq("id", listingId);
  if (error) return { error: "No se pudo aprobar el anuncio." };

  await admin.from("notifications").insert({
    user_id: listing.seller_id,
    type: "listing_approved",
    title: listing.title,
    message: `Tu anuncio "${listing.title}" ha sido aprobado y ya está visible.`,
  });

  await auditLog(admin, gate.adminId, "approve_listing", "listing", listingId, {
    title: listing.title,
  });
  revalidatePath("/admin/moderacion");
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
  revalidatePath("/buscar");
  return { success: true };
}

export async function adminDeleteReviewAction(reviewId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", reviewId);
  if (error) return { error: "No se pudo eliminar la reseña." };

  await auditLog(admin, gate.adminId, "delete_review", "review", reviewId);
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
    const { data: listing } = await admin
      .from("listings")
      .select("seller_id, title")
      .eq("slug", report.listing_slug)
      .maybeSingle();

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

    if (listing) await notifyListingRemoved(admin, listing);
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

  await auditLog(admin, gate.adminId, `report_${outcome}`, "report", reportId, {
    listing: report.listing_slug,
    deletedListing: Boolean(outcome === "resolved" && options?.deleteListing),
  });
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/anuncios");
  return { success: true };
}

// ── Store verification ───────────────────────────────────────────────────────
// tiendas.verified is a plain boolean (no separate "pending" DB state) —
// "reject" is simply setting it back to false.

export async function verifyTiendaAction(tiendaId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("tiendas").update({ verified: true }).eq("id", tiendaId);
  if (error) return { error: "No se pudo verificar la tienda." };

  await auditLog(admin, gate.adminId, "verify_tienda", "tienda", tiendaId);
  revalidatePath("/admin/tiendas");
  return { success: true };
}

export async function unverifyTiendaAction(tiendaId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("tiendas").update({ verified: false }).eq("id", tiendaId);
  if (error) return { error: "No se pudo actualizar la tienda." };

  await auditLog(admin, gate.adminId, "unverify_tienda", "tienda", tiendaId);
  revalidatePath("/admin/tiendas");
  return { success: true };
}

// ── Store suspension & editing ───────────────────────────────────────────────
// Suspension (0015) hides a tienda from every public surface without touching
// its data; the owner keeps their dashboard. Reversible, with stored reason.

export async function suspendTiendaAction(tiendaId: string, reason: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "Indica un motivo para la suspensión." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("tiendas")
    .update({ suspended_at: new Date().toISOString(), suspended_reason: trimmedReason })
    .eq("id", tiendaId);
  if (error) return { error: "No se pudo suspender la tienda." };

  await auditLog(admin, gate.adminId, "suspend_tienda", "tienda", tiendaId, {
    reason: trimmedReason,
  });
  revalidatePath("/admin/tiendas");
  revalidatePath("/tiendas");
  revalidatePath("/");
  return { success: true };
}

export async function unsuspendTiendaAction(tiendaId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("tiendas")
    .update({ suspended_at: null, suspended_reason: null })
    .eq("id", tiendaId);
  if (error) return { error: "No se pudo levantar la suspensión." };

  await auditLog(admin, gate.adminId, "unsuspend_tienda", "tienda", tiendaId);
  revalidatePath("/admin/tiendas");
  revalidatePath("/tiendas");
  revalidatePath("/");
  return { success: true };
}

/** Admin-side edit of a tienda's public fields (support corrections). */
export async function adminUpdateTiendaAction(
  tiendaId: string,
  input: { name: string; city: string; whatsapp: string },
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const name = input.name.trim();
  if (name.length < 3) return { error: "El nombre debe tener al menos 3 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("tiendas")
    .update({ name, city: input.city.trim(), whatsapp: input.whatsapp.trim() })
    .eq("id", tiendaId);
  if (error) return { error: "No se pudo actualizar la tienda." };

  await auditLog(admin, gate.adminId, "update_tienda", "tienda", tiendaId, { name });
  revalidatePath("/admin/tiendas");
  revalidatePath("/tiendas");
  return { success: true };
}

// ── Category management ──────────────────────────────────────────────────────
// Categories live in a real table (migration 0011) with no client-write RLS
// policy at all — every mutation here goes through the service role, same
// idiom as tiendas inserts.

function categorySlugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/publicar");
  revalidatePath("/buscar");
}

export async function createCategoryAction(
  name: string,
  icon: string,
  parentId: string | null,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  const slug = categorySlugify(trimmedName);
  if (!slug) return { error: "No se pudo generar un identificador válido para ese nombre." };

  const admin = createAdminClient();

  // Uniqueness only needs to hold within the same parent (matches the
  // migration's unique(parent_id, slug) — a subcategory slug can validly
  // repeat under a different parent, or even match a top-level slug).
  const dupQuery = admin.from("categories").select("id").eq("slug", slug);
  const { data: existing } = await (
    parentId ? dupQuery.eq("parent_id", parentId) : dupQuery.is("parent_id", null)
  ).maybeSingle();
  if (existing) return { error: "Ya existe una categoría con ese nombre en este nivel." };

  const countQuery = admin.from("categories").select("id", { count: "exact", head: true });
  const { count } = await (
    parentId ? countQuery.eq("parent_id", parentId) : countQuery.is("parent_id", null)
  );

  const { error } = await admin.from("categories").insert({
    slug,
    parent_id: parentId,
    name: trimmedName,
    // Subcategories render as plain text pills (no icon), matching today's
    // site-wide convention — only top-level categories carry an icon.
    icon: parentId ? null : icon || DEFAULT_ICON_NAME,
    sort_order: count ?? 0,
  });
  if (error) return { error: "No se pudo crear la categoría." };

  await auditLog(admin, gate.adminId, "create_category", "category", slug, { name: trimmedName });
  revalidateCategoryPaths();
  return { success: true };
}

export async function updateCategoryAction(
  id: string,
  input: { name: string; icon?: string },
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedName = input.name.trim();
  if (trimmedName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  // Deliberately never touches slug: existing listings reference it (soft
  // reference), so renaming a category must not break them.
  const update: { name: string; icon?: string } = { name: trimmedName };
  if (input.icon) update.icon = input.icon;

  const admin = createAdminClient();
  const { error } = await admin.from("categories").update(update).eq("id", id);
  if (error) return { error: "No se pudo actualizar la categoría." };

  await auditLog(admin, gate.adminId, "update_category", "category", id, { name: trimmedName });
  revalidateCategoryPaths();
  return { success: true };
}

export async function setCategoryActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("categories").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar la categoría." };

  await auditLog(admin, gate.adminId, isActive ? "show_category" : "hide_category", "category", id);
  revalidateCategoryPaths();
  return { success: true };
}

/** Deleting a top-level category cascades to its subcategories (migration
 * 0011's parent_id references ... on delete cascade) — existing listings
 * keep their now-orphaned category_slug (soft reference, never enforced). */
export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar la categoría." };

  await auditLog(admin, gate.adminId, "delete_category", "category", id);
  revalidateCategoryPaths();
  return { success: true };
}

// ── Location management ──────────────────────────────────────────────────────
// Provinces/cities live in the locations table (migration 0014), same
// service-role-only write idiom as categories. Listings/tiendas store the
// city NAME as text (soft reference), so deactivating a city only hides it
// from dropdowns — existing content is untouched.

function revalidateLocationPaths() {
  // City dropdowns exist in the header/hero, filters, publish wizard,
  // registration and account forms — layout-wide revalidation.
  revalidatePath("/", "layout");
  revalidatePath("/admin/ubicaciones");
}

export async function createLocationAction(
  name: string,
  parentId: string | null,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  const slug = categorySlugify(trimmedName);
  if (!slug) return { error: "No se pudo generar un identificador válido para ese nombre." };

  const admin = createAdminClient();

  const dupQuery = admin.from("locations").select("id").eq("slug", slug);
  const { data: existing } = await (
    parentId ? dupQuery.eq("parent_id", parentId) : dupQuery.is("parent_id", null)
  ).maybeSingle();
  if (existing) return { error: "Ya existe una ubicación con ese nombre en este nivel." };

  const countQuery = admin.from("locations").select("id", { count: "exact", head: true });
  const { count } = await (
    parentId ? countQuery.eq("parent_id", parentId) : countQuery.is("parent_id", null)
  );

  const { error } = await admin.from("locations").insert({
    slug,
    parent_id: parentId,
    name: trimmedName,
    type: parentId ? "city" : "province",
    sort_order: count ?? 0,
  });
  if (error) return { error: "No se pudo crear la ubicación." };

  await auditLog(admin, gate.adminId, "create_location", "location", slug, { name: trimmedName });
  revalidateLocationPaths();
  return { success: true };
}

export async function updateLocationAction(id: string, name: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };

  // Slug untouched on rename, same soft-reference reasoning as categories.
  const admin = createAdminClient();
  const { error } = await admin.from("locations").update({ name: trimmedName }).eq("id", id);
  if (error) return { error: "No se pudo actualizar la ubicación." };

  await auditLog(admin, gate.adminId, "update_location", "location", id, { name: trimmedName });
  revalidateLocationPaths();
  return { success: true };
}

export async function setLocationActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("locations").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar la ubicación." };

  await auditLog(admin, gate.adminId, isActive ? "show_location" : "hide_location", "location", id);
  revalidateLocationPaths();
  return { success: true };
}

/** Deleting a province cascades to its cities (0014 on delete cascade);
 * existing listings keep their city text (soft reference). */
export async function deleteLocationAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin.from("locations").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar la ubicación." };

  await auditLog(admin, gate.adminId, "delete_location", "location", id);
  revalidateLocationPaths();
  return { success: true };
}

// ── Featured listings ────────────────────────────────────────────────────────
// featured_requests is the payment-confirmation queue; listings.is_featured/
// featured_until is what the public site actually reads (ListingCard etc.),
// kept in sync by every action below rather than derived at read time.

function revalidateFeaturedPaths() {
  revalidatePath("/admin/destacados");
  revalidatePath("/");
  revalidatePath("/destacados");
}

export async function confirmFeaturedRequestAction(requestId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { data: request } = await admin
    .from("featured_requests")
    .select("listing_id, plan_days")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Solicitud no encontrada." };

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + request.plan_days * 24 * 3600 * 1000);

  const { error: reqError } = await admin
    .from("featured_requests")
    .update({
      status: "confirmed",
      confirmed_by: gate.adminId,
      confirmed_at: startsAt.toISOString(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", requestId);
  if (reqError) return { error: "No se pudo confirmar el pago." };

  const { error: listingError } = await admin
    .from("listings")
    .update({ is_featured: true, featured_until: endsAt.toISOString() })
    .eq("id", request.listing_id);
  if (listingError) return { error: "No se pudo destacar el anuncio." };

  await auditLog(admin, gate.adminId, "confirm_featured", "listing", request.listing_id, {
    planDays: request.plan_days,
  });
  revalidateFeaturedPaths();
  return { success: true };
}

export async function rejectFeaturedRequestAction(requestId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("featured_requests")
    .update({ status: "rejected", confirmed_by: gate.adminId, confirmed_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) return { error: "No se pudo rechazar la solicitud." };

  await auditLog(admin, gate.adminId, "reject_featured", "featured_request", requestId);
  revalidateFeaturedPaths();
  return { success: true };
}

export async function expireFeaturedListingAction(requestId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { data: request } = await admin
    .from("featured_requests")
    .select("listing_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Solicitud no encontrada." };

  const { error: reqError } = await admin
    .from("featured_requests")
    .update({ status: "expired" })
    .eq("id", requestId);
  if (reqError) return { error: "No se pudo actualizar la solicitud." };

  const { error: listingError } = await admin
    .from("listings")
    .update({ is_featured: false, featured_until: null })
    .eq("id", request.listing_id);
  if (listingError) return { error: "No se pudo actualizar el anuncio." };

  await auditLog(admin, gate.adminId, "expire_featured", "listing", request.listing_id);
  revalidateFeaturedPaths();
  return { success: true };
}

/** Admin-sponsored promotion, no payment — inserts an already-confirmed
 * request so it still shows up in the history table alongside real ones. */
export async function manuallyFeatureListingAction(
  listingSlug: string,
  planDays: 7 | 15 | 30,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, seller_id")
    .eq("slug", listingSlug.trim())
    .maybeSingle();
  if (!listing) return { error: "No existe ningún anuncio con ese identificador." };

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + planDays * 24 * 3600 * 1000);

  const { error: insertError } = await admin.from("featured_requests").insert({
    listing_id: listing.id,
    user_id: listing.seller_id,
    plan_days: planDays,
    amount: 0,
    payment_method: "admin_manual",
    status: "confirmed",
    confirmed_by: gate.adminId,
    confirmed_at: startsAt.toISOString(),
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });
  if (insertError) return { error: "No se pudo registrar la promoción." };

  const { error: listingError } = await admin
    .from("listings")
    .update({ is_featured: true, featured_until: endsAt.toISOString() })
    .eq("id", listing.id);
  if (listingError) return { error: "No se pudo destacar el anuncio." };

  await auditLog(admin, gate.adminId, "manual_feature", "listing", listing.id, {
    slug: listingSlug.trim(),
    planDays,
  });
  revalidateFeaturedPaths();
  return { success: true };
}

// ── Site settings ────────────────────────────────────────────────────────────
// Key-value rows in site_settings (0013). DEFAULT_SETTINGS is the whitelist:
// unknown keys and values whose type doesn't match the default are rejected,
// so the world-readable table can only ever hold the shapes the app expects.

export async function saveSiteSettingsAction(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const rows: { key: string; value: unknown; updated_at: string; updated_by: string }[] = [];
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(values)) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    if (typeof value !== typeof DEFAULT_SETTINGS[key as SiteSettingKey]) {
      return { error: `Valor inválido para "${key}".` };
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      return { error: `Valor inválido para "${key}".` };
    }
    // The color is injected into a <style> tag — restrict to a hex literal.
    if (key === "primary_color" && value !== "" && !/^#[0-9a-fA-F]{6}$/.test(String(value))) {
      return { error: "El color debe ser un valor hex (#RRGGBB)." };
    }
    rows.push({ key, value, updated_at: now, updated_by: gate.adminId });
  }
  if (rows.length === 0) return { error: "Nada que guardar." };

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert(rows);
  if (error) return { error: "No se pudieron guardar los ajustes." };

  await auditLog(admin, gate.adminId, "save_settings", "settings", null, {
    keys: rows.map((r) => r.key),
  });
  // Settings feed the root/(public) layouts (color, logo, banner,
  // maintenance) — layout-scope revalidation or headers go stale.
  revalidatePath("/", "layout");
  return { success: true };
}

const SITE_ASSET_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const SITE_ASSET_MAX_BYTES = 512 * 1024;

/** Uploads a logo to the public site-assets bucket and points logo_url at it. */
export async function uploadSiteAssetAction(
  formData: FormData,
): Promise<ActionResult & { url?: string }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen." };
  const ext = SITE_ASSET_TYPES[file.type];
  if (!ext) return { error: "Formato no soportado (PNG, JPG, WebP o SVG)." };
  if (file.size > SITE_ASSET_MAX_BYTES) return { error: "La imagen no puede superar 512 KB." };

  const admin = createAdminClient();
  const path = `logo-${Date.now()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("site-assets")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "No se pudo subir la imagen." };

  const { data } = admin.storage.from("site-assets").getPublicUrl(path);
  const url = data.publicUrl;

  const { error } = await admin.from("site_settings").upsert({
    key: "logo_url",
    value: url,
    updated_at: new Date().toISOString(),
    updated_by: gate.adminId,
  });
  if (error) return { error: "No se pudo guardar el logo." };

  await auditLog(admin, gate.adminId, "upload_logo", "settings", null, { url });
  revalidatePath("/", "layout");
  return { success: true, url };
}
