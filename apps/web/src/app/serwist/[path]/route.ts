import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Cache-busts the extra precached /offline entry whenever the app is
// rebuilt from a new commit — falls back to a random id (e.g. local dev
// without git) so the route still works outside a git checkout.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
