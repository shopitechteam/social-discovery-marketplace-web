"use client";

import React from "react";
import { Handshake, Heart, MapPin, MessageCircle, Search } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";

/* ─── Small building blocks for the illustrative panels ─── */

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

function Dot({
  from,
  to,
  initials,
}: {
  from: string;
  to: string;
  initials: string;
}) {
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

function PhotoTile({
  src,
  alt,
  label,
  objectPosition = "center",
  size = 48,
  radius = 12,
}: {
  src: string;
  alt: string;
  label?: string;
  objectPosition?: string;
  size?: number | string;
  radius?: number;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.18)), url(${JSON.stringify(
          src,
        )})`,
        backgroundSize: "cover",
        backgroundPosition: objectPosition,
        backgroundColor: "rgb(var(--color-bg-subtle))",
        color: "#fff",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        padding: 6,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {label ? (
        <span
          style={{
            fontSize: 8,
            lineHeight: 1.2,
            fontWeight: 800,
            textShadow: "0 1px 2px rgba(0,0,0,0.45)",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function DealFlowIllustration() {
  const productCards = [
    {
      title: "Shamba in Kitengela",
      meta: "KSh 2.8M · Near the tarmac",
      src: "https://propscout.co.ke/storage/properties/files/100-acres-land-for-sale-in-kitengela-jzlsm.jpg",
      alt: "Open land for sale",
      objectPosition: "center 55%",
    },
    {
      title: "55-inch Samsung TV",
      meta: "KSh 46k · Nairobi CBD",
      src: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
      alt: "Television on display",
      objectPosition: "center 48%",
    },
  ];

  return (
    <div
      className="deal-flow"
      aria-label="How Shopi connects a nearby product post to a buyer and seller chat"
    >
      <div className="deal-flow-path" aria-hidden />

      <div className="deal-node deal-seller">
        <div className="deal-node-kicker">Seller posts</div>
        <div className="deal-product-stack">
          {productCards.map(({ title, meta, src, alt, objectPosition }) => (
            <div key={title} className="deal-product-card mb-4 h-12 relative">
              <PhotoTile
                src={src}
                alt={alt}
                objectPosition={objectPosition}
                label=""
                size={56}
                radius={12}
              />
              <div>
                <div className="deal-product-title">{title}</div>
                <div className="deal-product-meta">{meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className=" deal-feed">
        <div className="deal-phone">
          <div className="deal-phone-top">
            <span>For you nearby</span>
            <MapPin size={14} />
          </div>
          <div className="deal-feed-card">
            <div className="deal-feed-media">
              <div
                className="deal-feed-photo"
                role="img"
                aria-label="Plot listing image"
              />
              <div className="deal-distance">
                <MapPin size={11} />
                2.4km
              </div>
            </div>
            <div className="deal-feed-copy">
              <strong>More of what you keep opening</strong>
              <span>because you keep opening nearby listings</span>
            </div>
            <div className="deal-actions">
              <span>
                <Heart size={13} />
                Save
              </span>
              <span>
                <Search size={13} />
                Similar
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="deal-node deal-chat">
        <div className="deal-node-kicker">Buyer messages</div>
        <div className="deal-chat-card">
          <div className="deal-bubble deal-bubble-left">
            Is it still available?
          </div>
          <div className="deal-bubble deal-bubble-right">
            Yes. Come view it today.
          </div>
          <div className="deal-close-row">
            <MessageCircle size={17} />
            <span>Direct chat</span>
          </div>
        </div>
      </div>

      <div className="deal-node deal-close">
        <div className="deal-close-badge">
          <Handshake size={22} />
        </div>
        <div>
          <div className="deal-close-title">Deal agreed outside checkout</div>
          <div className="deal-close-meta">Shopi connects. You decide.</div>
        </div>
      </div>

      <style>{`
        .deal-flow {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 2rem);
          margin: 0 auto 4.5rem;
          border: 1px solid rgb(var(--color-border));
          border-radius: var(--radius-lg);
          background: rgb(var(--color-bg-subtle));
          overflow: hidden;
        }
        .deal-flow-path {
          position: absolute;
          inset: 14% 8%;
          border: 2px dashed rgb(var(--brand-primary) / 0.22);
          border-radius: 24px;
          pointer-events: none;
        }
        .deal-node {
          position: relative;
          z-index: 1;
          background: rgb(var(--color-bg-elevated));
          border: 1px solid rgb(var(--color-border));
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
        }
        .deal-node-kicker {
          padding: 0.8rem 0.9rem 0;
          font-size: 0.72rem;
          font-weight: 800;
          color: rgb(var(--brand-primary));
        }
        .deal-product-stack {
          display: grid;
          gap: 0.65rem;
          padding: 0.85rem;
        }
        .deal-product-card {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .deal-product-title,
        .deal-close-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: rgb(var(--color-text));
        }
        .deal-product-meta,
        .deal-close-meta {
          margin-top: 0.15rem;
          font-size: 0.78rem;
          color: rgb(var(--color-text-muted));
        }
        .deal-phone {
          padding: 0.75rem;
          border-radius: 22px;
          background: rgb(var(--color-bg));
          border: 1px solid rgb(var(--color-border));
        }
        .deal-phone-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.1rem 0.25rem 0.65rem;
          font-size: 0.76rem;
          font-weight: 800;
          color: rgb(var(--color-text));
        }
        .deal-feed-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgb(var(--color-border));
          background: rgb(var(--color-bg-elevated));
        }
        .deal-feed-media {
          min-height: 140px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: rgb(var(--color-bg-subtle));
        }
        .deal-feed-photo {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.28)),
            url("https://lscdn.blob.core.windows.net/add-post/subcategoryid/11433062-add-17059990430099750.jpeg");
          background-size: cover;
          background-position: center 58%;
        }
        .deal-distance {
          position: absolute;
          top: 0.7rem;
          left: 0.7rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.28rem 0.52rem;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.3);
          font-size: 0.7rem;
          font-weight: 800;
        }
        .deal-feed-copy {
          display: grid;
          gap: 0.2rem;
          padding: 0.75rem;
          color: rgb(var(--color-text));
        }
        .deal-feed-copy span {
          font-size: 0.78rem;
          color: rgb(var(--color-text-muted));
        }
        .deal-actions {
          display: flex;
          gap: 0.45rem;
          padding: 0 0.75rem 0.75rem;
        }
        .deal-actions span,
        .deal-close-row {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: rgb(var(--brand-primary));
        }
        .deal-chat-card {
          display: grid;
          gap: 0.55rem;
          padding: 0.85rem;
        }
        .deal-bubble {
          max-width: 86%;
          padding: 0.58rem 0.72rem;
          border-radius: 13px;
          font-size: 0.78rem;
          line-height: 1.4;
        }
        .deal-bubble-left {
          justify-self: start;
          color: rgb(var(--color-text));
          background: rgb(var(--color-bg-subtle));
          border: 1px solid rgb(var(--color-border));
        }
        .deal-bubble-right {
          justify-self: end;
          color: white;
          background: rgb(var(--brand-primary));
        }
        .deal-close-row {
          padding-top: 0.25rem;
        }
        .deal-close {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.95rem;
        }
        .deal-close-badge {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: rgb(var(--brand-secondary));
          flex-shrink: 0;
        }
        @media (min-width: 820px) {
          .deal-flow {
            grid-template-columns: 1fr 1.05fr 1fr;
            grid-template-areas:
              "seller feed chat"
              "seller feed close";
            align-items: center;
            gap: 1.25rem;
            min-height: 380px;
          }
          .deal-seller { grid-area: seller; }
          .deal-feed { grid-area: feed; }
          .deal-chat { grid-area: chat; }
          .deal-close { grid-area: close; }
          .deal-feed {
            transform: translateY(-0.25rem);
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Per-feature visual panels ─── */

function ScrollPanel() {
  return (
    <Panel>
      <Card style={{ width: 220, height: 160, padding: 10 }}>
        <PhotoTile
          src="https://www.crotonmotors.com/wp-content/uploads/2024/08/img0001-12-400x300.jpg.webp"
          alt="Land listing in an open field"
          label="Mazda Cx8 for sale"
          objectPosition="center 55%"
          size="100%"
          radius={12}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Dot from="#10b981" to="#3b82f6" initials="AK" />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 6,
                width: "72%",
                borderRadius: 4,
                background: "rgb(var(--color-border-strong))",
              }}
            />
            <div
              style={{
                height: 5,
                width: "50%",
                borderRadius: 4,
                background: "rgb(var(--color-border))",
                marginTop: 5,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgb(var(--brand-primary))",
            }}
          >
            KSh 3.4M
          </div>
        </div>
      </Card>
    </Panel>
  );
}

function MessagePanel() {
  return (
    <Panel>
      <div
        style={{ width: 210, display: "flex", flexDirection: "column", gap: 8 }}
      >
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
      <div
        style={{ width: 220, display: "flex", flexDirection: "column", gap: 8 }}
      >
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
            Plot in Kitengela, near the tarmac, under 3M
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
            { p: "KSh 2.8M", l: "Athi River" },
            { p: "KSh 3.1M", l: "Kitengela" },
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgb(var(--color-text))",
                  }}
                >
                  {r.p}
                </div>
                <div
                  style={{ fontSize: 9, color: "rgb(var(--color-text-muted))" }}
                >
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
        <Card style={{ width: 94, padding: 8, textAlign: "center" }}>
          <PhotoTile
            src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80"
            alt="Television product photo"
            label=""
            objectPosition="center 48%"
            size={78}
            radius={10}
          />
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgb(var(--color-text))",
              marginTop: 6,
            }}
          >
            Shopi post
          </div>
        </Card>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 18, color: "rgb(var(--color-text-muted))" }}>
            →
          </span>
          <span
            style={{
              fontSize: 8,
              color: "rgb(var(--color-text-muted))",
              whiteSpace: "nowrap",
            }}
          >
            auto-publish
          </span>
        </div>
        <Card style={{ width: 94, padding: 8, textAlign: "center" }}>
          <PhotoTile
            src="https://sf-static.tiktokcdn.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png"
            alt="Vertical social feed listing"
            label=""
            objectPosition="center 55%"
            size={78}
            radius={10}
          />
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgb(var(--color-text))",
              marginTop: 6,
            }}
          >
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
            <span style={{ fontSize: 12.5, color: "rgb(var(--color-text))" }}>
              {t}
            </span>
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
            letterSpacing: 0,
            lineHeight: 1.15,
            color: "rgb(var(--color-text))",
            maxWidth: 620,
            margin: "0 auto",
          }}
        >
          {dict.features.headline}
        </h2>
      </div>

      <DealFlowIllustration />

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
                  letterSpacing: 0,
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
