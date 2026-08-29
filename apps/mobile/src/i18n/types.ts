/**
 * Key set for mobile's public-facing screens (tabs + browse + search +
 * categories + listing/store chrome). Login/registro/account/publish/settings
 * stay Spanish-only, matching apps/web's dashboard convention, so they're not
 * keyed here. New optional sections let non-Spanish files omit keys and fall
 * back to `es` (full translation is a separate human task, see web's note).
 */
export interface Translations {
  tabs: {
    home: string;
    search: string;
    favorites: string;
    stores: string;
    account: string;
  };
  browse: {
    title: string;
    empty: string;
    searchPlaceholder: string;
    featured: string;
    wanted: string;
    notConfigured: string;
    resultsNearby: string;
    condition: {
      new: string;
      used: string;
      refurbished: string;
    };
  };
  listing: {
    notFound: string;
    description: string;
    seller: string;
    contact: string;
  };
  store: {
    notFound: string;
    listings: string;
    followers: string;
    verified: string;
  };
  home?: {
    categories: string;
    featured: string;
    recent: string;
    seeAll: string;
    publish: string;
    near: string;
  };
  search?: {
    title: string;
    placeholder: string;
    filters: string;
    apply: string;
    clear: string;
    results: string;
    noResults: string;
    save: string;
    saved: string;
    category: string;
    location: string;
    price: string;
    condition: string;
    type: string;
    offer: string;
    wanted: string;
    all: string;
    min: string;
    max: string;
    sortRecent: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
  };
  categories?: {
    title: string;
    all: string;
  };
  common?: {
    retry: string;
    loginRequired: string;
    loginCta: string;
  };
}
