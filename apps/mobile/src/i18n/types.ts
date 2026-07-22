/**
 * Key set for what mobile renders in its public-facing screens (tabs + browse
 * + listing/store detail chrome). Login/registro/account/completar-perfil stay
 * Spanish-only, matching apps/web's dashboard convention, so they're not keyed
 * here. Grow this alongside the screens that need translation.
 */
export interface Translations {
  tabs: {
    home: string;
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
}
