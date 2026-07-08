import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedListings } from "@/components/home/featured-listings";
import { StatsBar } from "@/components/home/stats-bar";
import { RecentListings } from "@/components/home/recent-listings";
import { StoresStrip } from "@/components/home/stores-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { PaymentsStrip } from "@/components/home/payments-strip";
import { getPublishedListings, getFeaturedListings } from "@/lib/supabase/queries";

export default async function Home() {
  const [listings, featured] = await Promise.all([
    getPublishedListings(),
    getFeaturedListings(),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedListings featured={featured} all={listings} />
      <StatsBar />
      <RecentListings listings={listings.slice(0, 14)} />
      <StoresStrip />
      <PaymentsStrip />
      <HowItWorks />
    </>
  );
}
