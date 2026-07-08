"use client";

import { ShieldAlert } from "lucide-react";

export function AdminBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200">
      <ShieldAlert className="size-3.5 shrink-0" />
      <span>
        <strong>Área restringida.</strong> Acceso limitado a administradores de ConectaGE.
      </span>
    </div>
  );
}
