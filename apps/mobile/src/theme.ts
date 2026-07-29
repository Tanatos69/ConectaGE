/**
 * Raw design tokens for `style={}` props (icon tint, ActivityIndicator, native
 * shadows, borders) — the runtime mirror of the CSS variables in global.css.
 * className utilities from tailwind.config.js cover everything else and switch
 * light/dark automatically; this file is only for values React Native needs as
 * plain strings. Use `useThemeColors()` in components so raw colors follow the
 * OS theme too; the static `colors` export stays as the light set for
 * backwards-compat with screens not yet migrated.
 */
import { useColorScheme } from "nativewind";
import { toneColors, toneColorsDark, type CategoryTone } from "@conectage/shared";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  whatsapp: string;
  whatsappHover: string;
  whatsappForeground: string;
  featured: string;
  featuredForeground: string;
  ink: string;
  body: string;
  muted: string;
  faint: string;
  line: string;
  hairline: string;
  surface: string; // card / elevated surface
  surfaceMuted: string; // page background
  fill: string;
  star: string;
}

export const lightColors: ThemeColors = {
  primary: "rgb(21, 108, 213)",
  primaryForeground: "#FFFFFF",
  primarySoft: "rgb(233, 242, 253)",
  whatsapp: "rgb(37, 211, 102)",
  whatsappHover: "hsl(142, 71%, 42%)",
  whatsappForeground: "#FFFFFF",
  featured: "rgb(227, 57, 28)",
  featuredForeground: "#FFFFFF",
  ink: "rgb(23, 23, 23)",
  body: "rgb(64, 64, 64)",
  muted: "rgb(115, 115, 115)",
  faint: "rgb(163, 163, 163)",
  line: "rgb(229, 229, 229)",
  hairline: "rgb(244, 244, 245)",
  surface: "#FFFFFF",
  surfaceMuted: "rgb(250, 250, 250)",
  fill: "rgb(244, 244, 245)",
  star: "rgb(245, 158, 11)",
};

export const darkColors: ThemeColors = {
  primary: "rgb(71, 154, 245)",
  primaryForeground: "#FFFFFF",
  primarySoft: "rgb(23, 37, 60)",
  whatsapp: "rgb(37, 211, 102)",
  whatsappHover: "hsl(142, 60%, 45%)",
  whatsappForeground: "#FFFFFF",
  featured: "rgb(244, 96, 72)",
  featuredForeground: "#FFFFFF",
  ink: "rgb(250, 250, 250)",
  body: "rgb(212, 212, 216)",
  muted: "rgb(161, 161, 170)",
  faint: "rgb(113, 113, 122)",
  line: "rgb(39, 39, 42)",
  hairline: "rgb(32, 32, 35)",
  surface: "rgb(24, 24, 27)",
  surfaceMuted: "rgb(11, 11, 13)",
  fill: "rgb(39, 39, 42)",
  star: "rgb(251, 191, 36)",
};

/** Light set — back-compat static export for not-yet-migrated screens. */
export const colors = lightColors;

/** Theme-aware raw colors + isDark flag; reactive to OS color scheme. */
export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return { ...(isDark ? darkColors : lightColors), isDark };
}

/** Tinted category tile colors for the current theme. */
export function useToneColors(): Record<CategoryTone, { bg: string; fg: string }> {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? toneColorsDark : toneColors;
}

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
  lift: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 999,
} as const;

/** Font families loaded in app/_layout.tsx. */
export const font = {
  sans: "Inter_400Regular",
  sansSemibold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  display: "PlusJakartaSans_700Bold",
  displaySemibold: "PlusJakartaSans_600SemiBold",
} as const;
