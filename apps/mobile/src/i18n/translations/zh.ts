import type { Translations } from "../types";

export const zh: Translations = {
  tabs: { home: "首页", search: "搜索", favorites: "收藏", stores: "店铺", account: "账户" },
  browse: {
    title: "GEMarket",
    empty: "暂无发布的列表。",
    searchPlaceholder: "在 GEMarket 中搜索",
    featured: "精选",
    wanted: "求购",
    notConfigured: "Supabase 未配置（缺少 EXPO_PUBLIC_SUPABASE_* 变量）。",
    resultsNearby: "最新列表",
    condition: { new: "全新", used: "二手", refurbished: "翻新" },
  },
  listing: {
    notFound: "找不到该列表。",
    description: "描述",
    seller: "卖家",
    contact: "通过 WhatsApp 联系",
  },
  store: {
    notFound: "找不到该店铺。",
    listings: "列表",
    followers: "关注者",
    verified: "已认证",
  },
};
