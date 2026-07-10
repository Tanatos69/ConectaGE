import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedListings } from "@/components/home/featured-listings";
import { StatsBar } from "@/components/home/stats-bar";
import { RecentListings } from "@/components/home/recent-listings";
import { StoresStrip } from "@/components/home/stores-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { PaymentsStrip } from "@/components/home/payments-strip";
import {
  getPublishedListings,
  getFeaturedListings,
  getCategoryTree,
  getCategoryListingCounts,
  getStores,
} from "@/lib/supabase/queries";
import { getSiteSettings } from "@/lib/supabase/settings";

export default async function Home() {
  const [listings, featured, tree, counts, settings, stores] = await Promise.all([
    getPublishedListings(),
    getFeaturedListings(),
    getCategoryTree(),
    getCategoryListingCounts(),
    getSiteSettings(),
    getStores(4),
  ]);
  const topLevelCategories = tree.filter((c) => c.parentId === null);

  return (
    <>
      <Hero categories={topLevelCategories} />
      {settings.home_show_categories && (
        <CategoryGrid categories={topLevelCategories} counts={counts.byCategory} />
      )}
      {settings.home_show_featured && <FeaturedListings featured={featured} all={listings} />}
      <StatsBar />
      <RecentListings listings={listings.slice(0, 14)} />
      {settings.home_show_stores && <StoresStrip stores={stores} />}
      <PaymentsStrip />
      <HowItWorks />
    </>
  );
}
