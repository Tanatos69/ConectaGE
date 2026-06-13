/**
 * Demo data for the /admin section.
 * In production all of this comes from PostgreSQL via Prisma.
 */

// ── Platform-wide KPIs ────────────────────────────────────────────────────────

export const adminStats = {
  totalUsers: 1284,
  newUsersThisWeek: 47,
  activeListings: 5867,
  pendingModeration: 14,
  visitsToday: 2341,
  whatsappClicksToday: 187,
  totalReports: 5,
  pendingReviews: 3,
  pendingFeatured: 2,
};

// ── Moderation queue ──────────────────────────────────────────────────────────

export interface PendingListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  subcategory: string;
  price: string;
  city: string;
  submittedAt: string;
  seller: {
    username: string;
    name: string;
    rating: number;
    approvedListings: number;
    memberSince: string;
    spamFlags: number;
  };
  autoFlags: string[];
}

export const pendingListings: PendingListing[] = [
  {
    id: "ml-001",
    slug: "iphone-15-pro-nuevo",
    title: "iPhone 15 Pro 256 GB — Nuevo sellado",
    description:
      "iPhone 15 Pro completamente nuevo, sellado de fábrica. Comprado en Dubai. Incluye factura y garantía de 1 año. No negociable.",
    image: "/demo/iphone.jpg",
    category: "Electrónica",
    subcategory: "Smartphones",
    price: "1.200.000 FCFA",
    city: "Malabo",
    submittedAt: "Hace 15 min",
    seller: {
      username: "carlos_el_tech",
      name: "Carlos Mba",
      rating: 4.8,
      approvedListings: 23,
      memberSince: "Ene 2023",
      spamFlags: 0,
    },
    autoFlags: [],
  },
  {
    id: "ml-002",
    slug: "piso-alquiler-malabo-centro",
    title: "Piso 3 habitaciones en alquiler — Centro Malabo",
    description:
      "Piso luminoso de 3 habitaciones y 2 baños en el centro de Malabo. Agua y luz incluidos. Disponible inmediatamente.",
    image: "/demo/apartment.jpg",
    category: "Inmobiliaria",
    subcategory: "Pisos y Apartamentos",
    price: "450.000 FCFA/mes",
    city: "Malabo",
    submittedAt: "Hace 47 min",
    seller: {
      username: "inmobiliaria_ge",
      name: "Ana Nsue",
      rating: 4.5,
      approvedListings: 41,
      memberSince: "Mar 2022",
      spamFlags: 0,
    },
    autoFlags: ["Título similar a anuncio existente"],
  },
  {
    id: "ml-003",
    slug: "empleo-conductor-privado-bata",
    title: "Se busca conductor privado con experiencia — Bata",
    description:
      "Empresa busca conductor con licencia B2 y al menos 3 años de experiencia. Vehículo propio a cargo de la empresa. Sueldo: 250.000 FCFA.",
    image: "/demo/car2.jpg",
    category: "Empleo",
    subcategory: "Transporte y Logística",
    price: "250.000 FCFA",
    city: "Bata",
    submittedAt: "Hace 1h 22min",
    seller: {
      username: "empresa_logistica_ge",
      name: "Pedro Ondo",
      rating: 4.2,
      approvedListings: 7,
      memberSince: "Sep 2024",
      spamFlags: 1,
    },
    autoFlags: ["Vendedor con flag de spam (×1)"],
  },
  {
    id: "ml-004",
    slug: "terreno-venta-ebebiyin",
    title: "Terreno de 800 m² a la venta — Ebebiyín",
    description:
      "Parcela de 800 m² con escritura. Ubicada en zona residencial tranquila a 5 min del centro. Ideal para construir vivienda.",
    image: "/demo/land.jpg",
    category: "Inmobiliaria",
    subcategory: "Terrenos",
    price: "3.500.000 FCFA",
    city: "Ebebiyín",
    submittedAt: "Hace 2h 10min",
    seller: {
      username: "terrenos_centro_sur",
      name: "María Engonga",
      rating: 5.0,
      approvedListings: 12,
      memberSince: "Jun 2023",
      spamFlags: 0,
    },
    autoFlags: [],
  },
  {
    id: "ml-005",
    slug: "generador-honda-5kw",
    title: "Generador Honda 5 kW — Muy buen estado",
    description:
      "Generador Honda EP5000CX, uso doméstico, arranca a la primera. Mantenimiento al día. Se entrega con tanque lleno.",
    image: "/demo/generator.jpg",
    category: "Electrónica",
    subcategory: "Generadores",
    price: "680.000 FCFA",
    city: "Malabo",
    submittedAt: "Hace 3h 05min",
    seller: {
      username: "repuestos_malabo",
      name: "Juan Nvo",
      rating: 3.9,
      approvedListings: 3,
      memberSince: "Feb 2025",
      spamFlags: 0,
    },
    autoFlags: ["Cuenta nueva (< 6 meses)", "Precio inusualmente alto para la categoría"],
  },
];

// ── All listings table ────────────────────────────────────────────────────────

export type ListingStatus = "published" | "pending" | "rejected" | "expired";

export interface AdminListing {
  id: string;
  slug: string;
  title: string;
  image: string;
  username: string;
  category: string;
  status: ListingStatus;
  price: string;
  city: string;
  date: string;
  views: number;
}

export const adminListings: AdminListing[] = [
  { id: "1", slug: "toyota-rav4-2019-a3f7c2", title: "Toyota RAV4 2019", image: "/demo/car1.jpg", username: "autosgc_malabo", category: "Vehículos", status: "published", price: "14.500.000 FCFA", city: "Malabo", date: "12 jun 2025", views: 847 },
  { id: "2", slug: "iphone-15-pro-nuevo", title: "iPhone 15 Pro 256 GB", image: "/demo/iphone.jpg", username: "carlos_el_tech", category: "Electrónica", status: "pending", price: "1.200.000 FCFA", city: "Malabo", date: "13 jun 2025", views: 0 },
  { id: "3", slug: "piso-alquiler-malabo-centro", title: "Piso 3 hab en alquiler", image: "/demo/apartment.jpg", username: "inmobiliaria_ge", category: "Inmobiliaria", status: "pending", price: "450.000 FCFA/mes", city: "Malabo", date: "13 jun 2025", views: 0 },
  { id: "4", slug: "laptop-dell-xps-15", title: "Laptop Dell XPS 15", image: "/demo/laptop.jpg", username: "tech_store_bata", category: "Electrónica", status: "published", price: "950.000 FCFA", city: "Bata", date: "10 jun 2025", views: 512 },
  { id: "5", slug: "servicio-electricidad-malabo", title: "Electricista certificado", image: "/demo/electrician.jpg", username: "servicios_ge", category: "Servicios", status: "published", price: "A consultar", city: "Malabo", date: "09 jun 2025", views: 344 },
  { id: "6", slug: "generador-honda-5kw", title: "Generador Honda 5 kW", image: "/demo/generator.jpg", username: "repuestos_malabo", category: "Electrónica", status: "pending", price: "680.000 FCFA", city: "Malabo", date: "13 jun 2025", views: 0 },
  { id: "7", slug: "apartamento-lujo-bata", title: "Apartamento lujo Bata", image: "/demo/apartment2.jpg", username: "vivenda_premium_ge", category: "Inmobiliaria", status: "rejected", price: "600.000 FCFA/mes", city: "Bata", date: "08 jun 2025", views: 0 },
  { id: "8", slug: "tv-samsung-55-4k", title: "TV Samsung 55\" 4K", image: "/demo/tv.jpg", username: "electronics_bata", category: "Electrónica", status: "published", price: "480.000 FCFA", city: "Bata", date: "07 jun 2025", views: 623 },
  { id: "9", slug: "moto-honda-cg150", title: "Moto Honda CG150", image: "/demo/moto.jpg", username: "motos_ge_24", category: "Vehículos", status: "expired", price: "890.000 FCFA", city: "Malabo", date: "01 may 2025", views: 1241 },
  { id: "10", slug: "ropa-trabajo-oficina", title: "Ropa de oficina — Lote", image: "/demo/clothes.jpg", username: "boutique_malabo", category: "Moda", status: "published", price: "85.000 FCFA", city: "Malabo", date: "06 jun 2025", views: 289 },
];

// ── User management ───────────────────────────────────────────────────────────

export type UserRole = "subscriber" | "verified_seller" | "moderator" | "super_admin";
export type UserStatus = "active" | "banned";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  city: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  activeListings: number;
}

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Francisco Pérez", username: "francisco_ge", phone: "+240 222 111 222", email: "fran@mail.com", city: "Malabo", role: "super_admin", status: "active", registeredAt: "05 ene 2023", activeListings: 0 },
  { id: "u2", name: "Ana Nsue Obiang", username: "inmobiliaria_ge", phone: "+240 222 333 444", email: "ana@mail.com", city: "Malabo", role: "verified_seller", status: "active", registeredAt: "12 mar 2022", activeListings: 41 },
  { id: "u3", name: "Carlos Mba Ela", username: "carlos_el_tech", phone: "+240 222 555 666", email: "carlos@mail.com", city: "Malabo", role: "subscriber", status: "active", registeredAt: "22 ene 2023", activeListings: 3 },
  { id: "u4", name: "María Engonga", username: "terrenos_centro_sur", phone: "+240 333 111 000", email: "maria@mail.com", city: "Ebebiyín", role: "verified_seller", status: "active", registeredAt: "14 jun 2023", activeListings: 12 },
  { id: "u5", name: "Pedro Ondo Nzang", username: "empresa_logistica_ge", phone: "+240 333 777 888", email: "pedro@mail.com", city: "Bata", role: "subscriber", status: "active", registeredAt: "03 sep 2024", activeListings: 7 },
  { id: "u6", name: "Lucía Maye", username: "boutique_malabo", phone: "+240 222 999 000", email: "lucia@mail.com", city: "Malabo", role: "verified_seller", status: "active", registeredAt: "27 abr 2024", activeListings: 18 },
  { id: "u7", name: "Robert Esono", username: "tech_store_bata", phone: "+240 333 222 333", email: "robert@mail.com", city: "Bata", role: "verified_seller", status: "active", registeredAt: "08 nov 2023", activeListings: 24 },
  { id: "u8", name: "Teresa Abeso", username: "spam_user_08", phone: "+240 222 000 111", email: "spam@mail.com", city: "Malabo", role: "subscriber", status: "banned", registeredAt: "15 feb 2025", activeListings: 0 },
  { id: "u9", name: "Santiago Nguema", username: "motos_ge_24", phone: "+240 222 456 789", email: "santi@mail.com", city: "Malabo", role: "subscriber", status: "active", registeredAt: "11 oct 2024", activeListings: 5 },
  { id: "u10", name: "Elena Otong", username: "moderadora_ge", phone: "+240 222 321 654", email: "elena@mail.com", city: "Malabo", role: "moderator", status: "active", registeredAt: "19 may 2022", activeListings: 0 },
];

// ── Review moderation ─────────────────────────────────────────────────────────

export interface PendingReview {
  id: string;
  reviewerName: string;
  listingTitle: string;
  listingSlug: string;
  rating: number;
  comment: string;
  date: string;
}

export const pendingReviews: PendingReview[] = [
  {
    id: "rev-001",
    reviewerName: "Sandra Mba",
    listingTitle: "Toyota RAV4 2019 · Pocos kilómetros",
    listingSlug: "toyota-rav4-2019-a3f7c2",
    rating: 5,
    comment: "Excelente vendedor, el coche estaba exactamente como se describía. Muy recomendable.",
    date: "13 jun 2025",
  },
  {
    id: "rev-002",
    reviewerName: "José Abeso",
    listingTitle: "Laptop Dell XPS 15",
    listingSlug: "laptop-dell-xps-15",
    rating: 2,
    comment: "La batería no dura ni 2 horas. El anuncio decía 'batería nueva' y era mentira. No lo compréis.",
    date: "12 jun 2025",
  },
  {
    id: "rev-003",
    reviewerName: "Miriam Nchama",
    listingTitle: "Piso 3 hab en alquiler",
    listingSlug: "piso-alquiler-malabo-centro",
    rating: 4,
    comment: "Buen piso, bien ubicado. El propietario respondió rápido por WhatsApp. Solo le falta un poco de mantenimiento.",
    date: "11 jun 2025",
  },
];

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportReason =
  | "spam"
  | "fraud"
  | "prohibited_item"
  | "duplicate"
  | "offensive"
  | "wrong_category"
  | "harassment";

export interface ListingReport {
  id: string;
  reporterName: string;
  listingTitle: string;
  listingSlug: string;
  sellerName: string;
  reason: ReportReason;
  details: string;
  date: string;
  status: ReportStatus;
  sellerActiveReports: number;
}

export interface UserReport {
  id: string;
  reporterName: string;
  reportedName: string;
  reportedUsername: string;
  reason: ReportReason;
  details: string;
  date: string;
  status: ReportStatus;
}

export const listingReports: ListingReport[] = [
  {
    id: "lr-001",
    reporterName: "Alicia Ondo",
    listingTitle: "iPhone 15 Pro 256 GB — Nuevo sellado",
    listingSlug: "iphone-15-pro-nuevo",
    sellerName: "carlos_el_tech",
    reason: "fraud",
    details: "Este mismo anuncio lo publican cada semana y cobran el dinero antes de entregar. Nunca llega el producto.",
    date: "13 jun 2025",
    status: "pending",
    sellerActiveReports: 3,
  },
  {
    id: "lr-002",
    reporterName: "Manuel Ekomo",
    listingTitle: "Generador Honda 5 kW",
    listingSlug: "generador-honda-5kw",
    sellerName: "repuestos_malabo",
    reason: "wrong_category",
    details: "Este artículo debería estar en Electrónica > Generadores, no en Hogar.",
    date: "12 jun 2025",
    status: "pending",
    sellerActiveReports: 1,
  },
  {
    id: "lr-003",
    reporterName: "Laura Nve",
    listingTitle: "Ropa de oficina — Lote",
    listingSlug: "ropa-trabajo-oficina",
    sellerName: "boutique_malabo",
    reason: "duplicate",
    details: "Este anuncio lo publicó exactamente igual hace 3 semanas con otro título.",
    date: "11 jun 2025",
    status: "pending",
    sellerActiveReports: 1,
  },
];

export const userReports: UserReport[] = [
  {
    id: "ur-001",
    reporterName: "Pedro Biyogo",
    reportedName: "Teresa Abeso",
    reportedUsername: "spam_user_08",
    reason: "spam",
    details: "Me envió mensajes de WhatsApp no solicitados después de ver mi número en un anuncio.",
    date: "10 jun 2025",
    status: "resolved",
  },
  {
    id: "ur-002",
    reporterName: "Nuria Owono",
    reportedName: "Juan Nvo",
    reportedUsername: "repuestos_malabo",
    reason: "harassment",
    details: "Después de no comprar su producto, empezó a enviarme mensajes amenazantes.",
    date: "09 jun 2025",
    status: "pending",
  },
];

// ── Featured listing requests ─────────────────────────────────────────────────

export type FeaturedStatus = "pending" | "confirmed" | "expired" | "rejected";

export interface FeaturedRequest {
  id: string;
  listingTitle: string;
  listingSlug: string;
  sellerName: string;
  sellerUsername: string;
  plan: "7d" | "15d" | "30d";
  price: string;
  paymentMethod: string;
  status: FeaturedStatus;
  submittedAt: string;
  activeSince?: string;
  expiresAt?: string;
}

export const featuredRequests: FeaturedRequest[] = [
  {
    id: "fr-001",
    listingTitle: "Toyota RAV4 2019 · Pocos kilómetros",
    listingSlug: "toyota-rav4-2019-a3f7c2",
    sellerName: "Autosgc Malabo",
    sellerUsername: "autosgc_malabo",
    plan: "30d",
    price: "12.000 FCFA",
    paymentMethod: "Transferencia bancaria",
    status: "pending",
    submittedAt: "13 jun 2025",
  },
  {
    id: "fr-002",
    listingTitle: "Piso 3 hab en alquiler",
    listingSlug: "piso-alquiler-malabo-centro",
    sellerName: "Ana Nsue",
    sellerUsername: "inmobiliaria_ge",
    plan: "15d",
    price: "8.000 FCFA",
    paymentMethod: "Mobile money",
    status: "pending",
    submittedAt: "12 jun 2025",
  },
  {
    id: "fr-003",
    listingTitle: "Laptop Dell XPS 15",
    listingSlug: "laptop-dell-xps-15",
    sellerName: "Tech Store Bata",
    sellerUsername: "tech_store_bata",
    plan: "7d",
    price: "5.000 FCFA",
    paymentMethod: "Efectivo (entregado en persona)",
    status: "confirmed",
    submittedAt: "07 jun 2025",
    activeSince: "08 jun 2025",
    expiresAt: "15 jun 2025",
  },
  {
    id: "fr-004",
    listingTitle: "TV Samsung 55\" 4K",
    listingSlug: "tv-samsung-55-4k",
    sellerName: "Electronics Bata",
    sellerUsername: "electronics_bata",
    plan: "7d",
    price: "5.000 FCFA",
    paymentMethod: "Transferencia bancaria",
    status: "expired",
    submittedAt: "01 jun 2025",
    activeSince: "02 jun 2025",
    expiresAt: "09 jun 2025",
  },
];

// ── Analytics data ────────────────────────────────────────────────────────────

export const analyticsData = {
  visitsPerDay: [
    { day: "Lun", value: 1847 },
    { day: "Mar", value: 2134 },
    { day: "Mié", value: 1923 },
    { day: "Jue", value: 2456 },
    { day: "Vie", value: 2891 },
    { day: "Sáb", value: 1567 },
    { day: "Dom", value: 1234 },
  ],
  newListingsPerDay: [
    { day: "Lun", value: 47 },
    { day: "Mar", value: 63 },
    { day: "Mié", value: 52 },
    { day: "Jue", value: 71 },
    { day: "Vie", value: 89 },
    { day: "Sáb", value: 34 },
    { day: "Dom", value: 21 },
  ],
  whatsappPerDay: [
    { day: "Lun", value: 142 },
    { day: "Mar", value: 178 },
    { day: "Mié", value: 163 },
    { day: "Jue", value: 201 },
    { day: "Vie", value: 234 },
    { day: "Sáb", value: 119 },
    { day: "Dom", value: 87 },
  ],
  topListingsByViews: [
    { title: "Toyota RAV4 2019", views: 1241, category: "Vehículos" },
    { title: "Moto Honda CG150", views: 1241, category: "Vehículos" },
    { title: "TV Samsung 55\" 4K", views: 623, category: "Electrónica" },
    { title: "Laptop Dell XPS 15", views: 512, category: "Electrónica" },
    { title: "Servicio electricidad", views: 344, category: "Servicios" },
    { title: "Ropa de oficina", views: 289, category: "Moda" },
    { title: "iPhone 15 Pro", views: 847, category: "Electrónica" },
    { title: "Piso alquiler Malabo", views: 0, category: "Inmobiliaria" },
    { title: "Apartamento lujo Bata", views: 0, category: "Inmobiliaria" },
    { title: "Generador Honda 5 kW", views: 0, category: "Electrónica" },
  ],
  topCities: [
    { name: "Malabo", listings: 3241, pct: 55 },
    { name: "Bata", listings: 2187, pct: 37 },
    { name: "Ebebiyín", listings: 312, pct: 5 },
    { name: "Mongomo", listings: 127, pct: 2 },
    { name: "Luba", listings: 89, pct: 1.5 },
  ],
  topCategories: [
    { name: "Electrónica", listings: 1547 },
    { name: "Vehículos", listings: 1284 },
    { name: "Inmobiliaria", listings: 962 },
    { name: "Moda", listings: 845 },
    { name: "Muebles y Hogar", listings: 671 },
  ],
};

// ── Site settings ─────────────────────────────────────────────────────────────

export const siteSettings = {
  site_whatsapp: "+240 222 000 000",
  listing_expiry_days: "60",
  max_images_per_listing: "10",
  max_listings_per_day: "3",
  moderation_required: "true",
  auto_approve_verified: "true",
  maintenance_mode: "false",
  featured_price_7d: "5000",
  featured_price_15d: "8000",
  featured_price_30d: "12000",
  default_language: "es",
  contact_email: "info@conectage.com",
};

export type SiteSettingKey = keyof typeof siteSettings;
