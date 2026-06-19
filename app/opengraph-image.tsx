import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #0d0a1a 0%, #1a1033 55%, #2a1a4f 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 44 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>shopi</div>
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          Everything for sale near you, in one feed.
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 34,
            color: "#c4b5fd",
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          Kenya&apos;s social discovery marketplace. Find it, message the seller, done.
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {["Free to use", "No commission", "Kenya-wide"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 26,
                color: "#ede9fe",
                background: "rgba(124,58,237,0.35)",
                border: "1px solid rgba(196,181,253,0.4)",
                borderRadius: 999,
                padding: "10px 26px",
                display: "flex",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
