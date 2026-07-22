/**
 * Minimal key set for what mobile v1 actually renders (tab labels + the
 * browse screen). Unlike apps/web's dictionary — which covers header/footer
 * nav for routes mobile doesn't have yet — this stays small on purpose;
 * grow it alongside the screens that need translation. Login/registro/
 * account/completar-perfil stay Spanish-only, matching apps/web's
 * dashboard convention.
 */
export interface Translations {
  tabs: {
    home: string;
    account: string;
  };
  browse: {
    title: string;
    empty: string;
  };
}
