"use client";

import { ShieldAlert, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/admin/admin-nav";

export function AdminBanner({
  name,
  avatarUrl,
}: {
  name?: string | null;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-50 px-4 py-1.5 text-xs text-amber-800 border-b border-amber-200">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="size-3.5 shrink-0" />
        <span className="truncate">
          <strong>Área restringida.</strong>{" "}
          <span className="hidden sm:inline">Acceso limitado a administradores de GEMarket.</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {name && (
          <span className="hidden items-center gap-1.5 font-medium sm:flex">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-5 rounded-full object-cover" />
            ) : (
              <UserRound className="size-3.5" />
            )}
            {name}
          </span>
        )}
        <LogoutButton className="w-auto rounded-lg border border-amber-300 bg-white/60 px-2.5 py-1 text-xs text-amber-800 hover:bg-white hover:text-amber-900" />
      </div>
    </div>
  );
}
