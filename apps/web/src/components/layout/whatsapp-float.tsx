"use client";

import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { useTranslation } from "@/lib/i18n/context";

const SUPPORT_NUMBER = "240555000000";

export function WhatsAppFloat() {
  const { t } = useTranslation();
  const prefill = encodeURIComponent(t("whatsappFloat.message"));

  return (
    <a
      href={`https://wa.me/${SUPPORT_NUMBER}?text=${prefill}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappFloat.contactLabel")}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3"
    >
      <span className="pointer-events-none hidden max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-foreground px-0 py-2 text-sm font-medium text-background opacity-0 shadow-lg transition-all duration-300 group-hover:max-w-xs group-hover:px-4 group-hover:opacity-100 sm:block">
        {t("whatsappFloat.help")}
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg shadow-whatsapp/30 transition-transform hover:bg-whatsapp-hover active:scale-95">
        <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.5s]" />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </a>
  );
}
