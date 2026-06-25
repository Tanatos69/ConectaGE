import { getListingsBySlugs, type Listing } from "@/lib/listings";

export type VerificationStatus = "unverified" | "pending" | "verified";

export interface Store {
  slug: string;
  name: string;
  tagline: string;
  banner: string;
  logo?: string;
  city: string;
  address?: string;
  neighborhood?: string;
  businessHours?: string;
  categorySlug: string;
  categoryName: string;
  verificationStatus: VerificationStatus;
  professional: boolean;
  memberSince: string;
  followers: number;
  rating: number;
  reviewsCount: number;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  nif?: string;
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
    address: "Calle de la Constitución 12",
    neighborhood: "Centro",
    businessHours: "Lun–Sáb 9:00–19:00",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    verificationStatus: "verified",
    professional: true,
    memberSince: "Junio 2023",
    followers: 1280,
    rating: 4.7,
    reviewsCount: 41,
    whatsapp: "+240222456789",
    instagram: "techmalabo_ge",
    facebook: "TechMalaboGE",
    nif: "GE-2023-001",
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
    address: "Av. de la Independencia 47",
    neighborhood: "Ela Nguema",
    businessHours: "Lun–Vie 8:00–18:00, Sáb 8:00–13:00",
    categorySlug: "vehiculos",
    categoryName: "Vehículos",
    verificationStatus: "verified",
    professional: true,
    memberSince: "Enero 2024",
    followers: 642,
    rating: 4.8,
    reviewsCount: 23,
    whatsapp: "+240222123456",
    instagram: "autosmba_ge",
    nif: "GE-2024-018",
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
    address: "Paseo del Río Bata 3, 1º",
    neighborhood: "Centro",
    businessHours: "Lun–Vie 9:00–17:00",
    categorySlug: "inmobiliaria",
    categoryName: "Inmobiliaria",
    verificationStatus: "verified",
    professional: true,
    memberSince: "Marzo 2024",
    followers: 918,
    rating: 4.9,
    reviewsCount: 15,
    whatsapp: "+240222987654",
    facebook: "InmueblesEsonoBata",
    nif: "GE-2024-042",
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
    address: "Calle Bata 8, Local 2",
    neighborhood: "Malabo II",
    businessHours: "Lun–Sáb 9:00–20:00",
    categorySlug: "muebles",
    categoryName: "Muebles y Hogar",
    verificationStatus: "verified",
    professional: true,
    memberSince: "Septiembre 2023",
    followers: 1455,
    rating: 4.6,
    reviewsCount: 58,
    whatsapp: "+240222111222",
    instagram: "martinezhogar_ge",
    facebook: "MartinezHogarGE",
    nif: "GE-2023-087",
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
    neighborhood: "Hacienda",
    businessHours: "Mar–Dom 10:00–19:00",
    categorySlug: "moda",
    categoryName: "Moda",
    verificationStatus: "pending",
    professional: false,
    memberSince: "Febrero 2025",
    followers: 327,
    rating: 4.5,
    reviewsCount: 9,
    whatsapp: "+240222333444",
    instagram: "boutiquemalabo",
    nif: "GE-2025-034",
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
    businessHours: "Lun–Vie 8:00–17:00",
    categorySlug: "servicios",
    categoryName: "Servicios",
    verificationStatus: "unverified",
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
    address: "Av. Principal s/n",
    businessHours: "Lun–Sáb 8:00–20:00, Dom 9:00–14:00",
    categorySlug: "varios",
    categoryName: "Otros / Varios",
    verificationStatus: "verified",
    professional: true,
    memberSince: "Noviembre 2023",
    followers: 412,
    rating: 4.3,
    reviewsCount: 20,
    whatsapp: "+240222555666",
    facebook: "CentroEbebiyín",
    nif: "GE-2023-112",
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

export function getStoresByVerificationStatus(status: VerificationStatus): Store[] {
  return demoStores.filter((s) => s.verificationStatus === status);
}
