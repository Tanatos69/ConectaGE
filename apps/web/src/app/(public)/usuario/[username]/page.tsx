import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star, CheckCircle, MapPin, Calendar, AlertTriangle, Shield, UserCog } from "lucide-react";
import { getSellerByUsername } from "@/lib/demo-detail";
import { adminUsers, type AdminUser } from "@/lib/demo-admin";
import { recentListings, featuredListings } from "@/lib/listings";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ListingCard } from "@/components/listing/listing-card";

interface Props {
  params: Promise<{ username: string }>;
}

const roleLabels: Record<AdminUser["role"], string> = {
  subscriber: "Miembro",
  verified_seller: "Vendedor Verificado",
  moderator: "Moderador",
  super_admin: "Administrador",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const seller = getSellerByUsername(username);
  if (seller) {
    return {
      title: seller.name,
      description: `Perfil de ${seller.name} en ConectaGE. ${seller.activeListings} anuncios activos en ${seller.city}, Guinea Ecuatorial.`,
    };
  }
  const admin = adminUsers.find((u) => u.username === username);
  if (admin) return { title: admin.name };
  return {};
}

function AdminUserProfile({ user }: { user: AdminUser }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <UserAvatar name={user.name} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{user.name}</h1>
              {user.role === "verified_seller" && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <CheckCircle className="size-3.5" />
                  Vendedor Verificado
                </span>
              )}
              {user.role === "moderator" && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Shield className="size-3.5" />
                  Moderador
                </span>
              )}
              {user.role === "super_admin" && (
                <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                  <UserCog className="size-3.5" />
                  Administrador
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {user.city}, Guinea Ecuatorial
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                Miembro desde {user.registeredAt}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-5 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{user.activeListings}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Anuncios activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground capitalize">{roleLabels[user.role]}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Rol en la plataforma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const seller = getSellerByUsername(username);

  if (!seller) {
    const adminUser = adminUsers.find((u) => u.username === username);
    if (!adminUser) notFound();
    return <AdminUserProfile user={adminUser} />;
  }

  const listings = [...featuredListings, ...recentListings].slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <UserAvatar name={seller.name} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{seller.name}</h1>
              {seller.verified && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <CheckCircle className="size-3.5" />
                  Vendedor Verificado
                </span>
              )}
            </div>

            {seller.bio && (
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">{seller.bio}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {seller.city}, Guinea Ecuatorial
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                Miembro desde {seller.memberSince}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-input px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <AlertTriangle className="size-4" />
            Reportar
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{seller.activeListings}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Anuncios activos</p>
          </div>
          <div className="border-x text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <p className="text-2xl font-bold text-foreground">{seller.rating}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Valoración media</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{seller.reviewsCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Reseñas</p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="mb-4 text-lg font-bold text-foreground">
        Anuncios de {seller.name}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.slug} listing={listing} />
        ))}
      </div>
    </div>
  );
}
