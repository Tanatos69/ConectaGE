import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, Store as StoreIcon, History } from "lucide-react";
import { getAdminUserDetail, getUserAuditEntries } from "../../data";
import { getUser } from "@/lib/supabase/server";
import { monthYearLabel, postedLabel } from "@/lib/supabase/queries";
import { UserDetailActions } from "@/components/admin/user-detail-actions";
import { UserEditPanel } from "@/components/admin/user-edit-panel";

const auditActionLabel: Record<string, string> = {
  note: "Nota",
  block_user: "Bloqueo",
  unblock_user: "Desbloqueo",
  bulk_block_users: "Bloqueo masivo",
  bulk_unblock_users: "Desbloqueo masivo",
  grant_admin: "Acceso admin concedido",
  revoke_admin: "Acceso admin revocado",
  promote_to_seller: "Convertido en vendedor",
  seller_request_approved: "Solicitud de vendedor aprobada",
  update_user_profile: "Perfil editado",
  delete_user: "Cuenta eliminada",
};

interface Props {
  params: Promise<{ id: string }>;
}

const roleLabel: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Admin",
};

const statusLabel: Record<string, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminUserDetail(id);
  return { title: detail?.profile.full_name || "Usuario" };
}

export default async function AdminUsuarioDetailPage({ params }: Props) {
  const { id } = await params;
  const [detail, currentUser, auditEntries] = await Promise.all([
    getAdminUserDetail(id),
    getUser(),
    getUserAuditEntries(id),
  ]);
  if (!detail) notFound();

  const { profile, listings, tienda } = detail;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Volver a usuarios
      </Link>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile.full_name || "—"}</h1>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {roleLabel[profile.role]}
              </span>
              {profile.blocked_at && (
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  Bloqueada
                </span>
              )}
            </div>
          </div>
          {listings.length > 0 && (
            <Link
              href={`/usuario/${profile.id}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver perfil público →
            </Link>
          )}
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            {profile.email}
          </div>
          {profile.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {profile.phone}
            </div>
          )}
          {profile.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {profile.city}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            Registrado {monthYearLabel(profile.created_at)}
          </div>
        </dl>

        {profile.blocked_at && profile.blocked_reason && (
          <div className="mt-4 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <span className="font-semibold">Motivo del bloqueo: </span>
            {profile.blocked_reason}
          </div>
        )}
      </div>

      <UserDetailActions
        userId={profile.id}
        email={profile.email}
        fullName={profile.full_name}
        role={profile.role}
        blockedAt={profile.blocked_at}
        isSelf={currentUser?.id === profile.id}
      />

      <UserEditPanel
        userId={profile.id}
        fullName={profile.full_name}
        phone={profile.phone}
        city={profile.city}
      />

      {tienda && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <StoreIcon className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Tienda</h2>
          </div>
          <Link
            href={`/tienda/${tienda.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {tienda.name}
          </Link>
          {tienda.verified && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Verificada
            </span>
          )}
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="size-4 text-primary" />
            Anuncios ({listings.length})
          </h2>
        </div>
        {listings.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Todavía no tiene anuncios.
          </p>
        ) : (
          <div className="divide-y">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/anuncios/${l.slug}`}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="truncate font-medium text-foreground">{l.title}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  {statusLabel[l.status]}
                  <span>{postedLabel(l.created_at)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {auditEntries.length > 0 && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <History className="size-4 text-primary" />
              Historial de administración ({auditEntries.length})
            </h2>
          </div>
          <div className="divide-y">
            {auditEntries.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {auditActionLabel[e.action] ?? e.action}
                  </p>
                  {e.meta?.note ? (
                    <p className="mt-0.5 text-muted-foreground">{String(e.meta.note)}</p>
                  ) : e.meta?.reason ? (
                    <p className="mt-0.5 text-muted-foreground">Motivo: {String(e.meta.reason)}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  {e.adminName}
                  <br />
                  {postedLabel(e.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
