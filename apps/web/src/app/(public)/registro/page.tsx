"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { signUpAction, signInWithOAuthAction } from "@/lib/actions/auth";
import { GE_CITIES } from "@/lib/cities";

const cities = [...GE_CITIES, "Otra"];

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

// Latest selectable birth date (must be at least 16 years old).
const MAX_BIRTH_DATE = new Date(Date.now() - 16 * 365.25 * 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10);

export default function RegistroPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthDate: "",
  });
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set(partial: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await signUpAction({
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
        email: form.email,
        password: form.password,
        gender: form.gender,
        birthDate: form.birthDate,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmittedEmail(form.email);
      }
    });
  }

  function handleOAuth(provider: "google" | "facebook") {
    setError("");
    startTransition(async () => {
      const result = await signInWithOAuthAction(provider);
      if (result?.error) setError(result.error);
    });
  }

  // Email confirmation is ON: no session until the user clicks the link.
  if (submittedEmail) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-50">
            <MailCheck className="size-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hemos enviado un enlace de confirmación a{" "}
            <strong className="text-foreground">{submittedEmail}</strong>. Abre el correo y pulsa
            el enlace para activar tu cuenta. Revisa también la carpeta de spam.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-bold text-foreground">Crea tu cuenta gratis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publica anuncios y contacta vendedores por WhatsApp.
          </p>

          {/* Social signup */}
          <div className="mt-5 space-y-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleOAuth("facebook")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="#1877F2" className="size-4" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuar con Facebook
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o regístrate con email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Tu nombre y apellidos"
                value={form.fullName}
                onChange={(e) => set({ fullName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Número de teléfono (WhatsApp) <span className="text-destructive">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+240 222 000 000"
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Los compradores te contactarán por WhatsApp a este número.
              </p>
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">
                Ciudad <span className="text-destructive">*</span>
              </label>
              <select
                id="city"
                name="city"
                required
                value={form.city}
                onChange={(e) => set({ city: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecciona tu ciudad</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Correo electrónico <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Contraseña <span className="text-destructive">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => set({ password: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirmar contraseña <span className="text-destructive">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChange={(e) => set({ confirmPassword: e.target.value })}
                className={inputClass}
              />
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">Las contraseñas no coinciden.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-foreground">
                  Género{" "}
                  <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                </label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => set({ gender: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Prefiero no indicarlo</option>
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium text-foreground">
                  Fecha de nacimiento{" "}
                  <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set({ birthDate: e.target.value })}
                  max={MAX_BIRTH_DATE}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 size-4 accent-primary rounded"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
                Acepto los{" "}
                <Link href="/terminos" className="text-primary hover:underline" target="_blank">
                  Términos de uso
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className="text-primary hover:underline" target="_blank">
                  Política de privacidad
                </Link>
              </label>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {pending ? "Creando cuenta…" : "Crear cuenta gratis"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
