const img = (name: string) => `/demo/${name}.jpg`;

export const demoUser = {
  name: "Francisco García",
  username: "francisco_ge",
  email: "franciscopx4@gmail.com",
  phone: "+240 222 000 001",
  whatsapp: "+240 222 000 001",
  city: "Malabo",
  country: "Guinea Ecuatorial",
  bio: "Comprador y vendedor en ConectaGE desde 2025.",
  memberSince: "Enero 2025",
  verified: false,
  stats: {
    activeListings: 3,
    pendingListings: 1,
    favorites: 5,
    totalViews: 234,
  },
};

export type ListingStatus = "published" | "pending" | "rejected" | "expired";

export interface UserListing {
  slug: string;
  title: string;
  description?: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF";
  city: string;
  categoryName: string;
  image: string;
  status: ListingStatus;
  views: number;
  postedLabel: string;
  expiresLabel: string;
  rejectionReason?: string;
}

export const demoMyListings: UserListing[] = [
  {
    slug: "iphone-15-pro-max-256-c2a8f0",
    title: "iPhone 15 Pro Max 256GB · Como nuevo",
    description: "iPhone 15 Pro Max 256 GB en color Titanio Negro. Apenas usado, sin rayones ni golpes. Incluye caja original, cable USB-C y funda de regalo. Batería al 98%.",
    price: 950000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Bata",
    categoryName: "Electrónica",
    image: img("iphone-15"),
    status: "published",
    views: 312,
    postedLabel: "Hace 1 día",
    expiresLabel: "En 59 días",
  },
  {
    slug: "canon-eos-r50-f5a6b7",
    title: "Cámara Canon EOS R50 + objetivo",
    description: "Cámara mirrorless Canon EOS R50 con objetivo kit 18-45mm. Perfecta para fotos y vídeo 4K. Poco uso, estado como nueva. Incluye bolsa, correa y 2 baterías.",
    price: 720000,
    priceType: "negotiable",
    currency: "XAF",
    city: "Malabo",
    categoryName: "Electrónica",
    image: img("canon-camera"),
    status: "published",
    views: 87,
    postedLabel: "Hace 4 horas",
    expiresLabel: "En 60 días",
  },
  {
    slug: "samsung-tv-55-4k-a4b5c6",
    title: 'Samsung Smart TV 55" 4K UHD',
    description: 'Televisor Samsung QLED 55 pulgadas 4K UHD. Sistema Tizen, compatible con Netflix, YouTube y Prime Video. Incluye mando original y base de pie.',
    price: 380000,
    priceType: "fixed",
    currency: "XAF",
    city: "Bata",
    categoryName: "Electrónica",
    image: img("samsung-tv"),
    status: "pending",
    views: 0,
    postedLabel: "Hace 38 min",
    expiresLabel: "—",
  },
  {
    slug: "macbook-pro-m3-14-d4e1a9",
    title: 'MacBook Pro M3 14" · Sellado',
    description: 'MacBook Pro 14 pulgadas con chip M3, 16 GB RAM, 512 GB SSD. Totalmente sellado de fábrica. Comprado en España en diciembre 2024. Incluye factura y garantía Apple.',
    price: 1450000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    categoryName: "Electrónica",
    image: img("macbook-pro"),
    status: "rejected",
    views: 0,
    postedLabel: "Hace 3 días",
    expiresLabel: "—",
    rejectionReason: "El precio parece incorrecto para este tipo de artículo. Edita el precio y vuelve a enviarlo.",
  },
  {
    slug: "ps5-slim-2-mandos-c9d0e1",
    title: "PlayStation 5 Slim + 2 mandos",
    description: "PlayStation 5 Slim edición digital con 2 mandos DualSense. Incluye juegos: FIFA 25, Spider-Man 2 y Gran Turismo 7. Buen estado, todos los cables originales.",
    price: 480000,
    priceType: "fixed",
    currency: "XAF",
    city: "Malabo",
    categoryName: "Electrónica",
    image: img("ps5"),
    status: "expired",
    views: 143,
    postedLabel: "Hace 2 meses",
    expiresLabel: "Expiró hace 5 días",
  },
];

export type NotificationType = "approved" | "rejected" | "expiring" | "review" | "review_approved";

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const demoNotifications: UserNotification[] = [
  {
    id: "n1",
    type: "approved",
    title: "iPhone 15 Pro Max 256GB",
    message: "Tu anuncio ha sido aprobado y está publicado.",
    date: "Hace 1 día",
    read: false,
  },
  {
    id: "n2",
    type: "expiring",
    title: "Cámara Canon EOS R50",
    message: "Tu anuncio expira en 5 días. ¡Renuévalo gratis antes de que desaparezca!",
    date: "Hace 2 días",
    read: false,
  },
  {
    id: "n3",
    type: "review",
    title: "Nueva reseña recibida",
    message: "Marcos Esono dejó una reseña de 5 estrellas en tu anuncio iPhone 15 Pro Max.",
    date: "Hace 3 días",
    read: true,
  },
  {
    id: "n4",
    type: "rejected",
    title: "MacBook Pro M3 14\"",
    message: "Tu anuncio fue rechazado. Motivo: precio incorrecto. Edítalo y vuelve a enviarlo.",
    date: "Hace 3 días",
    read: false,
  },
  {
    id: "n5",
    type: "review_approved",
    title: "Reseña publicada",
    message: "Tu reseña sobre Toyota RAV4 2019 ha sido aprobada.",
    date: "Hace 1 semana",
    read: true,
  },
];
