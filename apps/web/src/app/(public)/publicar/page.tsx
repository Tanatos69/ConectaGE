"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  CheckCircle,
  ImagePlus,
  ArrowLeft,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categories } from "@/lib/categories";
import { subcategories } from "@/lib/subcategories";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface PhotoPreview {
  id: string;
  url: string;
  file: File;
}

interface FormData {
  listingType: "offer" | "wanted";
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  title: string;
  description: string;
  price: string;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF" | "USD" | "EUR";
  condition: "new" | "used" | "refurbished";
  extraFields: Record<string, string>;
  country: string;
  region: string;
  city: string;
  photos: PhotoPreview[];
  whatsapp: string;
  showPhone: boolean;
  phone: string;
}

const defaultForm: FormData = {
  listingType: "offer",
  category: "",
  categoryName: "",
  subcategory: "",
  subcategoryName: "",
  title: "",
  description: "",
  price: "",
  priceType: "fixed",
  currency: "XAF",
  condition: "used",
  extraFields: {},
  country: "Guinea Ecuatorial",
  region: "",
  city: "",
  photos: [],
  whatsapp: "",
  showPhone: false,
  phone: "",
};

// ── Location data ────────────────────────────────────────────────────────────

const locationData: Record<string, Record<string, string[]>> = {
  "Guinea Ecuatorial": {
    "Bioko Norte": ["Malabo", "Rebola", "Baney"],
    "Bioko Sur": ["Luba", "Riaba", "Moka"],
    Litoral: ["Bata", "Mbini", "Cogo", "Acalayong"],
    "Centro Sur": ["Evinayong", "Niefang", "Sevilla de Niefang"],
    "Kié-Ntem": ["Ebebiyín", "Mongomo", "Akonibe", "Nsork"],
    "Wele-Nzas": ["Mongomo", "Aconibe", "Anisoc"],
    Annobon: ["San Antonio de Palé"],
  },
  España: { "Comunidad de Madrid": ["Madrid"], Cataluña: ["Barcelona", "Girona"] },
  Francia: { "Île-de-France": ["París", "Versalles"] },
  Camerún: { Littoral: ["Douala"], Centre: ["Yaundé"] },
};

// ── Category-specific fields ─────────────────────────────────────────────────

const categoryExtraFields: Record<string, { key: string; label: string; type: "text" | "select"; options?: string[] }[]> = {
  vehiculos: [
    { key: "brand", label: "Marca", type: "text" },
    { key: "model", label: "Modelo", type: "text" },
    { key: "year", label: "Año", type: "text" },
    { key: "mileage", label: "Kilometraje (km)", type: "text" },
    { key: "fuel", label: "Combustible", type: "select", options: ["Gasolina", "Diésel", "Eléctrico", "Híbrido", "GLP"] },
    { key: "transmission", label: "Transmisión", type: "select", options: ["Manual", "Automático"] },
  ],
  inmobiliaria: [
    { key: "type", label: "Tipo de inmueble", type: "select", options: ["Piso/Apartamento", "Casa/Chalet", "Local/Oficina", "Terreno", "Garaje"] },
    { key: "area", label: "Superficie (m²)", type: "text" },
    { key: "rooms", label: "Habitaciones", type: "text" },
    { key: "bathrooms", label: "Baños", type: "text" },
    { key: "floor", label: "Planta", type: "text" },
  ],
  electronica: [
    { key: "brand", label: "Marca", type: "text" },
    { key: "model", label: "Modelo", type: "text" },
    { key: "storage", label: "Almacenamiento / Especificaciones", type: "text" },
  ],
  empleo: [
    { key: "contract", label: "Tipo de contrato", type: "select", options: ["Indefinido", "Temporal", "Prácticas", "Autónomo", "Proyecto"] },
    { key: "experience", label: "Experiencia requerida", type: "select", options: ["Sin experiencia", "1-2 años", "3-5 años", "Más de 5 años"] },
    { key: "schedule", label: "Horario", type: "select", options: ["Completo", "Parcial", "Flexible", "Turnos"] },
  ],
};

// ── Step helpers ─────────────────────────────────────────────────────────────

const STEPS = [
  "Categoría",
  "Detalles",
  "Especificaciones",
  "Ubicación",
  "Fotos",
  "Contacto",
  "Revisión",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                done ? "bg-primary text-white" : active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckCircle className="size-3.5" /> : step}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-6 sm:w-10", step < current ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

// ── Main component ────────────────────────────────────────────────────────────

export default function PublicarPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (partial: Partial<FormData>) => setForm((prev) => ({ ...prev, ...partial }));

  // ── Photo handling ───────────────────────────────────────────────────────

  const addPhotos = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const remaining = 10 - form.photos.length;
      const toAdd = arr.slice(0, remaining).map((f) => ({
        id: Math.random().toString(36).slice(2),
        url: URL.createObjectURL(f),
        file: f,
      }));
      set({ photos: [...form.photos, ...toAdd] });
    },
    [form.photos],
  );

  function removePhoto(id: string) {
    const photo = form.photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    set({ photos: form.photos.filter((p) => p.id !== id) });
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goNext() { if (step < 7) setStep((s) => s + 1); }
  function goBack() { if (step > 1) setStep((s) => s - 1); }
  function canContinue() {
    if (step === 1) return form.category !== "" && form.subcategory !== "";
    if (step === 2) return form.title.trim().length >= 5 && form.description.trim().length >= 10;
    if (step === 4) return form.country !== "" && form.city !== "";
    if (step === 6) return form.whatsapp.trim().length >= 6;
    return true;
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-green-50 mx-auto">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">¡Anuncio enviado!</h1>
          <p className="text-sm text-muted-foreground">
            Tu anuncio <strong>"{form.title}"</strong> ha sido enviado y está pendiente de revisión.
            Normalmente aprobamos en menos de 2 horas. Te notificaremos por WhatsApp.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/mi-cuenta/anuncios"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Ver mis anuncios
            </Link>
            <button
              onClick={() => { setForm(defaultForm); setStep(1); setSubmitted(false); }}
              className="rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Publicar otro anuncio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const extraFields = categoryExtraFields[form.category] ?? [];
  const regions = form.country && locationData[form.country] ? Object.keys(locationData[form.country]) : [];
  const cities = form.region && locationData[form.country]?.[form.region] ? locationData[form.country][form.region] : [];

  return (
    <div className="bg-muted/30">
      {/* Progress bar — sits just below SiteHeader */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* Page title + step counter */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Publicar anuncio</h1>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Paso {step} / {STEPS.length} · {STEPS[step - 1]}
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <StepIndicator current={step} />
        </div>

        {/* ── Step 1: Category ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionCard title="¿En qué categoría quieres publicar?">
              {form.category === "" ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() =>
                        set({ category: cat.slug, categoryName: cat.name, subcategory: "", subcategoryName: "" })
                      }
                      className="flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-muted/50 p-4 text-center text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      <FontAwesomeIcon icon={cat.icon} className="size-6" aria-hidden="true" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set({ category: "", categoryName: "", subcategory: "", subcategoryName: "" })}
                      className="flex size-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-secondary"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      {(() => { const ic = categories.find((c) => c.slug === form.category); return ic ? <FontAwesomeIcon icon={ic.icon} className="size-4" aria-hidden="true" /> : null; })()}
                      {form.categoryName}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Elige la subcategoría más adecuada:</p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {(subcategories[form.category] ?? []).map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() =>
                          set({ subcategory: sub.slug, subcategoryName: sub.name })
                        }
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5",
                          form.subcategory === sub.slug
                            ? "border-primary bg-primary/5 font-semibold text-primary"
                            : "border-input text-foreground",
                        )}
                      >
                        <span>{sub.name}</span>
                        <span className="text-xs text-muted-foreground">{sub.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Step 2: Basic info ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <SectionCard title="¿Qué quieres publicar?">
              <div className="flex gap-2">
                {(["offer", "wanted"] as const).map((lt) => {
                  const labels = {
                    offer: "Ofrezco algo en venta",
                    wanted: "Busco algo (demanda)",
                  };
                  return (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => set({ listingType: lt })}
                      className={cn(
                        "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                        form.listingType === lt
                          ? "border-primary bg-primary text-white"
                          : "border-input bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {labels[lt]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Los anuncios &ldquo;Busco&rdquo; aparecen con una etiqueta especial para que los
                vendedores te encuentren.
              </p>
            </SectionCard>

            <SectionCard title="Información básica">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Título del anuncio <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="Ej: iPhone 14 Pro 256 GB — Nuevo sellado"
                    maxLength={100}
                    className={inputClass}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{form.title.length}/100</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Descripción <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="Describe tu artículo con detalle: estado, incluye qué, razón de venta, etc."
                    rows={5}
                    maxLength={2000}
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{form.description.length}/2000</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Precio">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {(["fixed", "negotiable", "free", "on_request"] as const).map((pt) => {
                    const labels = {
                      fixed: "Precio fijo",
                      negotiable: "Negociable",
                      free: "Gratis",
                      on_request: "A consultar",
                    };
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => set({ priceType: pt })}
                        className={cn(
                          "flex-1 rounded-xl border py-2 text-xs font-medium transition-colors",
                          form.priceType === pt
                            ? "border-primary bg-primary text-white"
                            : "border-input bg-background text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        {labels[pt]}
                      </button>
                    );
                  })}
                </div>

                {(form.priceType === "fixed" || form.priceType === "negotiable") && (
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => set({ price: e.target.value })}
                      placeholder="0"
                      min={0}
                      className={cn(inputClass, "flex-1")}
                    />
                    <select
                      value={form.currency}
                      onChange={(e) => set({ currency: e.target.value as FormData["currency"] })}
                      className="h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="XAF">FCFA</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Estado del artículo">
              <div className="flex gap-2">
                {(["new", "used", "refurbished"] as const).map((cond) => {
                  const labels = { new: "Nuevo", used: "Segunda mano", refurbished: "Reacondicionado" };
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => set({ condition: cond })}
                      className={cn(
                        "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                        form.condition === cond
                          ? "border-primary bg-primary text-white"
                          : "border-input bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {labels[cond]}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── Step 3: Extra fields ──────────────────────────────────────── */}
        {step === 3 && (
          <SectionCard title={extraFields.length > 0 ? `Especificaciones de ${form.categoryName}` : "Especificaciones adicionales"}>
            {extraFields.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay campos específicos para esta categoría.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Puedes continuar al siguiente paso.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {extraFields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        value={form.extraFields[f.key] ?? ""}
                        onChange={(e) => set({ extraFields: { ...form.extraFields, [f.key]: e.target.value } })}
                        className={inputClass}
                      >
                        <option value="">Seleccionar...</option>
                        {f.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.extraFields[f.key] ?? ""}
                        onChange={(e) => set({ extraFields: { ...form.extraFields, [f.key]: e.target.value } })}
                        className={inputClass}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Step 4: Location ─────────────────────────────────────────── */}
        {step === 4 && (
          <SectionCard title="Ubicación del anuncio">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  País <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.country}
                  onChange={(e) => set({ country: e.target.value, region: "", city: "" })}
                  className={inputClass}
                >
                  {Object.keys(locationData).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Provincia / Región</label>
                <select
                  value={form.region}
                  onChange={(e) => set({ region: e.target.value, city: "" })}
                  disabled={regions.length === 0}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  {regions.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Ciudad <span className="text-destructive">*</span>
                </label>
                {cities.length > 0 ? (
                  <select
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Seleccionar...</option>
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
                    placeholder="Nombre de la ciudad"
                    className={inputClass}
                  />
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 5: Photos ────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-4">
            <SectionCard title={`Fotos (${form.photos.length}/10)`}>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addPhotos(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
                  dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
                  form.photos.length >= 10 && "pointer-events-none opacity-50",
                )}
              >
                <ImagePlus className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Arrastra tus fotos aquí o haz clic para seleccionar
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG o WebP · Máx. 5 MB por foto · Hasta 10 fotos
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <Upload className="mr-2 inline-block size-3.5" />
                  Elegir archivos
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) addPhotos(e.target.files); }}
              />

              {/* Previews */}
              {form.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {form.photos.map((p, i) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
            <p className="text-center text-xs text-muted-foreground">
              La primera foto será la imagen principal del anuncio.
            </p>
          </div>
        )}

        {/* ── Step 6: Contact ───────────────────────────────────────────── */}
        {step === 6 && (
          <SectionCard title="Datos de contacto">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Número de WhatsApp <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                  placeholder="+240 222 000 000"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Los compradores contactarán directamente por WhatsApp.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.showPhone}
                  onChange={(e) => set({ showPhone: e.target.checked })}
                  className="size-4 accent-primary rounded"
                />
                <span className="text-sm text-foreground">Mostrar también teléfono en el anuncio</span>
              </label>

              {form.showPhone && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    placeholder="+240 222 000 000"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                Tu número de teléfono solo es visible en tu anuncio publicado, no en el listado de búsqueda.
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 7: Review & Submit ───────────────────────────────────── */}
        {step === 7 && (
          <div className="space-y-4">
            <SectionCard title="Resumen de tu anuncio">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Categoría</dt>
                  <dd className="font-medium text-foreground text-right">{form.categoryName} › {form.subcategoryName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Título</dt>
                  <dd className="font-medium text-foreground text-right max-w-xs truncate">{form.title || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Precio</dt>
                  <dd className="font-medium text-foreground">
                    {form.priceType === "free"
                      ? "Gratis"
                      : form.priceType === "on_request"
                      ? "A consultar"
                      : form.price
                      ? `${parseInt(form.price).toLocaleString()} ${form.currency} ${form.priceType === "negotiable" ? "(Negociable)" : ""}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd className="font-medium text-foreground">{{ new: "Nuevo", used: "Segunda mano", refurbished: "Reacondicionado" }[form.condition]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Ubicación</dt>
                  <dd className="font-medium text-foreground">{[form.city, form.region, form.country].filter(Boolean).join(", ") || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Fotos</dt>
                  <dd className="font-medium text-foreground">{form.photos.length} foto{form.photos.length !== 1 ? "s" : ""}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd className="font-medium text-foreground">{form.whatsapp || "—"}</dd>
                </div>
              </dl>

              {form.photos.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {form.photos.slice(0, 5).map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ))}
                  {form.photos.length > 5 && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground">
                      +{form.photos.length - 5}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* CAPTCHA placeholder */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-foreground">Verificación</p>
              <div className="flex h-16 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
                [reCAPTCHA — integración en producción]
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Al publicar aceptas nuestros{" "}
              <Link href="/terminos" className="font-semibold underline">Términos de uso</Link>{" "}
              y confirmas que el anuncio cumple con las{" "}
              <Link href="/ayuda" className="font-semibold underline">normas de la comunidad</Link>.
            </div>

            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              Publicar anuncio
            </button>
          </div>
        )}

        {/* ── Navigation buttons ────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 border-t pt-5">
          <button
            onClick={goBack}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors",
              step === 1 && "invisible",
            )}
          >
            <ChevronLeft className="size-4" />
            Atrás
          </button>

          <span className="text-xs text-muted-foreground">{STEPS[step - 1]}</span>

          {step < 7 ? (
            <button
              onClick={goNext}
              disabled={!canContinue()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

        {step < 7 && (
          <p className="pb-2 text-center text-xs text-muted-foreground">
            Tu progreso se guarda automáticamente
          </p>
        )}
      </div>
    </div>
  );
}
