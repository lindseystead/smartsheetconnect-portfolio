/**
 * Home page component.
 *
 * Main landing page with hero, features, how it works, and demo form sections.
 *
 * @author Lindsey Stead
 * @module client/pages/Home
 */

import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { DemoFormSection } from "@/components/DemoFormSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { Footer } from "@/components/Footer";

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <DemoFormSection />
      </main>
      <Footer />
    </div>
  );
}
