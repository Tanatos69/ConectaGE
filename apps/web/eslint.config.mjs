import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The service-role Supabase client bypasses RLS: only the admin server
  // actions may import it. (Its `server-only` import also breaks any client
  // bundle at build time; this rule catches it earlier, at lint time.)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/actions/admin.ts", "src/lib/supabase/admin.ts", "src/app/admin/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/admin",
              message:
                "El cliente service-role salta RLS. Impórtalo solo desde lib/actions/admin.ts o páginas de src/app/admin.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
