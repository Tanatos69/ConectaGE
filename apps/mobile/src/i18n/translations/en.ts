import type { Translations } from "../types";

export const en: Translations = {
  tabs: { home: "Home", search: "Search", favorites: "Saved", stores: "Stores", account: "Account" },
  browse: {
    title: "GEMarket",
    empty: "No listings published yet.",
    searchPlaceholder: "Search GEMarket",
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
