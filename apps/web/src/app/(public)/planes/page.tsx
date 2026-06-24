import type { Metadata } from "next";
import { PlanesView } from "@/components/promote/planes-view";

export const metadata: Metadata = {
  title: "Planes y visibilidad",
  description:
    "Destaca tu anuncio en ConectaGE con créditos y opciones de visibilidad. Paquetes desde 5.000 FCFA y planes para vendedores profesionales en Guinea Ecuatorial.",
};

export default function PlanesPage() {
  return <PlanesView />;
}
