import { cache } from "react";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";
import { DEFAULT_SETTINGS, type SiteSettings, type SiteSettingKey } from "@/lib/site-settings";

export { DEFAULT_SETTINGS } from "@/lib/site-settings";
export type { SiteSettings, SiteSettingKey } from "@/lib/site-settings";

/**
 * All settings in one round trip, cached per request with React cache() —
 * the root layout (color), public layout (maintenance/banner), header/footer
 * (name/logo) and several actions all read this within a single render.
 * Unknown keys and type-mismatched values are dropped in favor of defaults,
 * so a bad row can degrade one setting but never crash a page.
 */
export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return { ...DEFAULT_SETTINGS };

  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  const settings: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    const key = row.key as SiteSettingKey;
    if (key in DEFAULT_SETTINGS && typeof row.value === typeof DEFAULT_SETTINGS[key]) {
      (settings as Record<string, unknown>)[key] = row.value;
    }
  }
  return settings;
});
