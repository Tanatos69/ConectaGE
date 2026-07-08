// Real accounts/listings now live in Supabase (lib/supabase/queries.ts).
// Only the notification mocks remain here — notifications are out of scope
// for the real-backend pass and keep the dashboard UI populated.

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
