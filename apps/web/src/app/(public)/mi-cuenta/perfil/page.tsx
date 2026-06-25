"use client";

import { useState, useRef } from "react";
import { CheckCircle, Save, AlertTriangle, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { demoUser } from "@/lib/demo-user";
import { cn } from "@/lib/utils";
import { GE_CITIES } from "@/lib/cities";
import { useAppState } from "@/lib/store/app-state";

const cities = [...GE_CITIES, "Otra"];
const countries = ["Guinea Ecuatorial", "España", "Francia", "Camerún", "Nigeria", "Otro"];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function PerfilPage() {
  const { profilePicture, setProfilePicture, clearProfilePicture } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: demoUser.name,
    username: demoUser.username,
    bio: demoUser.bio,
    city: demoUser.city,
    country: demoUser.country,
    phone: demoUser.phone,
    whatsapp: demoUser.whatsapp,
    email: demoUser.email,
    showPhone: true,
    showEmail: false,
    notifyApproved: true,
    notifyRejected: true,
    notifyExpiring: true,
    notifyReview: false,
  });

  const inputClass =
    "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfilePicture(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>
        <button
          type="submit"
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            saved
              ? "bg-green-600 text-white"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {/* Avatar */}
      <SectionCard title="Foto de perfil">
        <div className="flex items-center gap-4">
          <UserAvatar name={form.name} src={profilePicture} size="lg" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Subir foto
              </button>
              {profilePicture && (
                <button
                  type="button"
                  onClick={clearProfilePicture}
                  className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máx. 5 MB.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handlePhotoChange}
          />
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard title="Información personal">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field
              label="Nombre de usuario"
              hint="Aparece en la URL de tu perfil público: /usuario/francisco_ge"
            >
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Biografía" hint="Máximo 300 caracteres.">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ciudad">
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              >
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="País">
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass}
              >
                {countries.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Contact info */}
      <SectionCard title="Información de contacto">
        <div className="space-y-4">
          <Field label="Teléfono">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="WhatsApp" hint="Número que aparecerá en los botones de contacto de tus anuncios.">
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Correo electrónico">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visibilidad</p>
            {[
              { key: "showPhone" as const, label: "Mostrar teléfono en mis anuncios" },
              { key: "showEmail" as const, label: "Mostrar correo en mi perfil público" },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="size-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Seguridad">
        <div className="space-y-4">
          <Field label="Contraseña actual">
            <input type="password" placeholder="••••••••" className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nueva contraseña">
              <input type="password" placeholder="Mínimo 8 caracteres" className={inputClass} />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <input type="password" placeholder="Repite la contraseña" className={inputClass} />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Notification preferences */}
      <SectionCard title="Preferencias de notificación">
        <div className="space-y-2.5">
          {[
            { key: "notifyApproved" as const, label: "Anuncio aprobado" },
            { key: "notifyRejected" as const, label: "Anuncio rechazado" },
            { key: "notifyExpiring" as const, label: "Anuncio próximo a expirar" },
            { key: "notifyReview" as const, label: "Nueva reseña recibida" },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="size-4 accent-primary rounded"
              />
              <span className="text-sm text-muted-foreground">{label}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Zona de peligro</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="rounded-xl border border-destructive/30 bg-background px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
          >
            Desactivar mi cuenta
          </button>
          <button
            type="button"
            className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </form>
  );
}
