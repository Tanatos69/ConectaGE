import type { Translations } from "../types";

export const en: Translations = {
  tabs: { home: "Listings", account: "Account" },
  browse: {
    title: "ConectaGE",
    empty: "No listings published yet.",
    searchPlaceholder: "Search ConectaGE",
    featured: "Featured",
    wanted: "Wanted",
    notConfigured: "Supabase is not configured (missing EXPO_PUBLIC_SUPABASE_* variables).",
    resultsNearby: "Recent listings",
    condition: { new: "New", used: "Used", refurbished: "Refurbished" },
  },
  listing: {
    notFound: "This listing could not be found.",
    description: "Description",
    seller: "Seller",
    contact: "Contact on WhatsApp",
  },
  store: {
    notFound: "This store could not be found.",
    listings: "Listings",
    followers: "followers",
    verified: "Verified",
  },
};
