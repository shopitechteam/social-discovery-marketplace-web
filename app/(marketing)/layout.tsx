import { LandingNav } from "@/components/landing/LandingNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      <main>{children}</main>
    </>
  );
}
