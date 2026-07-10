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
} from "@/lib/supabase/queries";

export default async function Home() {
  const [listings, featured, tree, counts] = await Promise.all([
    getPublishedListings(),
    getFeaturedListings(),
    getCategoryTree(),
    getCategoryListingCounts(),
  ]);
  const topLevelCategories = tree.filter((c) => c.parentId === null);

  return (
    <>
      <Hero categories={topLevelCategories} />
      <CategoryGrid categories={topLevelCategories} counts={counts.byCategory} />
      <FeaturedListings featured={featured} all={listings} />
      <StatsBar />
      <RecentListings listings={listings.slice(0, 14)} />
      <StoresStrip />
      <PaymentsStrip />
      <HowItWorks />
    </>
  );
}
