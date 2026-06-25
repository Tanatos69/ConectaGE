"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Save, Store, AlertTriangle, Trash2, Clock, MapPin, Instagram, Facebook, ShieldCheck } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { demoStores } from "@/lib/stores";
import type { VerificationStatus } from "@/lib/stores";
import { GE_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";

const LOGO_KEY = "conectage-store-logo-boutique-malabo";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function MiTiendaPage() {
  const demoStore = demoStores.find((s) => s.slug === "boutique-malabo")!;

  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [nif, setNif] = useState(demoStore.nif ?? "");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    demoStore.verificationStatus
  );
  const [form, setForm] = useState({
    name: demoStore.name,
    tagline: demoStore.tagline,
    description: demoStore.description,
    city: demoStore.city,
    address: demoStore.address ?? "",
    neighborhood: demoStore.neighborhood ?? "",
    businessHours: demoStore.businessHours ?? "",
    instagram: demoStore.instagram ?? "",
    facebook: demoStore.facebook ?? "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOGO_KEY);
    if (stored) setLogo(stored);
  }, []);

  const inputClass =
    "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogo(result);
      localStorage.setItem(LOGO_KEY, result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveLogo() {
    setLogo(null);
    localStorage.removeItem(LOGO_KEY);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleRequestVerification() {
    if (!nif.trim()) return;
    setVerificationStatus("pending");
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Mi tienda</h1>
        </div>
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

      {/* Logo */}
      <SectionCard title="Logo de la tienda">
        <div className="flex items-center gap-4">
          <UserAvatar name={form.name} src={logo} size="lg" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Subir logo
              </button>
              {logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máx. 5 MB. Se mostrará como avatar de la tienda.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleLogoChange}
          />
        </div>
      </SectionCard>

      {/* Basic info */}
      <SectionCard title="Información básica">
        <div className="space-y-4">
          <Field label="Nombre de la tienda">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Eslogan" hint="Breve descripción que aparece en la tarjeta de tu tienda.">
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              maxLength={100}
              className={inputClass}
            />
          </Field>
          <Field label="Descripción completa" hint="Máximo 1000 caracteres.">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000}
              rows={4}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Location */}
      <SectionCard title="Ubicación">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ciudad">
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              >
                {GE_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Barrio / Zona">
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="Hacienda, Centro, Ela Nguema…"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Dirección" hint="Se mostrará en la página de tu tienda para que los clientes te encuentren.">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Calle, número, edificio…"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Hours */}
      <SectionCard title="Horario de atención">
        <Field label="Horario" hint='Ejemplo: "Lun–Vie 9:00–18:00, Sáb 9:00–14:00"'>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={form.businessHours}
              onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
              placeholder="Lun–Vie 9:00–18:00, Sáb 9:00–14:00"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </Field>
      </SectionCard>

      {/* Social */}
      <SectionCard title="Redes sociales">
        <div className="space-y-4">
          <Field label="Instagram" hint="Solo el nombre de usuario, sin @">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="tutienda_ge"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>
          <Field label="Facebook" hint="Nombre de la página de Facebook">
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="TuTiendaGE"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Verification */}
      <SectionCard title="Verificación de tienda">
        {verificationStatus === "verified" && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">Tienda Verificada</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tu tienda está verificada. Aparece con el sello de confianza en toda la plataforma.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "pending" && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Verificación en proceso</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hemos recibido tu solicitud. El equipo de ConectaGE la revisará en 2–5 días hábiles.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "unverified" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verifica tu tienda para obtener el sello de confianza. Los compradores confían más en tiendas verificadas.
              Para verificarte, introduce tu NIF/RUT empresarial y envía la solicitud.
            </p>
            <Field label="NIF / Registro empresarial" hint="Número de identificación fiscal o registro mercantil.">
              <input
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                placeholder="GE-YYYY-XXX"
                className={inputClass}
              />
            </Field>
            <button
              type="button"
              disabled={!nif.trim()}
              onClick={handleRequestVerification}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="size-4" />
              Solicitar verificación
            </button>
          </div>
        )}
      </SectionCard>
    </form>
  );
}
