"use client";

import { Settings2 } from "lucide-react";
import { clearConsent } from "@/lib/consent";

/** Clears the stored consent choice and re-opens the banner. */
export function ConsentPreferencesButton() {
  function handleClick() {
    clearConsent();
    window.dispatchEvent(new Event("gemarket-consent-cleared"));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <button
      onClick={handleClick}
      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
    >
      <Settings2 className="size-4" />
      Cambiar mis preferencias
    </button>
  );
}
