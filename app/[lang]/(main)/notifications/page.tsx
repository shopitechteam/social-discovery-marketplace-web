import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { InboxScreen } from "@/components/layout/InboxScreen";

export const metadata: Metadata = {
  title: siteConfig.routes.notifications.title,
  description: siteConfig.routes.notifications.description,
  // Inbox is private — don't index it
  robots: { index: false, follow: false },
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <InboxScreen lang={lang} />;
}
