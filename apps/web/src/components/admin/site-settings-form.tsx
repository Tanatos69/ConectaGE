"use client";

import { useRef, useState, useTransition } from "react";
import { Save, CheckCircle, AlertTriangle, Upload, X, Loader2 } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  type SiteSettings,
  type SiteSettingKey,
} from "@/lib/site-settings";
import { saveSiteSettingsAction, uploadSiteAssetAction } from "@/lib/actions/admin";

interface SettingDefinition {
  key: SiteSettingKey;
  label: string;
  description: string;
  type: "text" | "number" | "toggle" | "color" | "textarea";
  group: string;
}

const settingDefs: SettingDefinition[] = [
  {
    key: "site_name",
    label: "Nombre del sitio",
    description: "Se muestra en la cabecera, el pie y los títulos de página.",
    type: "text",
    group: "Identidad y apariencia",
  },
  {
    key: "primary_color",
    label: "Color principal",
    description: "Color de marca de botones y enlaces. Déjalo vacío para usar el azul GEMarket.",
    type: "color",
    group: "Identidad y apariencia",
  },
  {
    key: "footer_tagline",
    label: "Lema del pie de página",
    description: "Frase corta bajo el logo en el pie del sitio.",
    type: "text",
    group: "Identidad y apariencia",
  },
  {
    key: "announcement_enabled",
    label: "Mostrar barra de anuncio",
    description: "Barra destacada en la parte superior del sitio público.",
    type: "toggle",
    group: "Barra de anuncio",
  },
  {
    key: "announcement_text",
    label: "Texto del anuncio",
    description: "Mensaje que se muestra en la barra (ej.: promoción, aviso de la plataforma).",
    type: "text",
    group: "Barra de anuncio",
  },
  {
    key: "announcement_href",
    label: "Enlace del anuncio (opcional)",
    description: "URL a la que lleva la barra al hacer clic. Vacío = sin enlace.",
    type: "text",
    group: "Barra de anuncio",
  },
  {
    key: "home_show_categories",
    label: "Mostrar categorías en portada",
    description: "Sección de rejilla de categorías en la página de inicio.",
    type: "toggle",
    group: "Portada",
  },
  {
    key: "home_show_featured",
    label: "Mostrar destacados en portada",
    description: "Sección de anuncios destacados en la página de inicio.",
    type: "toggle",
    group: "Portada",
  },
  {
    key: "home_show_stores",
    label: "Mostrar tiendas en portada",
    description: "Franja de tiendas profesionales en la página de inicio.",
    type: "toggle",
    group: "Portada",
  },
  {
    key: "site_whatsapp",
    label: "WhatsApp del sitio",
    description: "Número de contacto oficial de la plataforma.",
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
    description: "Los vendedores verificados publican sin pasar por la cola.",
    type: "toggle",
    group: "Moderación",
  },
  {
    key: "keyword_blacklist",
    label: "Lista negra de palabras clave",
    description:
      "Palabras separadas por espacios. Los anuncios que las contengan se marcan automáticamente para revisión.",
    type: "text",
    group: "Moderación automática",
  },
  {
    key: "max_reports_before_auto_remove",
    label: "Reportes para retirada automática",
    description: "Número de reportes recibidos antes de retirar el anuncio automáticamente.",
    type: "number",
    group: "Moderación automática",
  },
  {
    key: "min_account_age_days_to_skip_queue",
    label: "Antigüedad mínima para omitir cola (días)",
    description: "Cuentas más antiguas que este número de días pueden publicar sin cola.",
    type: "number",
    group: "Moderación automática",
  },
  {
    key: "auto_flag_price_above",
    label: "Precio máximo sin revisión (FCFA)",
    description: "Anuncios con precio superior se marcan para revisión manual.",
    type: "number",
    group: "Moderación automática",
  },
  {
    key: "featured_price_7d",
    label: "Precio destacado 7 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 7 días.",
    type: "number",
    group: "Planes destacados",
  },
  {
    key: "featured_price_15d",
    label: "Precio destacado 15 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 15 días.",
    type: "number",
    group: "Planes destacados",
  },
  {
    key: "featured_price_30d",
    label: "Precio destacado 30 días (FCFA)",
    description: "Precio del plan de anuncio destacado de 30 días.",
    type: "number",
    group: "Planes destacados",
  },
  {
    key: "payment_instructions",
    label: "Instrucciones de pago",
    description:
      "Se muestran al vendedor al solicitar un destacado (transferencia, dinero móvil, comprobante).",
    type: "textarea",
    group: "Planes destacados",
  },
  {
    key: "maintenance_mode",
    label: "Modo mantenimiento",
    description: "Muestra una página de mantenimiento al público. Los admins siguen accediendo.",
    type: "toggle",
    group: "Sistema",
  },
];

const groups = [...new Set(settingDefs.map((s) => s.group))];

/** String form-state → typed payload, driven by each default's type. */
function toPayload(values: Record<SiteSettingKey, string>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(values)) {
    const def = DEFAULT_SETTINGS[key as SiteSettingKey];
    if (typeof def === "boolean") payload[key] = raw === "true";
    else if (typeof def === "number") payload[key] = Number(raw);
    else payload[key] = raw;
  }
  return payload;
}

export function SiteSettingsForm({ initialValues }: { initialValues: SiteSettings }) {
  const [values, setValues] = useState<Record<SiteSettingKey, string>>(() => {
    const out = {} as Record<SiteSettingKey, string>;
    for (const key of Object.keys(DEFAULT_SETTINGS) as SiteSettingKey[]) {
      out[key] = String(initialValues[key]);
    }
    return out;
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [uploading, startUploading] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(key: SiteSettingKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }

  function handleToggle(key: SiteSettingKey) {
    handleChange(key, values[key] === "true" ? "false" : "true");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const payload = toPayload(values);
    for (const [key, v] of Object.entries(payload)) {
      if (typeof v === "number" && !Number.isFinite(v)) {
        setError(`Revisa el campo numérico "${key}": no es un número válido.`);
        return;
      }
    }
    startSaving(async () => {
      const result = await saveSiteSettingsAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleLogoUpload(file: File | null) {
    if (!file || uploading) return;
    startUploading(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadSiteAssetAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) handleChange("logo_url", result.url);
    });
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ajustes del sitio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configuración global de la plataforma
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
            saved ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="size-4 mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {values.maintenance_mode === "true" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Modo mantenimiento activo.</strong> Al guardar, los visitantes verán la página
            de mantenimiento.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group} className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-foreground">{group}</h2>
          <div className="space-y-5">
            {group === "Identidad y apariencia" && (
              <div>
                <p className="text-sm font-medium text-foreground">Logo del sitio</p>
                <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                  PNG, JPG, WebP o SVG, máx. 512 KB. Sustituye al logo por defecto en la cabecera.
                  El cambio de logo se aplica al subirlo, sin necesidad de guardar.
                </p>
                <div className="flex items-center gap-3">
                  {values.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={values.logo_url}
                      alt="Logo actual"
                      className="h-10 max-w-40 rounded-lg border bg-background object-contain px-2"
                    />
                  ) : (
                    <span className="flex h-10 items-center rounded-lg border border-dashed px-3 text-xs text-muted-foreground">
                      Logo por defecto
                    </span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Subir logo
                  </button>
                  {values.logo_url && (
                    <button
                      type="button"
                      onClick={() => handleChange("logo_url", "")}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <X className="size-4" />
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            )}
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
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        {def.label}
                      </label>
                      <p className="mb-2 text-xs text-muted-foreground">{def.description}</p>
                      {def.type === "color" ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={values[def.key] || "#2563EB"}
                            onChange={(e) => handleChange(def.key, e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-background p-1"
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {values[def.key] || "por defecto"}
                          </span>
                          {values[def.key] && (
                            <button
                              type="button"
                              onClick={() => handleChange(def.key, "")}
                              className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              Restablecer
                            </button>
                          )}
                        </div>
                      ) : def.type === "textarea" ? (
                        <textarea
                          value={values[def.key]}
                          onChange={(e) => handleChange(def.key, e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
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
