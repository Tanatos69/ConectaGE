import type { Translations } from "../types";

export const ar: Translations = {
  tabs: { home: "الإعلانات", account: "الحساب" },
  browse: {
    title: "ConectaGE",
    empty: "لا توجد إعلانات منشورة بعد.",
    searchPlaceholder: "ابحث في ConectaGE",
    featured: "مميز",
    wanted: "مطلوب",
    notConfigured: "لم يتم إعداد Supabase (متغيرات EXPO_PUBLIC_SUPABASE_* مفقودة).",
    resultsNearby: "أحدث الإعلانات",
    condition: { new: "جديد", used: "مستعمل", refurbished: "مُجدَّد" },
  },
  listing: {
    notFound: "تعذّر العثور على هذا الإعلان.",
    description: "الوصف",
    seller: "البائع",
    contact: "التواصل عبر واتساب",
  },
  store: {
    notFound: "تعذّر العثور على هذا المتجر.",
    listings: "الإعلانات",
    followers: "متابع",
    verified: "موثّق",
  },
};
