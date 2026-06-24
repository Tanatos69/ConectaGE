import type { Metadata } from "next";
import { Suspense } from "react";
import { DestacadosView } from "@/components/home/destacados-view";

export const metadata: Metadata = {
  title: "Anuncios destacados — ConectaGE",
  description: "Los anuncios con mayor visibilidad en Guinea Ecuatorial. Explora las mejores ofertas destacadas.",
};

export default function DestacadosPage() {
  return (
    <Suspense>
      <DestacadosView />
    </Suspense>
  );
}
