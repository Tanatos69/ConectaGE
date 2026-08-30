import { BRAND } from "@gemarket/shared";
import type { Translations } from "../types";

export const fr: Translations = {
  tabs: { home: "Accueil", search: "Rechercher", favorites: "Favoris", stores: "Boutiques", account: "Compte" },
  browse: {
    title: BRAND.name,
    empty: "Aucune annonce publiée pour le moment.",
    searchPlaceholder: `Rechercher sur ${BRAND.name}`,
    featured: "En vedette",
    wanted: "Recherché",
    notConfigured: "Supabase n'est pas configuré (variables EXPO_PUBLIC_SUPABASE_* manquantes).",
    resultsNearby: "Annonces récentes",
    condition: { new: "Neuf", used: "Occasion", refurbished: "Reconditionné" },
  },
  listing: {
    notFound: "Cette annonce est introuvable.",
    description: "Description",
    seller: "Vendeur",
    contact: "Contacter sur WhatsApp",
  },
  store: {
    notFound: "Cette boutique est introuvable.",
    listings: "Annonces",
    followers: "abonnés",
    verified: "Vérifiée",
  },
};
