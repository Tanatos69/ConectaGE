import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star, CheckCircle, MapPin, Calendar } from "lucide-react";
import { getPublicUserProfile } from "@/lib/supabase/queries";
import { monthYearLabel } from "@/lib/time";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ListingCard } from "@/components/listing/listing-card";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const real = await getPublicUserProfile(username);
  if (real) {
    return {
      title: real.profile.full_name || "Perfil de usuario",
      description: `Perfil de ${real.profile.full_name} en ConectaGE. ${real.listings.length} anuncios activos${real.profile.city ? ` en ${real.profile.city}` : ""}, Guinea Ecuatorial.`,
    };
  }
  return {};
}

/** Real public profile — exists only while the user has ≥1 published listing. */
export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  const real = await getPublicUserProfile(username);
  if (!real) notFound();

  const { profile, listings, rating, reviewsCount } = real;
  const name = profile.full_name || "Usuario";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <UserAvatar name={name} src={profile.avatar_url} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{name}</h1>
              {profile.verified && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <CheckCircle className="size-3.5" />
                  Verificado
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {profile.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {profile.city}, Guinea Ecuatorial
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                Miembro desde {monthYearLabel(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{listings.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Anuncios activos</p>
          </div>
          <div className="border-x text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <p className="text-2xl font-bold text-foreground">{rating > 0 ? rating : "—"}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Valoración media</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{reviewsCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Reseñas</p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="mb-4 text-lg font-bold text-foreground">Anuncios de {name}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.slug} listing={listing} />
        ))}
      </div>
    </div>
  );
}
