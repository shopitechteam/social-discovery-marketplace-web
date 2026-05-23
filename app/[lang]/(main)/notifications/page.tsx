import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.routes.notifications.title,
  description: siteConfig.routes.notifications.description,
  // Inbox is private — don't index it
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return <div className="p-4">Inbox</div>;
}
