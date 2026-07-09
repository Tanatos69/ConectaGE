import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, MapPin, Calendar, Mail, Phone, ShieldCheck } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { monthYearLabel } from "@/lib/time";
import { UserAvatar } from "@/components/ui/user-avatar";

export const metadata: Metadata = { title: "Mi perfil" };

const roleLabel: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Administrador",
};

const roleStyle: Record<string, string> = {
  buyer: "bg-secondary text-muted-foreground",
  seller: "bg-primary/10 text-primary",
  admin: "bg-amber-50 text-amber-700",
};

export default async function PerfilPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/mi-cuenta/perfil");

  const profile = await getProfile(user.id);
  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "Usuario";
  const role = profile?.role ?? "buyer";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>
        <Link
          href="/mi-cuenta/perfil/editar"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Pencil className="size-4" />
          Editar perfil
        </Link>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <UserAvatar name={name} src={profile?.avatar_url} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleStyle[role]}`}
              >
                {roleLabel[role]}
              </span>
              {profile?.verified && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-3.5" />
                  Verificado
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              {profile?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {profile.city}
                </span>
              )}
              {profile?.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 shrink-0" />
                  Miembro desde {monthYearLabel(profile.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact info (read-only overview) */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Información de contacto</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            {profile?.phone ? (
              <span className="text-foreground">{profile.phone}</span>
            ) : (
              <Link
                href="/mi-cuenta/perfil/editar"
                className="font-medium text-primary hover:underline"
              >
                Añade tu número de WhatsApp →
              </Link>
            )}
          </div>
        </div>
        <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
          Tu correo nunca se muestra públicamente. Tu WhatsApp solo aparece en los anuncios que
          publicas.
        </p>
      </div>
    </div>
  );
}
