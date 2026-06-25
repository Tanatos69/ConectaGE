import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://conectage.com"),
  title: {
    default: "ConectaGE — Compra y vende en Guinea Ecuatorial",
    template: "%s · ConectaGE",
  },
  description:
    "El mercado de anuncios clasificados de Guinea Ecuatorial. Publica gratis y contacta directamente por WhatsApp. Vehículos, inmobiliaria, empleo, electrónica y mucho más en Malabo y Bata.",
  keywords: [
    "anuncios Guinea Ecuatorial",
    "comprar vender Malabo",
    "clasificados Bata",
    "OLX Guinea Ecuatorial",
    "mercado online GE",
  ],
  openGraph: {
    type: "website",
    locale: "es_GQ",
    siteName: "ConectaGE",
    title: "ConectaGE — Compra y vende en Guinea Ecuatorial",
    description:
      "Publica tu anuncio gratis y contacta por WhatsApp. El mercado de Guinea Ecuatorial.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
