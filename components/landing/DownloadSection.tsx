"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/getDictionary";

export function DownloadSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="download"
      style={{
        padding: "5rem var(--landing-page-x)",
        maxWidth: "var(--landing-page-max)",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "clamp(2.5rem, 6vw, 4.5rem) 1.5rem",
          position: "relative",
          overflow: "hidden",
          background: "rgb(var(--color-bg-subtle))",
          border: "1px solid rgb(var(--color-border))",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgb(var(--brand-primary))",
              marginBottom: "1rem",
            }}
          >
            {dict.download.sectionLabel}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.9rem, 4.5vw, 3.25rem)",
              letterSpacing: 0,
              lineHeight: 1.12,
              color: "rgb(var(--color-text))",
              maxWidth: 640,
              margin: "0 auto 1rem",
            }}
          >
            {dict.download.headline}
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
              color: "rgb(var(--color-text-muted))",
              maxWidth: 520,
              margin: "0 auto 2.25rem",
              lineHeight: 1.6,
            }}
          >
            {dict.download.body}
          </p>

          <Link
            href="/feed"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2.25rem",
              fontSize: "var(--text-md)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {dict.download.webCta}
          </Link>

          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
              marginTop: "1.25rem",
            }}
          >
            Free to browse · No checkout · No commission
          </p>
        </div>
      </div>
    </section>
  );
}
