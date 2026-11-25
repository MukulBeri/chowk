import type { Metadata } from "next";
import { ExploreGallery } from "@/components/explore-gallery";
export const metadata: Metadata = { title: "Explore the wall" };
export default function ExplorePage() {
  return <main id="main" className="site-page site-section explore-page"><p className="site-eyebrow">Real outputs. Different intentions.</p><h1 className="site-display">Off the wall.</h1><p className="site-intro">A small collection of actual campaigns made with Chowk’s local planner. Explore the formats, see the exact input, then make the brief your own.</p><p className="site-caption">Curated static examples, not live events, verified product photographs or fresh AI generations. Review facts before reusing them.</p><ExploreGallery /></main>;
}
