"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { routes } from "@/shared/config/routes";
import { CtaSection } from "@/widgets/landing/cta-section";
import { FeaturesSection } from "@/widgets/landing/features-section";
import { HeroSection } from "@/widgets/landing/hero-section";
import { LandingNav } from "@/widgets/landing/landing-nav";
import { ResultsSection } from "@/widgets/landing/results-section";
import { ShowcaseSection } from "@/widgets/landing/showcase-section";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(routes.dashboard);
    }
  }, [user, loading, router]);

  // Render nothing while resolving — prevents a flash of the landing page
  if (loading || user) return null;

  return (
    <>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <ResultsSection />
      <CtaSection />
    </>
  );
}
