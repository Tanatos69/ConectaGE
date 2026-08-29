/** @type {import('tailwindcss').Config} */
const rgb = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      // Semantic tokens back the light/dark theme (vars in src/global.css).
      // Brand accents keep their fixed identity; neutrals/surfaces switch.
      colors: {
        primary: {
          DEFAULT: rgb("--color-primary"),
          foreground: "hsl(0, 0%, 100%)",
          soft: rgb("--color-primary-soft"),
        },
        whatsapp: {
          DEFAULT: rgb("--color-whatsapp"),
          hover: "hsl(142, 71%, 42%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        featured: {
          DEFAULT: rgb("--color-featured"),
          foreground: "hsl(0, 0%, 100%)",
        },
        // Surfaces + text (theme-aware).
        bg: rgb("--color-bg"),
        card: rgb("--color-card"),
        elevated: rgb("--color-elevated"),
        ink: rgb("--color-ink"),
        body: rgb("--color-body"),
        subtle: rgb("--color-muted"),
        faint: rgb("--color-faint"),
        line: rgb("--color-line"),
        hairline: rgb("--color-hairline"),
        fill: rgb("--color-fill"),
        star: rgb("--color-star"),
      },
      borderRadius: {
        sm: 8,
        md: 10,
        lg: 12,
        xl: 16,
        "2xl": 20,
        "3xl": 24,
      },
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
