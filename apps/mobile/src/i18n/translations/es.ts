import type { Translations } from "../types";

export const es: Translations = {
  tabs: { home: "Anuncios", account: "Cuenta" },
  browse: {
    title: "ConectaGE",
    empty: "No hay anuncios publicados todavía.",
    searchPlaceholder: "Buscar en ConectaGE",
    featured: "Destacado",
    wanted: "Se busca",
    notConfigured: "Supabase no está configurado (faltan variables EXPO_PUBLIC_SUPABASE_*).",
    resultsNearby: "Anuncios recientes",
    condition: { new: "Nuevo", used: "Usado", refurbished: "Reacondicionado" },
  },
  listing: {
    notFound: "No se encontró este anuncio.",
    description: "Descripción",
    seller: "Vendedor",
    contact: "Contactar por WhatsApp",
  },
  store: {
    notFound: "No se encontró esta tienda.",
    listings: "Anuncios",
    followers: "seguidores",
    verified: "Verificada",
  },
};
