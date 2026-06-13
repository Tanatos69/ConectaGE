const img = (name: string) => `/demo/${name}.jpg`;

export interface SellerProfile {
  username: string;
  name: string;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  activeListings: number;
  verified: boolean;
  whatsapp: string;
  city: string;
  bio: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  sellerReply?: string;
}

export interface ListingDetail {
  slug: string;
  description: string;
  images: string[];
  seller: SellerProfile;
  reviews: Review[];
  viewsCount: number;
  extraFields?: Record<string, string>;
  whatsappNumber: string;
  phoneNumber?: string;
}

export const demoSellers: SellerProfile[] = [
  {
    username: "carlos_malabo",
    name: "Carlos Mba Nguema",
    memberSince: "Enero 2024",
    rating: 4.8,
    reviewsCount: 23,
    activeListings: 7,
    verified: true,
    whatsapp: "+240222123456",
    city: "Malabo",
    bio: "Vendedor de vehículos y electrónica en Malabo. Rápido y de confianza.",
  },
  {
    username: "ana_bata",
    name: "Ana Esono Ndongo",
    memberSince: "Marzo 2024",
    rating: 4.9,
    reviewsCount: 15,
    activeListings: 4,
    verified: true,
    whatsapp: "+240222987654",
    city: "Bata",
    bio: "Propietaria de varios inmuebles en Bata y alrededores. Trato directo y sin intermediarios.",
  },
  {
    username: "tech_malabo",
    name: "Pedro Ondo Ela",
    memberSince: "Junio 2023",
    rating: 4.7,
    reviewsCount: 41,
    activeListings: 12,
    verified: true,
    whatsapp: "+240222456789",
    city: "Malabo",
    bio: "Especialista en electrónica y gadgets importados. Garantía en todos mis productos.",
  },
];

const demoReviews: Review[] = [
  {
    id: "r1",
    reviewerName: "Marcos Esono",
    rating: 5,
    comment: "Trato excelente, el producto estaba exactamente como describía. ¡Muy recomendable!",
    date: "Hace 2 semanas",
    sellerReply: "Gracias Marcos, fue un placer. ¡Vuelve cuando quieras!",
  },
  {
    id: "r2",
    reviewerName: "Lucía Bindang",
    rating: 5,
    comment: "Muy rápido en responder y honesto con el estado del artículo. Todo perfecto.",
    date: "Hace 1 mes",
  },
  {
    id: "r3",
    reviewerName: "José Nze Nguema",
    rating: 4,
    comment: "Buen vendedor, algo de demora en responder pero al final todo salió bien.",
    date: "Hace 6 semanas",
  },
];

export const listingDetails: Record<string, ListingDetail> = {
  "toyota-rav4-2019-a3f7c2": {
    slug: "toyota-rav4-2019-a3f7c2",
    description: `Toyota RAV4 2019 en excelente estado, con pocos kilómetros recorridos. Este vehículo ha sido mantenido cuidadosamente con revisiones periódicas en taller oficial.

Características principales:
- Motor 2.0L 4 cilindros, 150 CV
- Transmisión automática CVT
- Climatizador automático bizona
- Sistema multimedia con pantalla táctil 8"
- Cámara de visión trasera y sensores de aparcamiento
- Asientos de cuero y techo solar panorámico

El vehículo se vende con documentación al día, sin tachas ni golpes. Solo venta en mano, no se hacen envíos.`,
    images: [img("toyota-rav4"), img("toyota-rav4"), img("toyota-rav4")],
    seller: demoSellers[0],
    reviews: demoReviews,
    viewsCount: 843,
    extraFields: {
      "Marca": "Toyota",
      "Modelo": "RAV4",
      "Año": "2019",
      "Kilómetros": "78.000 km",
      "Combustible": "Gasolina",
      "Transmisión": "Automática",
      "Color": "Blanco perla",
      "Plazas": "5",
    },
    whatsappNumber: "+240222123456",
    phoneNumber: "+240222123456",
  },
  "apartamento-moderno-malabo-2-b9d1e4": {
    slug: "apartamento-moderno-malabo-2-b9d1e4",
    description: `Hermoso apartamento en pleno corazón de Malabo II. Edificio moderno de reciente construcción con acabados de primera calidad.

El apartamento cuenta con 3 habitaciones amplias, 2 baños completos, salón-comedor de 35 m², cocina totalmente equipada y terraza privada con vistas a la ciudad.

Incluye:
- Aire acondicionado en todas las habitaciones
- Cocina equipada (horno, vitrocerámica, frigorífico)
- Armarios empotrados en todas las habitaciones
- Plaza de garaje privada
- Zona comunitaria con jardín y seguridad 24h

Disponible para entrada inmediata. Precio negociable para pago al contado.`,
    images: [img("apartamento-malabo"), img("apartamento-malabo"), img("apartamento-malabo")],
    seller: demoSellers[1],
    reviews: demoReviews.slice(0, 2),
    viewsCount: 1247,
    extraFields: {
      "Tipo": "Apartamento",
      "Superficie": "110 m²",
      "Habitaciones": "3",
      "Baños": "2",
      "Planta": "4ª",
      "Garaje": "Incluido",
      "Ascensor": "Sí",
      "Estado": "Excelente",
    },
    whatsappNumber: "+240222987654",
  },
  "iphone-15-pro-max-256-c2a8f0": {
    slug: "iphone-15-pro-max-256-c2a8f0",
    description: `iPhone 15 Pro Max 256GB en color Natural Titanium. El teléfono está en perfecto estado, prácticamente como nuevo. Lleva funda desde el día 1 y tiene el cristal protector original aplicado en tienda.

Estado: Como nuevo (9/10)

Incluye:
- Caja original con todos los accesorios
- Cable USB-C de Apple original
- Adaptador de carga de 20W original
- Factura de compra (menos de 1 año)
- Garantía Apple restante: 6 meses

Teléfono desbloqueado para cualquier operador. Batería al 97%. No acepto permuta, solo venta.`,
    images: [img("iphone-15"), img("iphone-15"), img("iphone-15")],
    seller: demoSellers[2],
    reviews: demoReviews,
    viewsCount: 2156,
    extraFields: {
      "Marca": "Apple",
      "Modelo": "iPhone 15 Pro Max",
      "Almacenamiento": "256 GB",
      "Color": "Natural Titanium",
      "Estado batería": "97%",
      "Desbloqueado": "Sí",
      "Garantía": "6 meses restantes",
    },
    whatsappNumber: "+240222456789",
    phoneNumber: "+240222456789",
  },
  "macbook-pro-m3-14-d4e1a9": {
    slug: "macbook-pro-m3-14-d4e1a9",
    description: `MacBook Pro 14" con chip M3, completamente sellado y sin abrir. Importado directamente desde España con factura incluida.

Especificaciones:
- Chip Apple M3 (8 núcleos CPU, 10 núcleos GPU)
- 8 GB de memoria unificada
- 512 GB SSD
- Pantalla Liquid Retina XDR 14.2"
- MagSafe 3, Thunderbolt 4 (×3), HDMI, lector SD
- Batería hasta 22 horas

Precintado de fábrica. Factura de El Corte Inglés incluida para activar garantía Apple de 1 año. Disponible en Malabo.`,
    images: [img("macbook-pro"), img("macbook-pro"), img("macbook-pro")],
    seller: demoSellers[2],
    reviews: demoReviews.slice(0, 2),
    viewsCount: 987,
    extraFields: {
      "Marca": "Apple",
      "Modelo": "MacBook Pro 14\"",
      "Procesador": "Apple M3",
      "RAM": "8 GB",
      "Almacenamiento": "512 GB SSD",
      "Pantalla": "14.2\" Liquid Retina XDR",
      "Estado": "Sellado / Nuevo",
    },
    whatsappNumber: "+240222456789",
  },
  "yamaha-scooter-125-e7c3b2": {
    slug: "yamaha-scooter-125-e7c3b2",
    description: `Yamaha NMAX 125 del año 2022 en perfecto estado. Scooter ideal para moverse por Bata, económico y muy fiable.

Estado: Muy bueno (7/10). Algún pequeño arañazo en el carenado izquierdo, nada estructural.

Características:
- Motor 125cc, 4 tiempos, inyección electrónica
- Frenos ABS delantero y trasero
- Control de tracción (TCS)
- Cuadro de instrumentos digital con Bluetooth
- Amplio bajo-asiento para casco integral
- Amortiguación trasera regulable

Se entrega con documentación en regla. Precio ligeramente negociable.`,
    images: [img("yamaha-scooter"), img("yamaha-scooter"), img("yamaha-scooter")],
    seller: demoSellers[0],
    reviews: [demoReviews[0], demoReviews[2]],
    viewsCount: 412,
    extraFields: {
      "Marca": "Yamaha",
      "Modelo": "NMAX 125",
      "Año": "2022",
      "Cilindrada": "125 cc",
      "Combustible": "Gasolina",
      "Kilómetros": "8.400 km",
      "Color": "Azul marino",
      "ABS": "Sí",
    },
    whatsappNumber: "+240222123456",
  },
};

export function getListingDetail(slug: string): ListingDetail | undefined {
  return listingDetails[slug];
}

export function getSellerByUsername(username: string): SellerProfile | undefined {
  return demoSellers.find((s) => s.username === username);
}
