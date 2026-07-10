"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Save, AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/lib/auth/context";
import { updateProfileAction, updatePasswordAction, updateAvatarAction } from "@/lib/actions/auth";
import { updateNotificationPreferencesAction } from "@/lib/actions/notifications";
import { PhoneInput } from "@/components/ui/phone-input";
import { createClient } from "@/lib/supabase/client";
import { compressImage, AVATAR_PRESET } from "@/lib/image-compress";
import { cn } from "@/lib/utils";
import { useCities } from "@/lib/store/cities-context";

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

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

// Latest selectable birth date (must be at least 16 years old).
const MAX_BIRTH_DATE = new Date(Date.now() - 16 * 365.25 * 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10);

export default function EditarPerfilPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const cities = [...useCities().cities, "Otra"];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.full_name ?? "",
    city: profile?.city ?? "",
    phone: profile?.phone ?? "",
    gender: profile?.gender ?? "",
    birthDate: profile?.birth_date ?? "",
  });

  // Refill the form when the profile arrives/changes (render-time adjustment).
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(profile?.id ?? null);
  if (profile && profile.id !== loadedProfileId) {
    setLoadedProfileId(profile.id);
    setForm({
      name: profile.full_name ?? "",
      city: profile.city ?? "",
      phone: profile.phone ?? "",
      gender: profile.gender ?? "",
      birthDate: profile.birth_date ?? "",
    });
  }

  // Password change state
  const [passwords, setPasswords] = useState({ next: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordPending, startPasswordTransition] = useTransition();

  // Notification preference toggles
  const [notifyPrefs, setNotifyPrefs] = useState({
    notifyListings: profile?.notify_listings ?? true,
    notifySellerRequests: profile?.notify_seller_requests ?? true,
    notifyFollowedStores: profile?.notify_followed_stores ?? true,
  });
  const [loadedPrefsId, setLoadedPrefsId] = useState<string | null>(profile?.id ?? null);
  if (profile && profile.id !== loadedPrefsId) {
    setLoadedPrefsId(profile.id);
    setNotifyPrefs({
      notifyListings: profile.notify_listings,
      notifySellerRequests: profile.notify_seller_requests,
      notifyFollowedStores: profile.notify_followed_stores,
    });
  }
  const [notifyPending, startNotifyTransition] = useTransition();
  const [notifySaved, setNotifySaved] = useState(false);

  function handleNotifyToggle(key: keyof typeof notifyPrefs, value: boolean) {
    const next = { ...notifyPrefs, [key]: value };
    setNotifyPrefs(next);
    setNotifySaved(false);
    startNotifyTransition(async () => {
      const result = await updateNotificationPreferencesAction(next);
      if (!result?.error) {
        setNotifySaved(true);
        setTimeout(() => setNotifySaved(false), 2000);
      }
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await updateProfileAction({
        fullName: form.name,
        phone: form.phone,
        city: form.city,
        gender: form.gender,
        birthDate: form.birthDate,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  function handlePasswordChange() {
    if (passwords.next.length < 8) {
      setPasswordMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setPasswordMsg(null);
    startPasswordTransition(async () => {
      const result = await updatePasswordAction(passwords.next);
      if (result?.error) {
        setPasswordMsg({ ok: false, text: result.error });
      } else {
        setPasswordMsg({ ok: true, text: "Contraseña actualizada." });
        setPasswords({ next: "", confirm: "" });
      }
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    e.target.value = "";
    if (!rawFile || !user) return;

    setError("");
    setAvatarUploading(true);
    try {
      const file = await compressImage(rawFile, AVATAR_PRESET);
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Bust the CDN/browser cache since we upsert the same path every time.
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const result = await updateAvatarAction(url);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("No se pudo subir la foto. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleRemovePhoto() {
    setError("");
    startTransition(async () => {
      const result = await updateAvatarAction("");
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/mi-cuenta/perfil"
            className="flex size-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground hover:bg-secondary"
            aria-label="Volver a mi perfil"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Editar perfil</h1>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
            saved
              ? "bg-green-600 text-white"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
          {saved ? "¡Guardado!" : pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {/* Avatar */}
      <SectionCard title="Foto de perfil">
        <div className="flex items-center gap-4">
          <UserAvatar name={form.name || "U"} src={profile?.avatar_url} size="lg" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
              >
                {avatarUploading ? "Subiendo…" : "Subir foto"}
              </button>
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={avatarUploading}
                  className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-60"
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
            <Field label="Ciudad">
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecciona tu ciudad</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Optional demographics */}
      <SectionCard title="Información demográfica (opcional)">
        <p className="mb-4 text-xs text-muted-foreground">
          Estos datos son opcionales y nos ayudan a mejorar ConectaGE. Se usan solo de forma
          agregada y nunca se venden a terceros.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Género">
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className={inputClass}
            >
              <option value="">Prefiero no indicarlo</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Otro</option>
            </select>
          </Field>
          <Field label="Fecha de nacimiento" hint="Tu edad se calcula automáticamente y nunca se muestra a otros usuarios.">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              max={MAX_BIRTH_DATE}
              className={inputClass}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Contact info */}
      <SectionCard title="Información de contacto">
        <div className="space-y-4">
          <Field
            label="Teléfono (WhatsApp)"
            hint="Número que aparecerá en los botones de contacto de tus anuncios. Puede ser de cualquier país."
          >
            <PhoneInput
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
            />
          </Field>
          <Field label="Correo electrónico" hint="El correo de acceso no se puede cambiar desde aquí.">
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className={cn(inputClass, "opacity-60")}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Seguridad">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nueva contraseña">
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <input
                type="password"
                placeholder="Repite la contraseña"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
          </div>
          {passwordMsg && (
            <p
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                passwordMsg.ok
                  ? "bg-green-50 text-green-700"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {passwordMsg.text}
            </p>
          )}
          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={passwordPending || !passwords.next}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            {passwordPending ? "Actualizando…" : "Cambiar contraseña"}
          </button>
        </div>
      </SectionCard>

      {/* Notification preferences */}
      <SectionCard title="Preferencias de notificación">
        <div className="space-y-3">
          {(
            [
              {
                key: "notifyListings" as const,
                label: "Mis anuncios",
                hint: "Cuando uno de tus anuncios se publica.",
              },
              {
                key: "notifySellerRequests" as const,
                label: "Mi tienda",
                hint: "Cuando tu solicitud de tienda se aprueba o rechaza.",
              },
              {
                key: "notifyFollowedStores" as const,
                label: "Tiendas que sigo",
                hint: "Cuando una tienda que sigues publica un anuncio nuevo.",
              },
            ]
          ).map(({ key, label, hint }) => (
            <label key={key} className="flex cursor-pointer items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
              <input
                type="checkbox"
                checked={notifyPrefs[key]}
                disabled={notifyPending}
                onChange={(e) => handleNotifyToggle(key, e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-primary rounded"
              />
            </label>
          ))}
          {notifySaved && (
            <p className="text-xs font-medium text-green-600">Preferencias guardadas.</p>
          )}
        </div>
      </SectionCard>

      {/* Bottom save — mirrors the top button so changes made at the bottom
          of the page (demographics, contact) are never lost by navigating
          away without scrolling back up. */}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60",
          saved ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90",
        )}
      >
        {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
        {saved ? "¡Guardado!" : pending ? "Guardando…" : "Guardar cambios"}
      </button>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Zona de peligro</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Para desactivar o eliminar tu cuenta, contáctanos desde la página de contacto.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled
            className="rounded-xl border border-destructive/30 bg-background px-4 py-2.5 text-sm font-medium text-destructive opacity-60"
          >
            Desactivar mi cuenta
          </button>
          <button
            type="button"
            disabled
            className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </form>
  );
}
