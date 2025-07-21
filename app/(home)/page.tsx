import React from "react";
import { currentUser } from "@/lib/auth";
import { getPopularSnippets, getPublicSnippets } from "@/actions/snippet";
import HeroSection from "./components/hero-section";
import FeaturesSection from "./components/features-section";
import PopularSnippetsSection from "./components/popular-snippets-section";
import { Footer } from "../_components/footer";

const Home = async () => {
  const user = await currentUser();

  // Fetch popular snippets and recent snippets for the landing page
  const [popularResult, recentResult] = await Promise.all([
    getPopularSnippets(3),
    getPublicSnippets(),
  ]);

  const popularSnippets = popularResult.snippets || [];
  const recentSnippets = (recentResult.snippets || []).slice(0, 6);

  return (
    <div className="min-h-screen">
      <HeroSection user={user} />
      <FeaturesSection />
      <PopularSnippetsSection
        popularSnippets={popularSnippets}
        recentSnippets={recentSnippets}
      />
      <Footer/>
    </div>
  );
};

export default Home;