import type { Metadata } from "next";
import { CreditsView } from "@/components/account/credits-view";

export const metadata: Metadata = { title: "Créditos y promociones" };

export default function CreditosPage() {
  return <CreditsView />;
}
