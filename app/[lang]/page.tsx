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
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, defaultLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function Rootpage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div>
      <LandingNav dict={dict} lang={lang} />
      <HeroSection dict={dict} />
      <FeaturesSection dict={dict} />
      <HowItWorksSection dict={dict} />
      <AudienceSection dict={dict} />
      <TestimonialsSection dict={dict} />
      <BlogSection dict={dict} />
      <DownloadSection dict={dict} />
      <LandingFooter dict={dict} />
      <SupportChat dict={dict} />
    </div>
  );
}
