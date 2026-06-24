/**
 * Demo listings for the presentation phase.
 * Replaced by live PostgreSQL data (via Prisma) in production.
 * Images use Unsplash; real listings use Cloudinary URLs.
 */
export interface Listing {
  slug: string;
  title: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF" | "USD" | "EUR";
  city: string;
  region: string;
  postedLabel: string;
  categorySlug: string;
  categoryName: string;
  condition: "new" | "used" | "refurbished" | null;
  image: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  /** "offer" (default) = something for sale; "wanted" = a "Busco" request. */
  listingType?: "offer" | "wanted";
}

/**
 * Demo photos are stored locally in /public/demo so they render reliably
 * offline and aren't affected by the dev sandbox's network proxy. In
 * production these become Cloudinary URLs.
 */
const img = (name: string) => `/demo/${name}.jpg`;

export const featuredListings: Listing[] = [
  {
    slug: "toyota-rav4-2019-a3f7c2",
    title: "Toyota RAV4 2019 · Pocos kilómetros",
    price: 14500000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 2 horas",
    categorySlug: "vehiculos",
    categoryName: "Vehículos",
    condition: "used",
    image: img("toyota-rav4"),
    featured: true,
    rating: 4.8,
    reviews: 12,
  },
  {
    slug: "apartamento-moderno-malabo-2-b9d1e4",
    title: "Apartamento moderno 3 hab. en Malabo II",
    price: 85000000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 5 horas",
    categorySlug: "inmobiliaria",
    categoryName: "Inmobiliaria",
    condition: null,
    image: img("apartamento-malabo"),
    featured: true,
    rating: 4.9,
    reviews: 7,
  },
  {
    slug: "iphone-15-pro-max-256-c2a8f0",
    title: "iPhone 15 Pro Max 256GB · Como nuevo",
    price: 950000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 1 día",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: "used",
    image: img("iphone-15"),
    featured: true,
    rating: 5,
    reviews: 21,
  },
  {
    slug: "macbook-pro-m3-14-d4e1a9",
    title: "MacBook Pro M3 14\" · Sellado",
    price: 1450000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 1 día",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: "new",
    image: img("macbook-pro"),
    featured: true,
    rating: 4.7,
    reviews: 9,
  },
  {
    slug: "yamaha-scooter-125-e7c3b2",
    title: "Yamaha NMAX 125 · 2022",
    price: 2200000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 2 días",
    categorySlug: "vehiculos",
    categoryName: "Vehículos",
    condition: "used",
    image: img("yamaha-scooter"),
    featured: true,
    rating: 4.6,
    reviews: 5,
  },
];

export const recentListings: Listing[] = [
  {
    slug: "sofa-esquina-gris-f1a2b3",
    title: "Sofá esquinero gris 5 plazas",
    price: 420000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 12 min",
    categorySlug: "muebles",
    categoryName: "Muebles y Hogar",
    condition: "used",
    image: img("sofa-gris"),
  },
  {
    slug: "samsung-tv-55-4k-a4b5c6",
    title: 'Samsung Smart TV 55" 4K UHD',
    price: 380000,
    priceType: "fixed",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 38 min",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: "new",
    image: img("samsung-tv"),
  },
  {
    slug: "casa-4-hab-bata-centro-b7c8d9",
    title: "Casa 4 habitaciones con patio · Bata centro",
    price: 120000000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 1 hora",
    categorySlug: "inmobiliaria",
    categoryName: "Inmobiliaria",
    condition: null,
    image: img("casa-bata"),
  },
  {
    slug: "ps5-slim-2-mandos-c9d0e1",
    title: "PlayStation 5 Slim + 2 mandos",
    price: 480000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 1 hora",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: "used",
    image: img("ps5"),
  },
  {
    slug: "nike-air-max-talla-42-d1e2f3",
    title: "Nike Air Max · Talla 42 · Nuevas",
    price: 65000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 2 horas",
    categorySlug: "moda",
    categoryName: "Moda",
    condition: "new",
    image: img("nike-airmax"),
  },
  {
    slug: "bicicleta-montana-e3f4a5",
    title: "Bicicleta de montaña 27.5\" · 21 vel.",
    price: 145000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 3 horas",
    categorySlug: "deporte",
    categoryName: "Deporte y Ocio",
    condition: "used",
    image: img("bicicleta"),
  },
  {
    slug: "canon-eos-r50-f5a6b7",
    title: "Cámara Canon EOS R50 + objetivo",
    price: 720000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 4 horas",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: "used",
    image: img("canon-camera"),
  },
  {
    slug: "se-busca-conductor-a7b8c9",
    title: "Se busca conductor con licencia B · Malabo",
    price: null,
    priceType: "on_request",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 5 horas",
    categorySlug: "empleo",
    categoryName: "Empleo",
    condition: null,
    image: img("conductor"),
    listingType: "wanted",
  },
  {
    slug: "mesa-comedor-madera-b9c0d1",
    title: "Mesa de comedor de madera maciza · 6 sillas",
    price: 290000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 6 horas",
    categorySlug: "muebles",
    categoryName: "Muebles y Hogar",
    condition: "used",
    image: img("mesa-comedor"),
  },
  {
    slug: "ropa-tradicional-africana-c1d2e3",
    title: "Vestido tradicional africano · Hecho a medida",
    price: 45000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 7 horas",
    categorySlug: "moda",
    categoryName: "Moda",
    condition: "new",
    image: img("ropa-tradicional"),
  },
  {
    slug: "nevera-samsung-d3e4f5",
    title: "Nevera Samsung No Frost · 2 puertas",
    price: 350000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 8 horas",
    categorySlug: "muebles",
    categoryName: "Muebles y Hogar",
    condition: "used",
    image: img("nevera"),
  },
  {
    slug: "clases-particulares-ingles-e5f6a7",
    title: "Clases particulares de inglés y francés",
    price: 15000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 9 horas",
    categorySlug: "educacion",
    categoryName: "Educación",
    condition: null,
    image: img("clases"),
  },
  {
    slug: "busco-apartamento-alquiler-malabo-w1",
    title: "Busco apartamento 2 hab. en alquiler · Malabo",
    price: null,
    priceType: "on_request",
    currency: "XAF",
    city: "Malabo",
    region: "Bioko Norte",
    postedLabel: "Hace 3 horas",
    categorySlug: "inmobiliaria",
    categoryName: "Inmobiliaria",
    condition: null,
    image: img("apartamento-malabo"),
    listingType: "wanted",
  },
  {
    slug: "busco-iphone-buen-estado-w2",
    title: "Busco iPhone 13 o superior en buen estado",
    price: null,
    priceType: "on_request",
    currency: "XAF",
    city: "Bata",
    region: "Litoral",
    postedLabel: "Hace 6 horas",
    categorySlug: "electronica",
    categoryName: "Electrónica",
    condition: null,
    image: img("iphone-15"),
    listingType: "wanted",
  },
];

/** Every demo listing (featured + recent), the single source for lookups. */
export const allListings: Listing[] = [...featuredListings, ...recentListings];

export function getListingBySlug(slug: string): Listing | undefined {
  return allListings.find((l) => l.slug === slug);
}

export function getListingsBySlugs(slugs: string[]): Listing[] {
  return slugs
    .map((slug) => getListingBySlug(slug))
    .filter((l): l is Listing => Boolean(l));
}
