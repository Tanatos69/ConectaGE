/**
 * Subcategories keyed by parent category slug. Mirrors
 * apps/web/src/lib/subcategories.ts (names/slugs), framework-free so both the
 * publish wizard and the category-browse screen on mobile share one source.
 */

export interface Subcategory {
  slug: string;
  name: string;
}

export const subcategories: Record<string, Subcategory[]> = {
  vehiculos: [
    { slug: "coches-4x4", name: "Coches y 4×4" },
    { slug: "motos-scooters", name: "Motos y Scooters" },
    { slug: "camiones-furgonetas", name: "Camiones y Furgonetas" },
    { slug: "autobuses", name: "Autobuses" },
    { slug: "barcos", name: "Barcos" },
    { slug: "maquinaria", name: "Maquinaria y Equipos" },
    { slug: "repuestos", name: "Repuestos y Accesorios" },
  ],
  inmobiliaria: [
    { slug: "pisos-apartamentos", name: "Pisos y Apartamentos" },
    { slug: "casas-chalets", name: "Casas y Chalets" },
    { slug: "locales-oficinas", name: "Locales y Oficinas" },
    { slug: "terrenos", name: "Terrenos y Solares" },
    { slug: "garajes", name: "Garajes y Aparcamientos" },
    { slug: "habitaciones", name: "Habitaciones" },
  ],
  electronica: [
    { slug: "telefonos-tablets", name: "Teléfonos y Tablets" },
    { slug: "ordenadores", name: "Ordenadores y Portátiles" },
    { slug: "tv-audio", name: "TV, Vídeo y Audio" },
    { slug: "camaras", name: "Cámaras y Fotografía" },
    { slug: "consolas", name: "Consolas y Videojuegos" },
    { slug: "electrodomesticos", name: "Electrodomésticos" },
  ],
  empleo: [
    { slug: "ofertas", name: "Ofertas de Trabajo" },
    { slug: "busqueda", name: "Búsqueda de Trabajo" },
    { slug: "practicas", name: "Prácticas y Becas" },
  ],
  muebles: [
    { slug: "salon-comedor", name: "Salón y Comedor" },
    { slug: "dormitorio", name: "Dormitorio" },
    { slug: "cocina", name: "Cocina" },
    { slug: "jardin-terraza", name: "Jardín y Terraza" },
    { slug: "decoracion", name: "Decoración" },
    { slug: "otros-hogar", name: "Otros Hogar" },
  ],
  moda: [
    { slug: "ropa-hombre", name: "Ropa de Hombre" },
    { slug: "ropa-mujer", name: "Ropa de Mujer" },
    { slug: "ropa-nino", name: "Ropa de Niño" },
    { slug: "calzado", name: "Calzado" },
    { slug: "bolsos-accesorios", name: "Bolsos y Accesorios" },
  ],
  servicios: [
    { slug: "informatica", name: "Informática y Tecnología" },
    { slug: "construccion", name: "Construcción y Reformas" },
    { slug: "limpieza", name: "Limpieza y Mantenimiento" },
    { slug: "transporte", name: "Transporte y Mudanzas" },
    { slug: "clases", name: "Clases y Formación" },
    { slug: "otros-servicios", name: "Otros Servicios" },
  ],
  salud: [
    { slug: "medicamentos", name: "Medicamentos y Farmacia" },
    { slug: "equipos-medicos", name: "Equipos Médicos" },
    { slug: "bienestar", name: "Bienestar y Spa" },
    { slug: "dietetica", name: "Dietética y Nutrición" },
  ],
  educacion: [
    { slug: "clases-particulares", name: "Clases Particulares" },
    { slug: "idiomas", name: "Idiomas" },
    { slug: "libros-material", name: "Libros y Material" },
    { slug: "formacion-profesional", name: "Formación Profesional" },
  ],
  deporte: [
    { slug: "futbol", name: "Fútbol y Rugby" },
    { slug: "fitness", name: "Fitness y Gym" },
    { slug: "ciclismo", name: "Ciclismo" },
    { slug: "natacion", name: "Natación y Surf" },
    { slug: "artes-marciales", name: "Artes Marciales" },
    { slug: "otros-deportes", name: "Otros Deportes" },
  ],
  restaurantes: [
    { slug: "restaurantes", name: "Restaurantes" },
    { slug: "cafeterias", name: "Cafeterías y Bares" },
    { slug: "comida-domicilio", name: "Comida a Domicilio" },
    { slug: "catering", name: "Catering y Eventos" },
  ],
  turismo: [
    { slug: "hoteles", name: "Hoteles y Alojamiento" },
    { slug: "apartamentos-turisticos", name: "Apartamentos Turísticos" },
    { slug: "tours", name: "Tours y Excursiones" },
    { slug: "agencias", name: "Agencias de Viaje" },
  ],
  finanzas: [
    { slug: "seguros", name: "Seguros" },
    { slug: "prestamos", name: "Préstamos y Créditos" },
    { slug: "asesoria", name: "Asesoría Empresarial" },
    { slug: "inversiones", name: "Inversiones" },
  ],
  varios: [
    { slug: "animales-mascotas", name: "Animales y Mascotas" },
    { slug: "juguetes", name: "Juguetes e Infantil" },
    { slug: "arte-antiguedades", name: "Arte y Antigüedades" },
    { slug: "otros", name: "Otros" },
  ],
};

export function getSubcategories(categorySlug: string): Subcategory[] {
  return subcategories[categorySlug] ?? [];
}
