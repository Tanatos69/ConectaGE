import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedListings } from "@/components/home/featured-listings";
import { StatsBar } from "@/components/home/stats-bar";
import { RecentListings } from "@/components/home/recent-listings";
import { HowItWorks } from "@/components/home/how-it-works";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedListings />
      <StatsBar />
      <RecentListings />
      <HowItWorks />
    </>
  );
}
