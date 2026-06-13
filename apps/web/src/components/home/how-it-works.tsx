"use client";

import Link from "next/link";
import { UserPlus, FileText, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
      accent: "bg-blue-50 text-blue-600",
    },
    {
      icon: FileText,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
      accent: "bg-violet-50 text-violet-600",
    },
    {
      icon: WhatsAppIcon,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
      accent: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <section className="border-t bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div
            className="absolute left-1/2 top-9 hidden h-0.5 w-2/3 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center rounded-2xl border bg-card p-7 text-center shadow-[var(--shadow-card)]"
            >
              <span className={cn("flex size-16 items-center justify-center rounded-2xl", step.accent)}>
                <step.icon className="size-8" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/publicar" className={cn(buttonVariants({ size: "lg" }))}>
            {t("howItWorks.startCta")}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/ayuda"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            {t("howItWorks.howCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
