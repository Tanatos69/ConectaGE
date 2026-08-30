import { z } from "zod";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { getSupabaseClient } from "./supabase/client";

export interface ActionResult {
  error?: string;
  success?: boolean;
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

const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say", ""]).optional();

function isValidAdultBirthDate(v: string): boolean {
  const d = new Date(v);
  if (isNaN(d.getTime())) return false;
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 16);
  return d > new Date("1900-01-01") && d <= minAge;
}

const requiredBirthDateSchema = z
  .string()
  .min(1, "Indica tu fecha de nacimiento.")
  .refine(isValidAdultBirthDate, {
    message: "Debes tener al menos 16 años para crear una cuenta.",
  });

const signUpSchema = z.object({
  email: z.email("Correo electrónico no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
  fullName: z.string().trim().min(3, "Introduce tu nombre completo").max(80),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Selecciona tu ciudad").max(60),
  gender: genderSchema,
  birthDate: requiredBirthDateSchema,
});

/** Same deep link both OAuth and email-confirmation links redirect back to. */
export const AUTH_CALLBACK_URL = Linking.createURL("auth/callback");

export async function signIn(input: { email: string; password: string }): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getSupabaseClient();
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
    .select("blocked_at, blocked_reason")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.blocked_at) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      error: "Tu cuenta ha sido bloqueada. Motivo: " + (profile.blocked_reason || "no especificado"),
    };
  }

  return { success: true };
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  gender?: string;
  birthDate?: string;
}): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.password,
    options: {
      emailRedirectTo: AUTH_CALLBACK_URL,
      // Copied into public.profiles by the handle_new_user() trigger.
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        ...(parsed.data.gender && { gender: parsed.data.gender }),
        ...(parsed.data.birthDate && { birth_date: parsed.data.birthDate }),
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

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
  }

  return { success: true };
}

/**
 * Opens the provider's login page in an in-app browser and waits for the
 * app deep link back (scheme from app.json). The app/auth/callback route does the actual
 * supabase.auth.exchangeCodeForSession(code) once the redirect lands.
 */
export async function signInWithOAuth(provider: "google" | "facebook"): Promise<ActionResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: AUTH_CALLBACK_URL, skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return { error: "No se pudo iniciar con ese proveedor. Intenta de nuevo." };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_CALLBACK_URL);
  if (result.type !== "success") {
    return { error: "Inicio de sesión cancelado." };
  }
  return { success: true };
}

export async function resetPassword(email: string): Promise<ActionResult> {
  const parsed = z.email("Correo electrónico no válido").safeParse(email.trim());
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.toLowerCase(), {
    redirectTo: AUTH_CALLBACK_URL,
  });
  if (error) return { error: "No se pudo enviar el correo. Intenta de nuevo." };
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut({ scope: "local" });
}
