import type { Metadata } from "next";
import { AppDocument } from "@/components/layout/AppDocument";
import { siteConfig } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
};

export default function PrivacyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppDocument lang="en">{children}</AppDocument>;
}
