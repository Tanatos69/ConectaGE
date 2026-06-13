"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Menu, X, ChevronDown, User, Heart, LogOut } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { languages } from "@/lib/languages";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

function useSession() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )conectage-role=([^;]+)/);
    setRole(match ? match[1] : null);
  }, []);
  return role;
}

function SearchBar({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <form
      action="/buscar"
      role="search"
      className={cn(
        "flex h-11 w-full items-center rounded-xl border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        className,
      )}
    >
      <Search className="ml-3.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        name="q"
        placeholder={t("header.searchPlaceholder")}
        aria-label={t("header.searchLabel")}
        className="h-full flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="m-1 hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
      >
        {t("header.searchButton")}
      </button>
    </form>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <span className="text-base leading-none">{language.flag}</span>
        <span className="hidden lg:inline">{language.code.toUpperCase()}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("header.closeLangMenu")}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border bg-popover p-1.5 shadow-xl"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                role="menuitemradio"
                aria-checked={lang.code === language.code}
                onClick={() => {
                  setLanguage(lang);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  lang.code === language.code && "bg-accent font-semibold text-accent-foreground",
                )}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const role = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-200",
        scrolled
          ? "border-b border-border/50 bg-background/90 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
          : "bg-background/85",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main row */}
        <div className="flex h-16 items-center gap-3">
          <button
            type="button"
            aria-label={t("header.openMenu")}
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Menu className="size-6" />
          </button>

          <Logo />

          {/* Desktop search */}
          <div className="mx-2 hidden flex-1 md:flex">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />

            <Link
              href="/mi-cuenta/favoritos"
              aria-label={t("header.favorites")}
              className="hidden size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary sm:inline-flex"
            >
              <Heart className="size-5" />
            </Link>

            {role ? (
              <>
                <Link
                  href={role === "admin" ? "/admin" : "/mi-cuenta"}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "default" }),
                    "hidden sm:inline-flex",
                  )}
                >
                  <User className="size-4" />
                  {role === "admin" ? "Admin" : "Mi cuenta"}
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="hidden size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary sm:inline-flex"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "hidden sm:inline-flex",
                )}
              >
                <User className="size-4" />
                {t("header.login")}
              </Link>
            )}

            <Link
              href="/publicar"
              className={buttonVariants({ variant: "default", size: "default" })}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t("header.publish")}</span>
              <span className="sm:hidden">{t("header.publishShort")}</span>
            </Link>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>

        {/* Desktop category quick-nav */}
        <nav
          aria-label={t("header.searchLabel")}
          className="no-scrollbar -mb-px hidden items-center gap-1 overflow-x-auto md:flex"
        >
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FontAwesomeIcon icon={cat.icon} className="size-3.5 shrink-0" aria-hidden="true" />
              {t(`categories.${cat.slug}`)}
            </Link>
          ))}
          <Link
            href="/categorias"
            className="flex shrink-0 items-center px-3 py-2.5 text-sm font-semibold text-primary"
          >
            {t("header.seeAll")}
          </Link>
        </nav>
      </div>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t("header.closeMenu")}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-background shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Logo />
              <button
                type="button"
                aria-label={t("header.closeMenu")}
                onClick={() => setMenuOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                >
                  <User className="size-4" />
                  {t("header.login")}
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuOpen(false)}
                  className={cn(buttonVariants({ variant: "default" }), "flex-1")}
                >
                  {t("header.register")}
                </Link>
              </div>

              <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("categoryGrid.title")}
              </p>
              <nav className="mt-2 grid gap-0.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <FontAwesomeIcon icon={cat.icon} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {t(`categories.${cat.slug}`)}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
