import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { signOutAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Cuenta bloqueada" };

export default async function CuentaBloqueadaPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.blocked_at) redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldAlert className="size-10 text-destructive" />
      </div>

      <h1 className="text-3xl font-bold text-foreground">Cuenta bloqueada</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Un administrador ha bloqueado tu cuenta y no puedes usar ConectaGE mientras tanto.
      </p>

      {profile.blocked_reason && (
        <div className="mt-6 max-w-md rounded-2xl border border-input bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
          <span className="font-semibold text-foreground">Motivo: </span>
          {profile.blocked_reason}
        </div>
      )}

      <p className="mt-6 max-w-md text-sm text-muted-foreground">
        Si crees que se trata de un error, contacta con soporte.
      </p>

      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
