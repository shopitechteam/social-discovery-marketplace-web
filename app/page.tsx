import { AudienceSection } from "@/components/landing/AudienceSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { DownloadSection } from "@/components/landing/DownloadSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { SupportChat } from "@/components/landing/SupportChat";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import React from "react";

function Rootpage() {
  return (
    <div>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AudienceSection />
      <TestimonialsSection />
      <BlogSection />
      <DownloadSection />
      <LandingFooter />
      <SupportChat />
    </div>
  );
}

export default Rootpage;
