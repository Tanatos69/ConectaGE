import { Star, ArrowUpToLine, LayoutGrid, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Visibility / promotion catalog, mirroring Expat-Dakar's "Options de
 * visibilité". Sellers spend credits to boost a listing. In the demo the
 * credit balance lives in the app-state store (localStorage); in production
 * this is a real credit ledger + scheduled promotion records.
 */
export interface PromotionOption {
  id: string;
  name: string;
  description: string;
  credits: number;
  durationLabel: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export const promotionOptions: PromotionOption[] = [
  {
    id: "home-featured",
    name: "Destacado en portada",
    description:
      "Tu anuncio aparece en la sección de Destacados de la página de inicio. Hasta 7× más visible.",
    credits: 10,
    durationLabel: "7 días",
    icon: Star,
    highlight: true,
  },
  {
    id: "bump",
    name: "Subir anuncio",
    description:
      "Devuelve tu anuncio a lo más alto de su categoría y de los resultados de búsqueda al instante.",
    credits: 2,
    durationLabel: "Inmediato",
    icon: ArrowUpToLine,
  },
  {
    id: "category-gallery",
    name: "Galería de categoría",
    description:
      "Tu anuncio se muestra en la galería destacada de su categoría (ej. Coches, Móviles, Muebles).",
    credits: 6,
    durationLabel: "7 días",
    icon: LayoutGrid,
  },
  {
    id: "category-top",
    name: "Top de categoría",
    description:
      "Coloca tu anuncio entre los primeros de su categoría, por encima de los anuncios normales.",
    credits: 8,
    durationLabel: "7 días",
    icon: Trophy,
  },
];

export function getPromotionOption(id: string): PromotionOption | undefined {
  return promotionOptions.find((p) => p.id === id);
}

export interface CreditPack {
  id: string;
  credits: number;
  bonus: number;
  priceXAF: number;
  popular?: boolean;
}

export const creditPacks: CreditPack[] = [
  { id: "pack-10", credits: 10, bonus: 0, priceXAF: 5000 },
  { id: "pack-25", credits: 25, bonus: 3, priceXAF: 10000, popular: true },
  { id: "pack-60", credits: 60, bonus: 12, priceXAF: 20000 },
];

/** Professional seller subscriptions (informational in the demo). */
export interface SellerPlan {
  id: string;
  name: string;
  priceLabel: string;
  features: string[];
  popular?: boolean;
}

export const sellerPlans: SellerPlan[] = [
  {
    id: "particular",
    name: "Particular",
    priceLabel: "Gratis",
    features: [
      "Publica anuncios gratis",
      "Contacto directo por WhatsApp",
      "Hasta 5 anuncios activos",
    ],
  },
  {
    id: "pro",
    name: "Profesional",
    priceLabel: "25.000 FCFA/mes",
    popular: true,
    features: [
      "Tienda propia con tu marca",
      "Anuncios ilimitados",
      "Insignia de vendedor Profesional",
      "10 créditos de promoción al mes",
      "Estadísticas de tu tienda",
    ],
  },
  {
    id: "empresa",
    name: "Empresa",
    priceLabel: "A medida",
    features: [
      "Todo lo del plan Profesional",
      "Cuentas para tu equipo",
      "Integración de catálogo",
      "Gestor de cuenta dedicado",
      "Facturación corporativa",
    ],
  },
];
