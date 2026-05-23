"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function usePlatform() {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");
  }, []);
  return platform;
}

export function DownloadSection() {
  const platform = usePlatform();
  return (
    <section
      id="download"
      style={{
        padding: "4rem 1.25rem",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "3rem 1.5rem",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgb(var(--brand-primary) / 0.08) 0%, rgb(var(--brand-accent) / 0.08) 50%, rgb(var(--brand-secondary) / 0.06) 100%)",
          border: "1px solid rgb(var(--color-border))",
        }}
      >
        {/* Background orbs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgb(var(--brand-primary) / 0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgb(var(--brand-accent) / 0.1)",
            filter: "blur(60px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              lineHeight: 1,
            }}
          >
            📱
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "rgb(var(--color-text))",
              marginBottom: "1rem",
            }}
          >
            Your local market just got a social feed.
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
              color: "rgb(var(--color-text-muted))",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "var(--leading-normal)",
            }}
          >
            Thousands of local sellers posting videos daily. Buyers discovering products by scrolling, not searching.
            No checkout. No commission. Just real people connecting over real products.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
            }}
          >
            {/* App Store — hidden on Android */}
            {platform !== "android" && (
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgb(var(--color-text))",
                  color: "rgb(var(--color-bg))",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "var(--text-base)",
                  transition: "opacity 0.15s ease, transform 0.1s ease",
                  boxShadow: "var(--shadow-md)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.88";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                  <div style={{ fontSize: "var(--text-xs)", opacity: 0.7 }}>Download on the</div>
                  <div>App Store</div>
                </div>
              </a>
            )}

            {/* Google Play — hidden on iOS */}
            {platform !== "ios" && (
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgb(var(--color-text))",
                  color: "rgb(var(--color-bg))",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "var(--text-base)",
                  transition: "opacity 0.15s ease, transform 0.1s ease",
                  boxShadow: "var(--shadow-md)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.88";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.3.17.64.19.96.08l11.29-6.52-2.5-2.5-9.75 8.94zM.96 1.1C.36 1.45 0 2.1 0 2.88v18.24c0 .78.36 1.43.96 1.78l.1.06 10.22-10.22v-.24L1.06 1.04l-.1.06zM20.38 10.06l-2.9-1.68-2.8 2.8 2.8 2.8 2.92-1.69c.83-.48.83-1.26-.02-1.23zM4.14.24l11.29 6.52-2.5 2.5L3.18.32C3.5.21 3.84.23 4.14.24z"/>
                </svg>
                <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                  <div style={{ fontSize: "var(--text-xs)", opacity: 0.7 }}>Get it on</div>
                  <div>Google Play</div>
                </div>
              </a>
            )}
          </div>

          {/* Continue in web — mobile only */}
          {platform !== "other" && (
            <div style={{ marginBottom: "2rem" }}>
              <Link
                href="/feed"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgb(var(--color-border))",
                  background: "transparent",
                  color: "rgb(var(--color-text-muted))",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "var(--text-sm)",
                  transition: "border-color 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgb(var(--color-border-strong))";
                  e.currentTarget.style.color = "rgb(var(--color-text))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgb(var(--color-border))";
                  e.currentTarget.style.color = "rgb(var(--color-text-muted))";
                }}
              >
                Continue in web →
              </Link>
            </div>
          )}

          <p style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
            Free to use · No payment details needed
          </p>
        </div>
      </div>
    </section>
  );
}
