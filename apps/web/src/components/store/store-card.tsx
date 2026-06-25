"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FollowButton } from "@/components/store/follow-button";
import { useTranslation } from "@/lib/i18n/context";
import type { Store } from "@/lib/stores";

export function StoreCard({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/tienda/${store.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      {/* Banner */}
      <div className="relative aspect-[16/7] overflow-hidden bg-secondary">
        <Image
          src={store.banner}
          alt={store.name}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="-mt-9 flex items-end justify-between">
          <div className="rounded-2xl ring-4 ring-card">
            <UserAvatar name={store.name} src={store.logo} size="lg" />
          </div>
          {store.professional ? (
            <Badge variant="pro">{t("stores.pro")}</Badge>
          ) : (
            <Badge variant="muted">{t("stores.private")}</Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-bold text-foreground group-hover:text-primary">
            {store.name}
          </h3>
          {store.verificationStatus === "verified" && (
            <CheckCircle
              className="size-4 shrink-0 text-primary"
              aria-label={t("stores.verified")}
            />
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{store.tagline}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {store.city}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {store.followers.toLocaleString("es")} {t("stores.followers")}
          </span>
          <span>
            {store.listingSlugs.length} {t("stores.listings")}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <FollowButton slug={store.slug} size="sm" className="flex-1" />
          <span className="rounded-xl border border-input px-3 py-2 text-center text-xs font-semibold text-primary">
            {t("stores.visit")}
          </span>
        </div>
      </div>
    </Link>
  );
}
