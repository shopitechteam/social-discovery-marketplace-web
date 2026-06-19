"use client";

import React from "react";
import type { Dictionary } from "@/i18n/getDictionary";

/* ─── Small building blocks for the illustrative panels (no emojis, no icons) ─── */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        background: "rgb(var(--color-bg-subtle))",
        border: "1px solid rgb(var(--color-border))",
        padding: "1.75rem",
        minHeight: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgb(var(--color-bg-elevated))",
        border: "1px solid rgb(var(--color-border))",
        borderRadius: 14,
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tile({
  from,
  to,
  height = 90,
  radius = 10,
}: {
  from: string;
  to: string;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px)",
        }}
      />
    </div>
  );
}

function Dot({ from, to, initials }: { from: string; to: string; initials: string }) {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${from}, ${to})`,
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Per-feature visual panels ─── */

function ScrollPanel() {
  return (
    <Panel>
      <Card style={{ width: 200, padding: 10 }}>
        <Tile from="#c9a87c" to="#8b6b3d" height={96} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <Dot from="#10b981" to="#3b82f6" initials="JW" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, width: "70%", borderRadius: 4, background: "rgb(var(--color-border-strong))" }} />
            <div style={{ height: 5, width: "45%", borderRadius: 4, background: "rgb(var(--color-border))", marginTop: 5 }} />
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgb(var(--brand-primary))",
            }}
          >
            KSh 3,500
          </div>
        </div>
      </Card>
    </Panel>
  );
}

function MessagePanel() {
  return (
    <Panel>
      <div style={{ width: 210, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              maxWidth: "82%",
              background: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgb(var(--color-border))",
              borderRadius: "12px 12px 12px 3px",
              padding: "8px 11px",
              fontSize: 12,
              color: "rgb(var(--color-text))",
            }}
          >
            Is it still available?
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth: "82%",
              background: "rgb(var(--brand-primary))",
              borderRadius: "12px 12px 3px 12px",
              padding: "8px 11px",
              fontSize: 12,
              color: "#fff",
            }}
          >
            Yes. Come see it, we can talk price.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div
            style={{
              maxWidth: "82%",
              background: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgb(var(--color-border))",
              borderRadius: "12px 12px 12px 3px",
              padding: "8px 11px",
              fontSize: 12,
              color: "rgb(var(--color-text))",
            }}
          >
            On my way. Sending my number.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LocalPanel() {
  const pins: { top: string; left: string; label: string }[] = [
    { top: "22%", left: "28%", label: "Kiambu" },
    { top: "52%", left: "62%", label: "CBD" },
    { top: "70%", left: "30%", label: "Kisumu" },
  ];
  return (
    <Panel>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgb(var(--color-border) / 0.5) 0px, rgb(var(--color-border) / 0.5) 1px, transparent 1px, transparent 34px), repeating-linear-gradient(90deg, rgb(var(--color-border) / 0.5) 0px, rgb(var(--color-border) / 0.5) 1px, transparent 1px, transparent 34px)",
        }}
      />
      {pins.map((p) => (
        <div
          key={p.label}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              background: "rgb(var(--brand-primary))",
              boxShadow: "0 4px 10px rgb(var(--brand-primary) / 0.4)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgb(var(--color-text))",
              background: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgb(var(--color-border))",
              borderRadius: 6,
              padding: "1px 6px",
            }}
          >
            {p.label}
          </span>
        </div>
      ))}
    </Panel>
  );
}

function AiPanel() {
  return (
    <Panel>
      <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth: "88%",
              background: "rgb(var(--brand-primary))",
              borderRadius: "12px 12px 3px 12px",
              padding: "8px 11px",
              fontSize: 11.5,
              color: "#fff",
              lineHeight: 1.45,
            }}
          >
            Black Mazda Demio, 2015, under 1M, in Meru
          </div>
        </div>
        <Card style={{ padding: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgb(var(--brand-primary))",
              marginBottom: 8,
            }}
          >
            Shopi found 3 near you
          </div>
          {[
            { p: "KSh 880,000", l: "Meru town" },
            { p: "KSh 940,000", l: "Makutano" },
          ].map((r) => (
            <div
              key={r.p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
              }}
            >
              <Tile from="#1e3a5f" to="#0f172a" height={28} radius={6} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgb(var(--color-text))" }}>
                  {r.p}
                </div>
                <div style={{ fontSize: 9, color: "rgb(var(--color-text-muted))" }}>
                  {r.l}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </Panel>
  );
}

function TiktokPanel() {
  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Card style={{ width: 86, padding: 8, textAlign: "center" }}>
          <Tile from="#7c3aed" to="#a855f7" height={70} />
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgb(var(--color-text))", marginTop: 6 }}>
            Shopi post
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 18, color: "rgb(var(--color-text-muted))" }}>→</span>
          <span style={{ fontSize: 8, color: "rgb(var(--color-text-muted))", whiteSpace: "nowrap" }}>
            auto-publish
          </span>
        </div>
        <Card style={{ width: 86, padding: 8, textAlign: "center" }}>
          <Tile from="#111827" to="#000000" height={70} />
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgb(var(--color-text))", marginTop: 6 }}>
            TikTok
          </div>
          <div
            style={{
              fontSize: 7.5,
              color: "rgb(var(--brand-primary))",
              marginTop: 3,
              lineHeight: 1.3,
            }}
          >
            1st comment links back
          </div>
        </Card>
      </div>
    </Panel>
  );
}

function FreePanel() {
  return (
    <Panel>
      <Card style={{ width: 220, padding: 16 }}>
        {[
          "No fee to post",
          "No commission on sales",
          "Shopi never holds your money",
        ].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 0",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgb(var(--brand-primary) / 0.12)",
                color: "rgb(var(--brand-primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span style={{ fontSize: 12.5, color: "rgb(var(--color-text))" }}>{t}</span>
          </div>
        ))}
      </Card>
    </Panel>
  );
}

export function FeaturesSection({ dict }: { dict: Dictionary }) {
  const f = dict.features.items;
  const rows: { title: string; body: string; visual: React.ReactNode }[] = [
    { title: f.scroll.title, body: f.scroll.body, visual: <ScrollPanel /> },
    { title: f.message.title, body: f.message.body, visual: <MessagePanel /> },
    { title: f.local.title, body: f.local.body, visual: <LocalPanel /> },
    { title: f.ai.title, body: f.ai.body, visual: <AiPanel /> },
    { title: f.tiktok.title, body: f.tiktok.body, visual: <TiktokPanel /> },
    { title: f.free.title, body: f.free.body, visual: <FreePanel /> },
  ];

  return (
    <section
      id="features"
      style={{ padding: "5rem 1.25rem", maxWidth: 1100, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(var(--brand-primary))",
            marginBottom: "0.75rem",
          }}
        >
          {dict.features.sectionLabel}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "rgb(var(--color-text))",
            maxWidth: 620,
            margin: "0 auto",
          }}
        >
          {dict.features.headline}
        </h2>
      </div>

      {/* Alternating blocks */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4.5rem" }}>
        {rows.map((row, i) => (
          <div
            key={row.title}
            className={`feature-row ${i % 2 === 1 ? "feature-row-rev" : ""}`}
          >
            <div className="feature-text">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.35rem, 2.5vw, 1.9rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.85rem",
                }}
              >
                {row.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-md)",
                  color: "rgb(var(--color-text-muted))",
                  lineHeight: 1.65,
                  maxWidth: 440,
                }}
              >
                {row.body}
              </p>
            </div>
            <div className="feature-visual">{row.visual}</div>
          </div>
        ))}
      </div>

      <style>{`
        .feature-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: center;
        }
        .feature-visual { order: -1; }
        @media (min-width: 768px) {
          .feature-row {
            grid-template-columns: 1fr 1fr;
            gap: 3.5rem;
          }
          .feature-visual { order: 0; }
          .feature-row-rev .feature-text { order: 2; }
          .feature-row-rev .feature-visual { order: 1; }
        }
      `}</style>
    </section>
  );
}
