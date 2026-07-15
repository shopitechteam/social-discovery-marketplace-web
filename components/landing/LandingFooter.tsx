import Link from "next/link";
//import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/getDictionary";
import { ShopiLogo } from "@/features/auth/components/AuthIcons";

export function LandingFooter({
  dict,
  lang = "en",
}: {
  dict?: Dictionary;
  lang?: string;
}) {
  return (
    <footer className="mb-8 rounded-md border-t border-border bg-surface px-(--landing-page-x) pt-12 pb-8">
      <div className="mx-auto mb-12 grid max-w-(--landing-page-max) grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-7.5  font-display text-[0.875rem]">
              <ShopiLogo height={56} />
            </div>
          </div>
          <p className="max-w-65 text-sm leading-normal text-muted">
            {dict?.footer.tagline ??
              "Kenya's social marketplace. Discover it, message the seller, done."}
          </p>
          <div className="mt-5 flex gap-3">
            {["𝕏", "ig", "tk", "yt"].map((s) => (
              <a
                key={s}
                href="#"
                className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border bg-elevated text-xs font-bold text-muted no-underline transition-colors duration-150 hover:border-[rgb(var(--color-border-strong))] hover:text-foreground"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          {
            heading: "Product",
            links: [
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "For Buyers", href: "#creators" },
              { label: "For Sellers", href: "#sellers" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "About", href: `/${lang}/about` },
              { label: "Blog", href: `/${lang}/blog` },
              { label: "Careers", href: `/${lang}/careers` },
            ],
          },
          {
            heading: "Legal",
            links: [
              { label: "Privacy Policy", href: `/${lang}/privacy` },
              { label: "Terms of Service", href: `/${lang}/terms` },
              { label: "Cookie Policy", href: `/${lang}/cookies` },
              {
                label: "Community Guidelines",
                href: `/${lang}/community-guidelines`,
              },
              { label: "Prohibited Items", href: `/${lang}/prohibited-items` },
              { label: "Safety Centre", href: `/${lang}/safety-centre` },
              { label: "Contact", href: `/${lang}/contact` },
            ],
          },
        ].map(({ heading, links }) => (
          <div key={heading}>
            {/* h3, not h4: the section above the footer ends at h2, so h3 keeps
                the page heading outline sequential (WCAG / Lighthouse). */}
            <h3 className="mb-4 text-sm font-bold tracking-[0.02em] text-foreground">
              {heading}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted no-underline transition-colors duration-150 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-(--landing-page-max) items-center justify-between border-t border-border pt-6 text-xs text-muted">
        <span>
          {dict?.footer.copyright.replace(
            "{year}",
            String(new Date().getFullYear()),
          ) ??
            `© ${new Date().getFullYear()} Shopi Limited. All rights reserved.`}
        </span>
        <span>Made in Kenya</span>
      </div>
    </footer>
  );
}
