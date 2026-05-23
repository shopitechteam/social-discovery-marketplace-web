import { redirect } from "next/navigation";

// Fallback — proxy.ts handles / before this runs in production.
export default function RootPage() {
  redirect("/home");
}
