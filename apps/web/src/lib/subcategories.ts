export interface Subcategory {
  slug: string;
  name: string;
  count: number;
}

export const subcategories: Record<string, Subcategory[]> = {
  vehiculos: [
    { slug: "coches-4x4", name: "Coches y 4×4", count: 612 },
    { slug: "motos-scooters", name: "Motos y Scooters", count: 287 },
    { slug: "camiones-furgonetas", name: "Camiones y Furgonetas", count: 143 },
    { slug: "autobuses", name: "Autobuses", count: 38 },
    { slug: "barcos", name: "Barcos", count: 24 },
    { slug: "maquinaria", name: "Maquinaria y Equipos", count: 67 },
    { slug: "repuestos", name: "Repuestos y Accesorios", count: 113 },
  ],
  inmobiliaria: [
    { slug: "pisos-apartamentos", name: "Pisos y Apartamentos", count: 389 },
    { slug: "casas-chalets", name: "Casas y Chalets", count: 241 },
    { slug: "locales-oficinas", name: "Locales y Oficinas", count: 148 },
    { slug: "terrenos", name: "Terrenos y Solares", count: 112 },
    { slug: "garajes", name: "Garajes y Aparcamientos", count: 43 },
    { slug: "habitaciones", name: "Habitaciones", count: 29 },
  ],
  electronica: [
    { slug: "telefonos-tablets", name: "Teléfonos y Tablets", count: 641 },
    { slug: "ordenadores", name: "Ordenadores y Portátiles", count: 312 },
    { slug: "tv-audio", name: "TV, Vídeo y Audio", count: 287 },
    { slug: "camaras", name: "Cámaras y Fotografía", count: 98 },
    { slug: "consolas", name: "Consolas y Videojuegos", count: 143 },
    { slug: "electrodomesticos", name: "Electrodomésticos", count: 66 },
  ],
  empleo: [
    { slug: "ofertas", name: "Ofertas de Trabajo", count: 231 },
    { slug: "busqueda", name: "Búsqueda de Trabajo", count: 142 },
    { slug: "practicas", name: "Prácticas y Becas", count: 65 },
  ],
  muebles: [
    { slug: "salon-comedor", name: "Salón y Comedor", count: 189 },
    { slug: "dormitorio", name: "Dormitorio", count: 143 },
    { slug: "cocina", name: "Cocina", count: 98 },
    { slug: "jardin-terraza", name: "Jardín y Terraza", count: 67 },
    { slug: "decoracion", name: "Decoración", count: 112 },
    { slug: "otros-hogar", name: "Otros Hogar", count: 62 },
  ],
  moda: [
    { slug: "ropa-hombre", name: "Ropa de Hombre", count: 231 },
    { slug: "ropa-mujer", name: "Ropa de Mujer", count: 312 },
    { slug: "ropa-nino", name: "Ropa de Niño", count: 143 },
    { slug: "calzado", name: "Calzado", count: 98 },
    { slug: "bolsos-accesorios", name: "Bolsos y Accesorios", count: 61 },
  ],
  servicios: [
    { slug: "informatica", name: "Informática y Tecnología", count: 143 },
    { slug: "construccion", name: "Construcción y Reformas", count: 98 },
    { slug: "limpieza", name: "Limpieza y Mantenimiento", count: 87 },
    { slug: "transporte", name: "Transporte y Mudanzas", count: 76 },
    { slug: "clases", name: "Clases y Formación", count: 65 },
    { slug: "otros-servicios", name: "Otros Servicios", count: 60 },
  ],
  salud: [
    { slug: "medicamentos", name: "Medicamentos y Farmacia", count: 89 },
    { slug: "equipos-medicos", name: "Equipos Médicos", count: 67 },
    { slug: "bienestar", name: "Bienestar y Spa", count: 98 },
    { slug: "dietetica", name: "Dietética y Nutrición", count: 58 },
  ],
  educacion: [
    { slug: "clases-particulares", name: "Clases Particulares", count: 112 },
    { slug: "idiomas", name: "Idiomas", count: 87 },
    { slug: "libros-material", name: "Libros y Material", count: 43 },
    { slug: "formacion-profesional", name: "Formación Profesional", count: 32 },
  ],
  deporte: [
    { slug: "futbol", name: "Fútbol y Rugby", count: 98 },
    { slug: "fitness", name: "Fitness y Gym", count: 87 },
    { slug: "ciclismo", name: "Ciclismo", count: 76 },
    { slug: "natacion", name: "Natación y Surf", count: 65 },
    { slug: "artes-marciales", name: "Artes Marciales", count: 43 },
    { slug: "otros-deportes", name: "Otros Deportes", count: 29 },
  ],
  restaurantes: [
    { slug: "restaurantes", name: "Restaurantes", count: 98 },
    { slug: "cafeterias", name: "Cafeterías y Bares", count: 67 },
    { slug: "comida-domicilio", name: "Comida a Domicilio", count: 43 },
    { slug: "catering", name: "Catering y Eventos", count: 13 },
  ],
  turismo: [
    { slug: "hoteles", name: "Hoteles y Alojamiento", count: 76 },
    { slug: "apartamentos-turisticos", name: "Apartamentos Turísticos", count: 56 },
    { slug: "tours", name: "Tours y Excursiones", count: 34 },
    { slug: "agencias", name: "Agencias de Viaje", count: 20 },
  ],
  finanzas: [
    { slug: "seguros", name: "Seguros", count: 54 },
    { slug: "prestamos", name: "Préstamos y Créditos", count: 43 },
    { slug: "asesoria", name: "Asesoría Empresarial", count: 32 },
    { slug: "inversiones", name: "Inversiones", count: 14 },
  ],
  varios: [
    { slug: "animales-mascotas", name: "Animales y Mascotas", count: 143 },
    { slug: "juguetes", name: "Juguetes e Infantil", count: 98 },
    { slug: "arte-antiguedades", name: "Arte y Antigüedades", count: 67 },
    { slug: "otros", name: "Otros", count: 199 },
  ],
};
