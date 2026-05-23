import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative mx-auto flex flex-col min-h-svh bg-app"
      style={{ maxWidth: 430 }}
    >
      {/* Scrollable content — padded so nothing hides behind the nav */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))" }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
