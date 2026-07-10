import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { OnboardingIntentModal } from "@/components/layout/onboarding-intent-modal";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { getCategoryTree, getProfile } from "@/lib/supabase/queries";
import { getSiteSettings } from "@/lib/supabase/settings";
import { getUser } from "@/lib/supabase/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [tree, settings] = await Promise.all([getCategoryTree(), getSiteSettings()]);

  // Maintenance mode (admin setting): the public site redirects to
  // /maintenance for everyone except admins. Enforced here — never in the
  // admin layout or /login — so an admin can always get back in to turn it
  // off. getUser/getProfile are request-cached, so this adds no extra
  // round trips when the header already needs them.
  if (settings.maintenance_mode) {
    const user = await getUser();
    const profile = user ? await getProfile(user.id) : null;
    if (profile?.role !== "admin") redirect("/maintenance");
  }

  const categories = tree.filter((c) => c.parentId === null);

  return (
    <div className="flex min-h-screen flex-col">
      {settings.announcement_enabled && settings.announcement_text && (
        <AnnouncementBanner
          text={settings.announcement_text}
          href={settings.announcement_href || undefined}
        />
      )}
      <SiteHeader
        categories={categories}
        siteName={settings.site_name}
        logoUrl={settings.logo_url}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        categories={categories}
        siteName={settings.site_name}
        logoUrl={settings.logo_url}
        tagline={settings.footer_tagline}
        contactEmail={settings.contact_email}
        contactWhatsapp={settings.site_whatsapp}
      />
      <CookieConsent />
      <OnboardingIntentModal />
    </div>
  );
}
