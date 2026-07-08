"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, NOT_CONFIGURED_ERROR } from "@/lib/supabase/config";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/** Public origin for auth redirects (works locally, on Netlify previews and prod). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Strip spaces/dashes so "+240 222 000 000" passes the +XXXXXXXXX check. */
function normalizePhone(raw: string): string {
  return raw.replace(/[^+0-9]/g, "");
}

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\+[0-9]{6,15}$/, "Introduce un número válido con prefijo, ej. +240222000000"));

const signInSchema = z.object({
  email: z.email("Correo electrónico no válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

const signUpSchema = z.object({
  email: z.email("Correo electrónico no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
  fullName: z.string().trim().min(3, "Introduce tu nombre completo").max(80),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Selecciona tu ciudad").max(60),
});

// ── Sign in ──────────────────────────────────────────────────────────────────

export async function signInAction(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada." };
    }
    return { error: "Credenciales incorrectas. Intenta de nuevo." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  revalidatePath("/", "layout");

  const next = input.next && input.next.startsWith("/") ? input.next : "/mi-cuenta";
  redirect(profile?.role === "admin" ? "/admin" : next);
}

// ── Sign up ──────────────────────────────────────────────────────────────────

export async function signUpAction(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/mi-cuenta`,
      // Copied into public.profiles by the handle_new_user() trigger.
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
    }
    if (error.code === "weak_password") {
      return { error: "La contraseña es demasiado débil. Usa al menos 8 caracteres." };
    }
    return { error: "No se pudo crear la cuenta. Intenta de nuevo en unos minutos." };
  }

  // Supabase returns an obfuscated existing user (empty identities) instead
  // of erroring when the email is already registered and confirmation is on.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
  }

  return { success: true };
}

// ── OAuth ────────────────────────────────────────────────────────────────────

export async function signInWithOAuthAction(
  provider: "google" | "facebook",
  next?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const safeNext = next && next.startsWith("/") ? next : "/mi-cuenta";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  });

  if (error || !data.url) {
    return { error: "No se pudo iniciar con ese proveedor. Intenta de nuevo." };
  }
  redirect(data.url);
}

// ── Sign out ─────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

// ── Password recovery ────────────────────────────────────────────────────────

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = z.email().safeParse(email.toLowerCase().trim());
  if (!parsed.success) return { error: "Correo electrónico no válido" };

  const supabase = await createClient();
  const origin = await siteOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/callback?next=/resetear-contrasena`,
  });

  // Always succeed to avoid leaking which emails exist.
  return { success: true };
}

export async function updatePasswordAction(password: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = z.string().min(8, "Mínimo 8 caracteres").max(72).safeParse(password);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    if (error.code === "same_password") {
      return { error: "La nueva contraseña debe ser distinta de la actual." };
    }
    return { error: "No se pudo actualizar la contraseña. Abre de nuevo el enlace del correo." };
  }
  return { success: true };
}

// ── Profile ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Introduce tu nombre completo").max(80),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Selecciona tu ciudad").max(60),
});

export async function updateProfileAction(input: {
  fullName: string;
  phone: string;
  city: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // role/verified are intentionally not touchable here; a DB trigger blocks
  // them anyway even if someone crafts their own UPDATE.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar el perfil. Intenta de nuevo." };

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * The photo itself is uploaded client-side straight to the `avatars` bucket
 * (RLS restricts writes to the user's own {uid}/ folder); this action only
 * persists the resulting public URL, and only accepts one that actually
 * lives inside that folder.
 */
export async function updateAvatarAction(avatarUrl: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // Empty string clears the avatar; otherwise it must live in the user's own
  // Storage folder.
  const expectedPrefix = `/avatars/${user.id}/`;
  if (avatarUrl !== "" && !avatarUrl.includes(expectedPrefix)) {
    return { error: "Imagen no válida." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl || null })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar la foto de perfil." };

  revalidatePath("/", "layout");
  return { success: true };
}
