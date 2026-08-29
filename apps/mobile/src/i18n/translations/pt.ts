import type { Translations } from "../types";

export const pt: Translations = {
  tabs: { home: "Início", search: "Buscar", favorites: "Favoritos", stores: "Lojas", account: "Conta" },
  browse: {
    title: "GEMarket",
    empty: "Ainda não há anúncios publicados.",
    searchPlaceholder: "Pesquisar no GEMarket",
    featured: "Destaque",
    wanted: "Procura-se",
    notConfigured: "O Supabase não está configurado (variáveis EXPO_PUBLIC_SUPABASE_* em falta).",
    resultsNearby: "Anúncios recentes",
    condition: { new: "Novo", used: "Usado", refurbished: "Recondicionado" },
  },
  listing: {
    notFound: "Este anúncio não foi encontrado.",
    description: "Descrição",
    seller: "Vendedor",
    contact: "Contactar pelo WhatsApp",
  },
  store: {
    notFound: "Esta loja não foi encontrada.",
    listings: "Anúncios",
    followers: "seguidores",
    verified: "Verificada",
  },
};
