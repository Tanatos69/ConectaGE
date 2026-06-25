"use client";

import { useState } from "react";
import { Save, CheckCircle, AlertTriangle } from "lucide-react";
import { siteSettings, type SiteSettingKey } from "@/lib/demo-admin";

interface SettingDefinition {
  key: SiteSettingKey;
  label: string;
  description: string;
  type: "text" | "number" | "toggle" | "select";
  options?: string[];
  group: string;
}

const settingDefs: SettingDefinition[] = [
  {
    key: "site_whatsapp",
    label: "WhatsApp del sitio",
    description: "Número que aparece en el botón flotante de WhatsApp global.",
    type: "text",
    group: "Contacto",
  },
  {
    key: "contact_email",
    label: "Correo de contacto",
    description: "Email mostrado en la página de contacto.",
    type: "text",
    group: "Contacto",
  },
  {
    key: "listing_expiry_days",
    label: "Días hasta expiración",
    description: "Número de días antes de que un anuncio expire automáticamente.",
    type: "number",
    group: "Anuncios",
  },
  {
    key: "max_images_per_listing",
    label: "Máx. imágenes por anuncio",
    description: "Número máximo de fotos que el usuario puede subir por anuncio.",
    type: "number",
    group: "Anuncios",
  },
  {
    key: "max_listings_per_day",
    label: "Máx. anuncios por día / usuario",
    description: "Límite diario de publicaciones por usuario (antiabuso).",
    type: "number",
    group: "Anuncios",
  },
  {
    key: "moderation_required",
    label: "Moderación obligatoria",
    description: "Todos los anuncios pasan por la cola de moderación antes de publicarse.",
    type: "toggle",
    group: "Moderación",
  },
  {
    key: "auto_approve_verified",
    label: "Auto-aprobar vendedores verificados",
    description: "Los Vendedores Verificados bypasean la cola de moderación.",
    type: "toggle",
    group: "Moderación",
  },
  {
    key: "maintenance_mode",
    label: "Modo mantenimiento",
    description: "Muestra una página de mantenimiento al público. El admin sigue accediendo.",
    type: "toggle",
    group: "Sistema",
  },
  {
    key: "featured_price_7d",
    label: "Precio destacado 7 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 7 días.",
    type: "number",
    group: "Planes",
  },
  {
    key: "featured_price_15d",
    label: "Precio destacado 15 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 15 días.",
    type: "number",
    group: "Planes",
  },
  {
    key: "featured_price_30d",
    label: "Precio destacado 30 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 30 días.",
    type: "number",
    group: "Planes",
  },
  {
    key: "default_language",
    label: "Idioma por defecto",
    description: "Idioma predeterminado del sitio para nuevos visitantes.",
    type: "select",
    options: ["es", "fr", "en", "pt", "fa", "bube"],
    group: "Sistema",
  },
  {
    key: "keyword_blacklist",
    label: "Lista negra de palabras clave",
    description: "Palabras separadas por espacios. Los anuncios que las contengan se marcan automáticamente para revisión.",
    type: "text",
    group: "Moderación automática",
  },
  {
    key: "max_reports_before_auto_remove",
    label: "Reportes para retirada automática",
    description: "Número de reportes recibidos antes de retirar el anuncio automáticamente y notificar al moderador.",
    type: "number",
    group: "Moderación automática",
  },
  {
    key: "min_account_age_days_to_skip_queue",
    label: "Antigüedad mínima para omitir cola (días)",
    description: "Cuentas verificadas más antiguas que este número de días pueden publicar sin pasar por la cola.",
    type: "number",
    group: "Moderación automática",
  },
  {
    key: "auto_flag_price_above",
    label: "Precio máximo sin revisión (FCFA)",
    description: "Los anuncios con precio superior a este valor se marcan automáticamente para revisión manual.",
    type: "number",
    group: "Moderación automática",
  },
];

const groups = [...new Set(settingDefs.map((s) => s.group))];

export default function AdminAjustesPage() {
  const [values, setValues] = useState<Record<SiteSettingKey, string>>(
    siteSettings as Record<SiteSettingKey, string>,
  );
  const [saved, setSaved] = useState(false);

  function handleChange(key: SiteSettingKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleToggle(key: SiteSettingKey) {
    setValues((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (values.maintenance_mode === "true") {
      document.cookie = "conectage_maintenance=true;path=/;max-age=86400";
    } else {
      document.cookie = "conectage_maintenance=;path=/;max-age=0";
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ajustes del sitio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configuración global de la plataforma</p>
        </div>
        <button
          type="submit"
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            saved ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {values.maintenance_mode === "true" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Modo mantenimiento activo.</strong> Los visitantes están viendo la página de mantenimiento ahora mismo.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group} className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-foreground">{group}</h2>
          <div className="space-y-5">
            {settingDefs
              .filter((s) => s.group === group)
              .map((def) => (
                <div key={def.key}>
                  {def.type === "toggle" ? (
                    <label className="flex cursor-pointer items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{def.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(def.key)}
                        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                          values[def.key] === "true" ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                            values[def.key] === "true" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">{def.label}</label>
                      <p className="mb-2 text-xs text-muted-foreground">{def.description}</p>
                      {def.type === "select" ? (
                        <select
                          value={values[def.key]}
                          onChange={(e) => handleChange(def.key, e.target.value)}
                          className={inputClass}
                        >
                          {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={def.type}
                          value={values[def.key]}
                          onChange={(e) => handleChange(def.key, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </form>
  );
}
