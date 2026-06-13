"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function AdminBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200">
      <ShieldAlert className="size-3.5 shrink-0" />
      <span>
        <strong>{t("admin.restricted")}</strong>{" "}
        {t("admin.restrictedRole")}{" "}
        <code className="rounded bg-amber-100 px-1">moderator</code>{" "}
        o{" "}
        <code className="rounded bg-amber-100 px-1">super_admin</code>.
      </span>
    </div>
  );
}
