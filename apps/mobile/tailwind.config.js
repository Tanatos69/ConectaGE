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
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["PlusJakartaSans"],
      },
    },
  },
  plugins: [],
};
