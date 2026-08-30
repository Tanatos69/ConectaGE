/**
 * Guards apps/mobile/app.json against drift from packages/shared/src/brand.ts.
 *
 * app.json is static JSON that Expo loads before any app code runs, so it's the
 * one place BRAND can't reach. This check keeps the two in sync — run it in CI
 * and before every build (`pnpm --filter mobile check:brand`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const brandSrc = readFileSync(
  join(here, "../../../packages/shared/src/brand.ts"),
  "utf8",
);

/** Pull a top-level string field out of the BRAND object literal. */
const field = (key) => {
  const m = brandSrc.match(new RegExp(`^\\s*${key}:\\s*"([^"]+)"`, "m"));
  if (!m) throw new Error(`brand.ts: could not read "${key}"`);
  return m[1];
};

const name = field("name");
const slug = field("slug");
const scheme = field("deepLinkScheme");
const appId = field("appId");

const { expo } = JSON.parse(readFileSync(join(here, "../app.json"), "utf8"));

const checks = [
  ["name", expo.name, name],
  ["slug", expo.slug, slug],
  ["scheme", expo.scheme, scheme],
  ["ios.bundleIdentifier", expo.ios?.bundleIdentifier, appId],
  ["android.package", expo.android?.package, appId],
];

const errors = checks
  .filter(([, actual, expected]) => actual !== expected)
  .map(([path, actual, expected]) => `  ${path}: app.json="${actual}" expected="${expected}"`);

if (errors.length) {
  console.error("app.json is out of sync with packages/shared/src/brand.ts:\n" + errors.join("\n"));
  console.error("\nUpdate app.json (and the expo-image-picker permission strings) to match BRAND.");
  process.exit(1);
}

console.log("app.json matches BRAND ✓");
