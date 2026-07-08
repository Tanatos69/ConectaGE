"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, UserPlus, UserMinus } from "lucide-react";
import { grantAdminAction, revokeAdminAction } from "@/lib/actions/admin";

export interface AdminEntry {
  id: string;
  email: string;
  fullName: string;
  since: string;
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

export function AdminManagers({
  admins,
  currentAdminId,
}: {
  admins: AdminEntry[];
  currentAdminId: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await grantAdminAction(email);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(`Acceso de administrador concedido a ${email.toLowerCase().trim()}.`);
        setEmail("");
      }
    });
  }

  function handleRevoke(admin: AdminEntry) {
    if (
      !window.confirm(
        `¿Revocar el acceso de administrador de ${admin.fullName || admin.email}?`,
      )
    )
      return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await revokeAdminAction(admin.id);
      if (result?.error) setError(result.error);
      else setSuccess(`Acceso revocado a ${admin.email}.`);
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Administradores</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Los administradores acceden a todo el panel /admin. La cuenta debe existir antes de
        poder concederle acceso, y no puedes revocar tu propio acceso.
      </p>

      {/* Current admins */}
      <div className="divide-y rounded-xl border">
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {admin.fullName || admin.email}
                {admin.id === currentAdminId && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Tú
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {admin.email} · desde {admin.since}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRevoke(admin)}
              disabled={pending || admin.id === currentAdminId}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserMinus className="size-3.5" />
              Revocar
            </button>
          </div>
        ))}
      </div>

      {/* Grant form */}
      <form onSubmit={handleGrant} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          placeholder="correo@delnuevo.admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          <UserPlus className="size-4" />
          {pending ? "Guardando…" : "Conceder acceso admin"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}
    </div>
  );
}
