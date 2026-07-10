"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth/context";
import { updateProfileAction } from "@/lib/actions/auth";
import { PhoneInput } from "@/components/ui/phone-input";
import { GE_CITIES } from "@/lib/cities";

const cities = [...GE_CITIES, "Otra"];

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

// Latest selectable birth date (must be at least 16 years old).
const MAX_BIRTH_DATE = new Date(Date.now() - 16 * 365.25 * 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10);

/**
 * OAuth signups arrive without a phone number or birth date, but posting a
 * listing needs both (WhatsApp contact + the 16+ age gate). The middleware
 * redirects incomplete profiles here before they can reach /publicar.
 */
function CompletarPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/publicar";
  const { profile } = useAuth();

  const [form, setForm] = useState({
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    birthDate: profile?.birth_date ?? "",
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await updateProfileAction(form);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(next.startsWith("/") ? next : "/publicar");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <UserCheck className="size-6 text-primary" />
          </div>

          <h1 className="text-xl font-bold text-foreground">Completa tu perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Para publicar anuncios necesitamos tu número de WhatsApp: es el canal por el que los
            compradores te contactarán.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Tu nombre y apellidos"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Número de teléfono (WhatsApp) <span className="text-destructive">*</span>
              </label>
              <PhoneInput
                id="phone"
                required
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium text-foreground">
                Fecha de nacimiento <span className="text-destructive">*</span>
              </label>
              <input
                id="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                max={MAX_BIRTH_DATE}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Debes tener al menos 16 años para usar ConectaGE.
              </p>
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">
                Ciudad <span className="text-destructive">*</span>
              </label>
              <select
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecciona tu ciudad</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar y continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompletarPerfilPage() {
  return (
    <Suspense>
      <CompletarPerfilForm />
    </Suspense>
  );
}
