import { getListingsBySlugs, type Listing } from "@/lib/listings";

/**
 * Vendor stores ("tiendas") — the marketplace's branded shops. In the commercial
 * plan these are the "tiendas virtuales independientes". Demo data for the
 * presentation build; in production a `stores` table owned by professional
 * sellers. Logos render as initials (UserAvatar); banners reuse /demo images.
 */
export interface Store {
  slug: string;
  name: string;
  tagline: string;
  banner: string;
  city: string;
  categorySlug: string;
  categoryName: string;
  verified: boolean;
  professional: boolean;
  memberSince: string;
  followers: number;
  rating: number;
  reviewsCount: number;
  whatsapp: string;
  description: string;
  listingSlugs: string[];
}

const img = (name: string) => `/demo/${name}.jpg`;

export const demoStores: Store[] = [
  {
    slug: "tech-malabo",
    name: "Tech Malabo",
    tagline: "Electrónica y gadgets importados con garantía",
    banner: img("macbook-pro"),
    city: "Malabo",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    verified: true,
    professional: true,
    memberSince: "Junio 2023",
    followers: 1280,
    rating: 4.7,
    reviewsCount: 41,
    whatsapp: "+240222456789",
    description:
      "Tienda especializada en electrónica de importación: smartphones, ordenadores, consolas y accesorios. Todos nuestros productos incluyen garantía y factura. Entrega en Malabo y envío a Bata.",
    listingSlugs: [
      "iphone-15-pro-max-256-c2a8f0",
      "macbook-pro-m3-14-d4e1a9",
      "samsung-tv-55-4k-a4b5c6",
      "ps5-slim-2-mandos-c9d0e1",
      "canon-eos-r50-f5a6b7",
    ],
  },
  {
    slug: "autos-mba",
    name: "Autos Mba",
    tagline: "Vehículos revisados y con documentación al día",
    banner: img("toyota-rav4"),
    city: "Malabo",
    categorySlug: "vehiculos",
    categoryName: "Vehículos",
    verified: true,
    professional: true,
    memberSince: "Enero 2024",
    followers: 642,
    rating: 4.8,
    reviewsCount: 23,
    whatsapp: "+240222123456",
    description:
      "Compraventa de coches y motos seleccionados. Cada vehículo pasa una revisión completa antes de publicarse y se entrega con la documentación en regla. Financiación disponible bajo consulta.",
    listingSlugs: ["toyota-rav4-2019-a3f7c2", "yamaha-scooter-125-e7c3b2"],
  },
  {
    slug: "inmuebles-esono",
    name: "Inmuebles Esono",
    tagline: "Pisos, casas y locales en Bata y alrededores",
    banner: img("apartamento-malabo"),
    city: "Bata",
    categorySlug: "inmobiliaria",
    categoryName: "Inmobiliaria",
    verified: true,
    professional: true,
    memberSince: "Marzo 2024",
    followers: 918,
    rating: 4.9,
    reviewsCount: 15,
    whatsapp: "+240222987654",
    description:
      "Agencia inmobiliaria con cartera de viviendas en venta y alquiler en Bata, Malabo y otras zonas. Trato directo, sin intermediarios ocultos y acompañamiento en todo el proceso.",
    listingSlugs: [
      "apartamento-moderno-malabo-2-b9d1e4",
      "casa-4-hab-bata-centro-b7c8d9",
    ],
  },
  {
    slug: "martinez-hogar",
    name: "Martínez Hogar",
    tagline: "Muebles y electrodomésticos para tu casa",
    banner: img("sofa-gris"),
    city: "Malabo",
    categorySlug: "muebles",
    categoryName: "Muebles y Hogar",
    verified: true,
    professional: true,
    memberSince: "Septiembre 2023",
    followers: 1455,
    rating: 4.6,
    reviewsCount: 58,
    whatsapp: "+240222111222",
    description:
      "Showroom de mobiliario y electrodomésticos para el hogar y la oficina. Entrega a domicilio en Malabo y Bata, montaje incluido y facilidades de pago para empresas.",
    listingSlugs: [
      "sofa-esquina-gris-f1a2b3",
      "mesa-comedor-madera-b9c0d1",
      "nevera-samsung-d3e4f5",
    ],
  },
  {
    slug: "boutique-malabo",
    name: "Boutique Malabo",
    tagline: "Moda y diseño africano hecho a medida",
    banner: img("ropa-tradicional"),
    city: "Malabo",
    categorySlug: "moda",
    categoryName: "Moda",
    verified: false,
    professional: false,
    memberSince: "Febrero 2025",
    followers: 327,
    rating: 4.5,
    reviewsCount: 9,
    whatsapp: "+240222333444",
    description:
      "Ropa, calzado y complementos. Diseños tradicionales africanos confeccionados a medida y marcas internacionales. Pequeño taller particular con mucho cariño por el detalle.",
    listingSlugs: [
      "nike-air-max-talla-42-d1e2f3",
      "ropa-tradicional-africana-c1d2e3",
    ],
  },
  {
    slug: "servicios-mongomo",
    name: "Servicios Mongomo",
    tagline: "Reparaciones, construcción y servicios del hogar",
    banner: img("sofa-gris"),
    city: "Mongomo",
    categorySlug: "servicios",
    categoryName: "Servicios",
    verified: true,
    professional: true,
    memberSince: "Abril 2024",
    followers: 189,
    rating: 4.4,
    reviewsCount: 12,
    whatsapp: "+240222777888",
    description:
      "Empresa de servicios y reformas en la región de Wele-Nzas. Albañilería, fontanería, electricidad y limpieza. Presupuesto sin compromiso.",
    listingSlugs: [],
  },
  {
    slug: "centro-ebebiyin",
    name: "Centro Comercial Ebebiyín",
    tagline: "Todo para el hogar y el negocio en frontera",
    banner: img("macbook-pro"),
    city: "Ebebiyín",
    categorySlug: "varios",
    categoryName: "Otros / Varios",
    verified: true,
    professional: true,
    memberSince: "Noviembre 2023",
    followers: 412,
    rating: 4.3,
    reviewsCount: 20,
    whatsapp: "+240222555666",
    description:
      "Tienda multi-categoría en la zona fronteriza con Camerún y Gabón. Electrónica, hogar, moda y alimentación. Envíos al interior del país.",
    listingSlugs: [],
  },
];

export function getStoreBySlug(slug: string): Store | undefined {
  return demoStores.find((s) => s.slug === slug);
}

export function getStoreListings(store: Store): Listing[] {
  return getListingsBySlugs(store.listingSlugs);
}
