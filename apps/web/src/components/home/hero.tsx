import Link from "next/link";
import { Search, MapPin, ShieldCheck, Zap, Tag } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { buttonVariants } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

const cities = [
  "Toda Guinea Ecuatorial",
  "Malabo",
  "Bata",
  "Ebebiyín",
  "Mongomo",
  "Luba",
  "Evinayong",
  "Añisoc",
  "Mbini",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent via-background to-background" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(221 83% 53% / 0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-whatsapp opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-whatsapp" />
            </span>
            Contacto directo por WhatsApp · Sin intermediarios
          </span>

          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Compra y vende en{" "}
            <span className="relative inline-block whitespace-nowrap text-primary">
              Guinea Ecuatorial
              <svg
                viewBox="0 0 320 10"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full overflow-visible"
              >
                <path
                  d="M2 7 C40 2, 80 5, 120 4 C160 3, 200 7, 240 5 C270 3, 300 6, 318 7"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[draw-underline_0.9s_ease-out_0.3s_both]"
                  style={{ strokeDasharray: 340, strokeDashoffset: 340 }}
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Miles de anuncios de vehículos, inmuebles, electrónica y empleo en
            Malabo, Bata y todo el país. Publicar es{" "}
            <span className="font-semibold text-foreground">100% gratis</span>.
          </p>

          {/* Search card */}
          <form
            action="/buscar"
            role="search"
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:rounded-full sm:pl-4"
          >
            <div className="flex flex-1 items-center">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Ej: Toyota, apartamento, iPhone…"
                aria-label="Buscar anuncios"
                className="h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center border-t pt-1 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <select
                name="ciudad"
                aria-label="Ciudad"
                className="h-10 w-full cursor-pointer bg-transparent px-2 text-sm outline-none sm:w-44"
                defaultValue="Toda Guinea Ecuatorial"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <Search className="size-4" />
              Buscar
            </button>
          </form>

          {/* Quick category chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                <FontAwesomeIcon icon={cat.icon} className="size-4 shrink-0" aria-hidden="true" />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/publicar"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Publicar anuncio gratis
            </Link>
            <Link
              href="/categorias"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Explorar categorías
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Anuncios verificados
            </span>
            <span className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Publica en 2 minutos
            </span>
            <span className="flex items-center gap-2">
              <Tag className="size-4 text-primary" />
              Sin comisiones
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
