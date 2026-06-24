"use client";

import Link from "next/link";
import { CreditCard, Truck, ArrowRight, Home, MapPin, PackageCheck } from "lucide-react";
import { paymentMethods, deliveryZones } from "@/lib/payments-logistics";
import { useTranslation } from "@/lib/i18n/context";

export function PaymentsStrip() {
  const { t } = useTranslation();

  const services = [
    { icon: Home, label: t("payments.svcHome") },
    { icon: MapPin, label: t("payments.svcPickup") },
    { icon: PackageCheck, label: t("payments.svcTracking") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("payments.title")}</h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm text-muted-foreground">
            {t("payments.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Payment methods */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="size-4 text-primary" />
              {t("payments.methods")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm"
                >
                  {m.name}
                  {!m.available && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {t("payments.soon")}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Truck className="size-4 text-primary" />
              {t("payments.logistics")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {deliveryZones.map((z) => (
                <span
                  key={z.city}
                  className="rounded-xl border bg-background px-3 py-2 text-sm shadow-sm"
                >
                  <span className="font-medium text-foreground">{z.city}</span>
                  <span className="text-muted-foreground"> · {z.eta}</span>
                </span>
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {services.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="size-3.5 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/pagos-y-envios"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t("payments.learnMore")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
