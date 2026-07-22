/**
 * Design tokens for the mobile app, ported from apps/web/src/app/globals.css.
 * React Native accepts hsl() color strings, so these stay pixel-faithful to
 * the web palette. Use these constants anywhere a raw color/shadow is needed
 * in a `style={}` prop (tab bar tint, ActivityIndicator, icon color, native
 * shadows) — className utilities from tailwind.config.js cover the rest.
 *
 * Light-mode only for now; dark mode is a follow-on (see the plan).
 */

export const colors = {
  // Brand — EG ocean blue, matches web --primary.
  primary: "hsl(213, 82%, 46%)",
  primaryForeground: "#FFFFFF",
  primarySoft: "hsl(213, 82%, 96%)", // tinted backgrounds (chips, active states)

  // WhatsApp — the ONLY green, reserved for contact CTAs (web --whatsapp).
  whatsapp: "hsl(142, 70%, 49%)",
  whatsappHover: "hsl(142, 71%, 42%)",
  whatsappForeground: "#FFFFFF",

  // Featured / promoted listings (web --featured).
  featured: "hsl(4, 78%, 50%)",
  featuredForeground: "#FFFFFF",

  // Neutrals (Tailwind neutral scale).
  ink: "#171717", // primary text — neutral-900
  body: "#404040", // body copy — neutral-700
  muted: "#737373", // secondary text — neutral-500
  faint: "#A3A3A3", // tertiary / placeholder — neutral-400
  line: "#E5E5E5", // borders — neutral-200
  hairline: "#F5F5F5", // subtle dividers — neutral-100
  surface: "#FFFFFF",
  surfaceMuted: "#FAFAFA", // page background — neutral-50
  fill: "#F5F5F5", // image placeholder / skeleton — neutral-100

  star: "#F59E0B", // amber-500 for ratings
} as const;

/** iOS/Android shadow presets. Spread into a `style={}` prop. */
export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  float: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 999,
} as const;

/** Font families loaded in app/_layout.tsx. */
export const font = {
  sans: "Inter",
  sansSemibold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  display: "PlusJakartaSans_700Bold",
  displaySemibold: "PlusJakartaSans_600SemiBold",
} as const;
