import { MainShell } from "@/components/layout/MainShell";
import { SideNav } from "@/components/layout/SideNav";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Shopi — Social Commerce Platform",
  description: "Discover products, watch videos, and shop live with creators.",
  openGraph: {
    title: "Shopi — Social Commerce Platform",
    description:
      "Discover products, watch videos, and shop live with creators.",
    url: "https://shopi.com",
    siteName: "Shopi",
    images: [
      {
        url: "https://shopi.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shopi Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopi — Social Commerce Platform",
    description:
      "Discover products, watch videos, and shop live with creators.",
    images: ["https://shopi.com/twitter-image.png"],
  },
};

export default async function MainLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return (
    <SocketProvider>
      {/* ── Desktop sidebar — hidden on mobile ── */}
      <SideNav lang={lang} />

      <MainShell lang={lang}>{children}</MainShell>
      {modal}
    </SocketProvider>
  );
}
