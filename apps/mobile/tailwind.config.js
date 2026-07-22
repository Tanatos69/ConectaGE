/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Ported from apps/web/src/app/globals.css (light-mode values only for v1 —
      // dark mode isn't wired up yet on mobile).
      colors: {
        primary: {
          DEFAULT: "hsl(213, 82%, 46%)",
          foreground: "hsl(0, 0%, 100%)",
          soft: "hsl(213, 82%, 96%)",
        },
        whatsapp: {
          DEFAULT: "hsl(142, 70%, 49%)",
          hover: "hsl(142, 71%, 42%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        featured: {
          DEFAULT: "hsl(4, 78%, 50%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        patriot: {
          blue: "hsl(213, 82%, 46%)",
          green: "hsl(142, 68%, 34%)",
          red: "hsl(4, 78%, 50%)",
          white: "hsl(0, 0%, 100%)",
        },
      },
      borderRadius: {
        sm: 8,
        md: 10,
        lg: 12,
        xl: 16,
        "2xl": 20,
        "3xl": 24,
      },
      // Weight-specific family names matching the exact @expo-google-fonts
      // families loaded in app/_layout.tsx. Named so they don't collide with
      // Tailwind's fontWeight scale (avoid `font-bold`/`font-semibold`, which
      // set font-weight); use these to set the actual loaded font file.
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        display: ["PlusJakartaSans_700Bold"],
        "display-medium": ["PlusJakartaSans_600SemiBold"],
      },
    },
  },
  plugins: [],
};
