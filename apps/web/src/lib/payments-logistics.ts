/**
 * Payment methods and last-mile logistics shown across the site. Straight from
 * the commercial plan (Muni Dinero / Rosa Money / BGF Mobile + última-milla
 * zones). Informational in the demo — the contact model stays WhatsApp-only —
 * but it signals the platform's commercial capabilities to enterprise buyers.
 */
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  /** false → shown as "Próximamente". */
  available: boolean;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "muni-dinero",
    name: "Muni Dinero",
    description: "Pago con monedero móvil Muni Dinero.",
    available: true,
  },
  {
    id: "rosa-money",
    name: "Rosa Money",
    description: "Transferencias instantáneas con Rosa Money.",
    available: true,
  },
  {
    id: "bgf-mobile",
    name: "BGF Mobile",
    description: "Pago móvil a través de BGF Mobile.",
    available: true,
  },
  {
    id: "transferencia",
    name: "Transferencia bancaria",
    description: "CCEI Bank, BGFI, BANGE y otras entidades.",
    available: true,
  },
  {
    id: "tarjeta",
    name: "Tarjeta bancaria",
    description: "Visa y Mastercard.",
    available: false,
  },
];

export interface DeliveryZone {
  city: string;
  eta: string;
}

export const deliveryZones: DeliveryZone[] = [
  { city: "Malabo", eta: "24–48 h" },
  { city: "Bata", eta: "24–72 h" },
  { city: "Resto del país", eta: "3–6 días" },
];

export const logisticsServices = [
  "Entrega a domicilio",
  "Recogida en punto autorizado",
  "Seguimiento de envío en tiempo real",
  "Agrupación de pedidos por zona",
];
