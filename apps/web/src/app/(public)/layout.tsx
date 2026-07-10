import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { OnboardingIntentModal } from "@/components/layout/onboarding-intent-modal";
import { getCategoryTree } from "@/lib/supabase/queries";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tree = await getCategoryTree();
  const categories = tree.filter((c) => c.parentId === null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
      <CookieConsent />
      <OnboardingIntentModal />
    </div>
  );
}
