import { BRAND } from "@gemarket/shared";

/**
 * Canonical public origin of the site, no trailing slash.
 *
 * `NEXT_PUBLIC_SITE_URL` (set in Netlify once a custom domain is live) wins;
 * otherwise the default from BRAND. Used for `metadataBase`, absolute OG-image
 * URLs, and any place that needs the bare host.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.url).replace(/\/$/, "");

/** Bare hostname of {@link SITE_URL}, e.g. for `x-forwarded-host` fallbacks. */
export const SITE_HOST = new URL(SITE_URL).host;
