"use client";

import { useTranslation } from "@/lib/i18n/context";

export function StatsBar() {
  const { t } = useTranslation();

  const stats = [
    { value: "8.900+", label: t("stats.activeListings") },
    { value: "5.200+", label: t("stats.users") },
    { value: "9", label: t("stats.cities") },
    { value: "24/7", label: t("stats.available") },
  ];

  return (
    <section className="bg-gradient-to-br from-blue-800 via-primary to-blue-600 text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="mb-3 mx-auto block h-0.5 w-8 rounded-full bg-white/30" aria-hidden="true" />
                <span className="block text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm font-medium text-primary-foreground/80">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
