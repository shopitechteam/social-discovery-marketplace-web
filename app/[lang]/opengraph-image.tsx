import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Node runtime so we can read the brand artwork from the public folder.
export const runtime = "nodejs";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // The hand-painted SHOPI brush lockup — the real brand mark.
  const lockup = await readFile(
    join(process.cwd(), "public/assets/shopi-lockup.png"),
  );
  const logoSrc = `data:image/png;base64,${lockup.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "56px 80px",
          background: "#ffffff",
          color: "#111",
          fontFamily: "sans-serif",
        }}
      >
        {/* Real brand lockup */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={siteConfig.name} width={600} height={400} />

        <div
          style={{
            marginTop: 28,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: -1,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 980,
            color: "#1a1a1f",
          }}
        >
          {siteConfig.tagline}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
          {["Free to use", "No commission", "Kenya-wide"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 26,
                color: "#C60050",
                background: "rgba(224,0,92,0.08)",
                border: "1px solid rgba(224,0,92,0.35)",
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
