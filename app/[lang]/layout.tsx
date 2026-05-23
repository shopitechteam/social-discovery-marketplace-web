import { locales } from "@/i18n/config";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children }: LayoutProps<"/[lang]">) {
  return <>{children}</>;
}
