"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/getDictionary";

export function HeroSection({ dict }: { dict: Dictionary }) {
  const router = useRouter();

  function handleExploreClick(e: React.MouseEvent) {
    e.preventDefault();
    router.push("/feed");
  }

  function handleHowItWorksClick(e: React.MouseEvent) {
    e.preventDefault();
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="hero"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "6rem 1.25rem 3rem",
        position: "relative",
      }}
    >
      {/* Soft single background wash — flatter, calmer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            maxWidth: "120vw",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-primary) / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 800,
          color: "rgb(var(--brand-primary))",
          marginBottom: "0.9rem",
        }}
      >
        {dict.hero.badge}
      </p>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(2.25rem, 6.5vw, 4.5rem)",
          lineHeight: 1.08,
          letterSpacing: 0,
          color: "rgb(var(--color-text))",
          maxWidth: "820px",
          marginBottom: "1.25rem",
        }}
      >
        {dict.hero.headline}
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
          color: "rgb(var(--color-text-muted))",
          maxWidth: "540px",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        {dict.hero.subheadline}
      </p>

      {/* CTAs */}
      <div className="hero-cta-row">
        <button
          onClick={handleExploreClick}
          className="btn-primary hero-cta-btn"
          style={{
            padding: "0.9rem 2rem",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          {dict.hero.ctaExplore}
        </button>
        <button
          onClick={handleHowItWorksClick}
          className="hero-cta-btn"
          style={{
            padding: "0.9rem 1.75rem",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "rgb(var(--color-text-muted))",
            border: "1px solid rgb(var(--color-border))",
            borderRadius: "var(--radius-full)",
            background: "rgb(var(--color-bg-elevated))",
            cursor: "pointer",
          }}
        >
          {dict.hero.ctaHowItWorks}
        </button>
      </div>

      {/* Reassurance line — no numbers, just honest promises */}
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
          marginBottom: "1rem",
        }}
      >
        {dict.hero.reassurance}
      </p>

      {/* Phone mockups — single clean phone on mobile, three on desktop */}
      <div className="hero-phones-wrapper">
        <div className="hero-phone-feed">
          <FeedScreen />
        </div>
        <div className="hero-phone-center" style={{ zIndex: 2 }}>
          <ChatScreen />
        </div>
        <div
          className="hero-phone-right"
          style={{ transform: "rotate(8deg) translateY(34px)" }}
        >
          <ProfileScreen />
        </div>
      </div>

      <style>{`
        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 0.9rem;
        }
        .hero-cta-btn { flex-shrink: 0; }
        @media (max-width: 767px) {
          .hero-cta-row {
            flex-direction: column;
            width: 100%;
            max-width: 360px;
          }
          .hero-cta-btn { width: 100%; }
        }
        .hero-phones-wrapper {
          margin-top: 2.5rem;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 1rem;
          perspective: 1200px;
          width: 100%;
          overflow: visible;
        }
        .hero-phone-feed { flex-shrink: 0; transform: rotate(-8deg) translateY(34px); }
        .hero-phone-center { flex-shrink: 0; }
        .hero-phone-right { flex-shrink: 0; }

        @media (max-width: 767px) {
          .hero-phone-center { display: none; }
          .hero-phone-right { display: none; }
          .hero-phones-wrapper {
            margin-top: 2rem;
            margin-bottom: 1rem;
            justify-content: center;
            overflow: visible;
          }
          .hero-phone-feed { transform: none; }
        }

        @media (min-width: 768px) {
          .hero-phones-wrapper { margin-top: 4rem; gap: 2rem; }
        }
      `}</style>
    </section>
  );
}

/* ─── Shared bottom nav (mirrors real BottomNav tabs, line icons only) ─── */
function MockBottomNav({
  active,
}: {
  active: "home" | "explore" | "inbox" | "me";
}) {
  const col = (k: typeof active) =>
    active === k ? "rgb(var(--brand-primary))" : "rgb(var(--color-text-muted))";
  const sw = (k: typeof active) => (active === k ? 2.2 : 1.7);
  const label = (k: typeof active, text: string) => (
    <span
      style={{
        fontSize: 7,
        fontWeight: active === k ? 600 : 400,
        fontFamily: "system-ui",
      }}
    >
      {text}
    </span>
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderTop: "1px solid rgb(var(--color-border))",
        background: "rgb(var(--color-bg-elevated) / 0.95)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color: col("home"),
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
            stroke="currentColor"
            strokeWidth={sw("home")}
            strokeLinejoin="round"
            fill={active === "home" ? "currentColor" : "none"}
            fillOpacity={active === "home" ? 0.15 : 0}
          />
          <path
            d="M9 21V12h6v9"
            stroke="currentColor"
            strokeWidth={sw("home")}
            strokeLinejoin="round"
          />
        </svg>
        {label("home", "Home")}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color: col("explore"),
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="11"
            cy="11"
            r="7.5"
            stroke="currentColor"
            strokeWidth={sw("explore")}
            fill={active === "explore" ? "currentColor" : "none"}
            fillOpacity={active === "explore" ? 0.1 : 0}
          />
          <path
            d="M17.5 17.5L21 21"
            stroke="currentColor"
            strokeWidth={sw("explore")}
            strokeLinecap="round"
          />
        </svg>
        {label("explore", "Explore")}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 36,
            height: 24,
            borderRadius: 12,
            background: "rgb(var(--brand-primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color: col("inbox"),
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7.414L4 19.414V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth={sw("inbox")}
            strokeLinejoin="round"
            fill={active === "inbox" ? "currentColor" : "none"}
            fillOpacity={active === "inbox" ? 0.12 : 0}
          />
        </svg>
        {label("inbox", "Inbox")}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color: col("me"),
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="3.5"
            stroke="currentColor"
            strokeWidth={sw("me")}
            fill={active === "me" ? "currentColor" : "none"}
            fillOpacity={active === "me" ? 0.15 : 0}
          />
          <path
            d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
            stroke="currentColor"
            strokeWidth={sw("me")}
            strokeLinecap="round"
          />
        </svg>
        {label("me", "Me")}
      </div>
    </div>
  );
}

/* ─── iPhone shell ─── */
function IPhoneShell({
  children,
  screenBg,
}: {
  children: React.ReactNode;
  screenBg?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 210,
        height: 456,
        borderRadius: 44,
        background:
          "linear-gradient(160deg, #2e2e2e 0%, #1c1c1c 40%, #111 100%)",
        boxShadow:
          "0 0 0 1px #3c3c3c, 0 0 0 2.5px #0a0a0a, inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 70px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)",
        padding: "8px",
        flexShrink: 0,
      }}
    >
      {/* Side buttons */}
      <div
        style={{
          position: "absolute",
          right: -3,
          top: 112,
          width: 3,
          height: 54,
          borderRadius: "0 2px 2px 0",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 100,
          width: 3,
          height: 40,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 150,
          width: 3,
          height: 40,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
        }}
      />
      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
          background: screenBg ?? "rgb(var(--color-bg))",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 76,
            height: 20,
            borderRadius: 16,
            background: "#000",
            zIndex: 20,
          }}
        />
        {children}
      </div>
    </div>
  );
}

function PhotoTile({
  src,
  alt,
  label,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  label?: string;
  objectPosition?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "rgb(var(--color-bg-subtle))",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            lineHeight: 1.3,
            textShadow: "0 1px 2px rgba(0,0,0,0.45)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ─── Round avatar with initials ─── */
function Avatar({
  initials,
  from,
  to,
  size = 28,
}: {
  initials: string;
  from: string;
  to: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: "system-ui",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Feed Screen ─── */
function FeedScreen() {
  return (
    <IPhoneShell>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "rgb(var(--color-bg))",
        }}
      >
        <div style={{ height: 30, flexShrink: 0 }} />
        {/* App header */}
        <div
          style={{
            padding: "4px 14px 6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "rgb(var(--color-text))",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "system-ui",
              letterSpacing: -0.5,
            }}
          >
            shopi
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(var(--color-text-muted))"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Post 1 — furniture */}
          <div
            style={{
              background: "rgb(var(--color-bg-elevated))",
              borderBottom: "1px solid rgb(var(--color-border))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px 6px",
              }}
            >
              <Avatar initials="MK" from="#8b6b3d" to="#c9a87c" />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                  }}
                >
                  Mary&apos;s Furniture
                </div>
                <div
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 7 }}
                >
                  Kiambu · 2h ago
                </div>
              </div>
              <div
                style={{
                  color: "rgb(var(--brand-primary))",
                  fontSize: 9,
                  fontWeight: 700,
                  border: "1px solid rgb(var(--brand-primary))",
                  borderRadius: 20,
                  padding: "2px 8px",
                }}
              >
                Follow
              </div>
            </div>
            <div
              style={{ width: "100%", aspectRatio: "1", position: "relative" }}
            >
              <PhotoTile
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                alt="Warm wooden dining table in a furnished room"
                label="Solid mahogany table"
                objectPosition="center 58%"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 8,
                }}
              >
                KSh 18,500
              </div>
            </div>
            <div style={{ padding: "7px 12px 8px" }}>
              <div
                style={{
                  color: "rgb(var(--color-text))",
                  fontSize: 8,
                  lineHeight: 1.5,
                }}
              >
                Handmade 6-seater dining table. Pickup in Kiambu or delivery
                arranged.
              </div>
            </div>
          </div>

          {/* Post 2 — phone */}
          <div
            style={{
              background: "rgb(var(--color-bg-elevated))",
              borderBottom: "1px solid rgb(var(--color-border))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px 6px",
              }}
            >
              <Avatar initials="TD" from="#10b981" to="#3b82f6" />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  TechDeals Nairobi
                </div>
                <div
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 7 }}
                >
                  Nairobi CBD · 1h ago
                </div>
              </div>
            </div>
            <div style={{ width: "100%", height: 110, position: "relative" }}>
              <PhotoTile
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"
                alt="Close up of a smartphone in hand"
                label="iPhone 13 Pro · clean"
                objectPosition="center 42%"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 8,
                }}
              >
                KSh 42,000
              </div>
            </div>
          </div>
        </div>

        <MockBottomNav active="home" />
      </div>
    </IPhoneShell>
  );
}

/* ─── Chat bubble ─── */
function Bubble({ me, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          background: me
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-bg-subtle))",
          color: me ? "#fff" : "rgb(var(--color-text))",
          border: me ? "none" : "1px solid rgb(var(--color-border))",
          borderRadius: me ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
          padding: "7px 10px",
          fontSize: 8.5,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Chat Screen ─── */
function ChatScreen() {
  return (
    <IPhoneShell>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "rgb(var(--color-bg))",
        }}
      >
        <div style={{ height: 30, flexShrink: 0 }} />
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "4px 12px 8px",
            borderBottom: "1px solid rgb(var(--color-border))",
            flexShrink: 0,
            background: "rgb(var(--color-bg-elevated))",
          }}
        >
          <span style={{ color: "rgb(var(--color-text-muted))", fontSize: 16 }}>
            ‹
          </span>
          <Avatar initials="MK" from="#8b6b3d" to="#c9a87c" size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "rgb(var(--color-text))",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "system-ui",
              }}
            >
              Mary&apos;s Furniture
            </div>
            <div style={{ color: "#22c55e", fontSize: 7.5, fontWeight: 500 }}>
              Online now
            </div>
          </div>
        </div>

        {/* Product context card */}
        <div
          style={{
            margin: "10px 12px 6px",
            borderRadius: 12,
            background: "rgb(var(--color-bg-subtle))",
            border: "1px solid rgb(var(--color-border))",
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
            <div
              style={{
                width: 38,
                height: 38,
              borderRadius: 8,
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              }}
            >
              <PhotoTile
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
                alt="Furniture preview for the product context card"
                objectPosition="center 58%"
              />
            </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "rgb(var(--color-text))",
                fontSize: 8.5,
                fontWeight: 700,
                fontFamily: "system-ui",
              }}
            >
              Mahogany 6-seater dining table
            </div>
            <span
              style={{
                color: "rgb(var(--brand-primary))",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              KSh 18,500
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
            padding: "4px 12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <Bubble>Hi! Is the dining table still available?</Bubble>
          <Bubble me>Yes it is. Solid mahogany, seats six.</Bubble>
          <Bubble>Can you deliver to Ruaka? And is the price fixed?</Bubble>
          <Bubble me>
            I can deliver to Ruaka for 800. We can talk on the price, come see
            it first.
          </Bubble>
          <Bubble>Perfect, I&apos;ll pass by today. Sending my number.</Bubble>
        </div>

        {/* Input bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 12px 10px",
            borderTop: "1px solid rgb(var(--color-border))",
            background: "rgb(var(--color-bg-elevated))",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgb(var(--color-bg-subtle))",
              borderRadius: 20,
              padding: "6px 10px",
              border: "1px solid rgb(var(--color-border))",
              color: "rgb(var(--color-text-placeholder))",
              fontSize: 8,
            }}
          >
            Message Mary&apos;s Furniture…
          </div>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgb(var(--brand-primary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <MockBottomNav active="inbox" />
      </div>
    </IPhoneShell>
  );
}

/* ─── Profile Screen ─── */
function ProfileScreen() {
  const items: { src: string; alt: string; price: string; objectPosition?: string }[] = [
    {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      alt: "Running shoes for sale",
      price: "KSh 1,200",
      objectPosition: "center 48%",
    },
    {
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
      alt: "Black car for sale",
      price: "KSh 2,800",
      objectPosition: "center 62%",
    },
    {
      src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
      alt: "Fresh produce for sale",
      price: "KSh 950",
      objectPosition: "center 55%",
    },
    {
      src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      alt: "Phone for sale",
      price: "KSh 600",
      objectPosition: "center 42%",
    },
    {
      src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
      alt: "Fashion items for sale",
      price: "KSh 4,500",
      objectPosition: "center 42%",
    },
    {
      src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      alt: "Home furniture for sale",
      price: "KSh 780",
      objectPosition: "center 58%",
    },
  ];
  return (
    <IPhoneShell>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "rgb(var(--color-bg))",
        }}
      >
        {/* Cover */}
        <div
          style={{
            height: 72,
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary) / 0.7), rgb(var(--brand-secondary) / 0.6))",
            flexShrink: 0,
          }}
        />
        {/* Avatar + info */}
        <div
          style={{
            padding: "0 12px 8px",
            flexShrink: 0,
            background: "rgb(var(--color-bg))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: -18,
            }}
          >
            <div
              style={{
                border: "3px solid rgb(var(--color-bg))",
                borderRadius: "50%",
              }}
            >
              <Avatar initials="FH" from="#f59e0b" to="#ef4444" size={48} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <div
                style={{
                  background: "rgb(var(--color-bg-subtle))",
                  borderRadius: 20,
                  padding: "4px 10px",
                  border: "1px solid rgb(var(--color-border))",
                  color: "rgb(var(--color-text))",
                  fontSize: 7.5,
                  fontWeight: 700,
                }}
              >
                Message
              </div>
              <div
                style={{
                  background: "rgb(var(--brand-primary))",
                  borderRadius: 20,
                  padding: "4px 10px",
                  color: "#fff",
                  fontSize: 7.5,
                  fontWeight: 700,
                }}
              >
                Follow
              </div>
            </div>
          </div>
          <div style={{ marginTop: 5 }}>
            <div
              style={{
                color: "rgb(var(--color-text))",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "system-ui",
              }}
            >
              FashionHub KE
            </div>
            <div
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: 7.5,
                marginTop: 2,
              }}
            >
              Nairobi CBD · Westlands
            </div>
            <div
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: 7.5,
                marginTop: 3,
                lineHeight: 1.5,
              }}
            >
              Fashion and accessories. New drops most days.
            </div>
          </div>
        </div>
        {/* Product grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1.5,
            background: "rgb(var(--color-border))",
            overflow: "hidden",
          }}
        >
          {items.map(({ src, alt, price, objectPosition }, i) => (
            <div key={i} style={{ aspectRatio: "1", position: "relative" }}>
              <PhotoTile
                src={src}
                alt={alt}
                objectPosition={objectPosition}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  color: "#fff",
                  fontSize: 6.5,
                  fontWeight: 700,
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 5px",
                  borderRadius: 5,
                }}
              >
                {price}
              </div>
            </div>
          ))}
        </div>
        <MockBottomNav active="me" />
      </div>
    </IPhoneShell>
  );
}
