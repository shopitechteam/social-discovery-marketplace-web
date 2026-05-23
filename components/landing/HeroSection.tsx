"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ExploreDialog } from "./ExploreDialog";

export function HeroSection() {
  const [showExplore, setShowExplore] = useState(false);
  const router = useRouter();

  function handleExploreClick(e: React.MouseEvent) {
    e.preventDefault();
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      router.push("/feed");
    } else {
      setShowExplore(true);
    }
  }

  function handleHowItWorksClick(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "5rem 1.25rem 3rem",
        position: "relative",
      }}
    >
      {/* Background glow blobs */}
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
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "600px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-primary) / 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-accent) / 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-secondary) / 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.375rem 1rem",
          borderRadius: "var(--radius-full)",
          border: "1px solid rgb(var(--brand-primary) / 0.3)",
          background: "rgb(var(--brand-primary) / 0.08)",
          color: "rgb(var(--brand-primary))",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          marginBottom: "2rem",
          letterSpacing: "0.02em",
        }}
      >
        <span>✦</span>
        Kenya&apos;s Social Discovery Marketplace
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: "rgb(var(--color-text))",
          maxWidth: "860px",
          marginBottom: "1.5rem",
        }}
      >
        Discover what people
        <br />
        <span
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          near you are selling.
        </span>
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
          color: "rgb(var(--color-text-muted))",
          maxWidth: "580px",
          lineHeight: 1.65,
          marginBottom: "2.5rem",
        }}
      >
        Shopi is where local sellers post videos, photos, and demos — and buyers
        discover them by scrolling, not searching. See something you want?
        Message the seller directly. No middleman. No checkout. Just real
        people, real products, real conversation.
      </p>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "4rem",
        }}
      >
        <button
          onClick={handleExploreClick}
          className="btn-primary"
          style={{
            padding: "0.875rem 2rem",
            fontSize: "var(--text-md)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span>▶</span> Explore what&apos;s near you
        </button>
        <button
          onClick={handleHowItWorksClick}
          style={{
            padding: "0.875rem 2rem",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "rgb(var(--color-text-muted))",
            border: "1px solid rgb(var(--color-border))",
            borderRadius: "var(--radius-full)",
            background: "rgb(var(--color-bg-elevated))",
            transition: "border-color 0.15s ease, color 0.15s ease",
            cursor: "pointer",
          }}
        >
          How it works →
        </button>
      </div>

      {showExplore && <ExploreDialog onClose={() => setShowExplore(false)} />}

      {/* Social proof */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { stat: "50K+", label: "Local sellers posting daily" },
          { stat: "200K+", label: "Products discovered through video" },
          { stat: "4.9★", label: "App Store rating" },
        ].map(({ stat, label }) => (
          <div
            key={stat}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-lg)",
                color: "rgb(var(--color-text))",
              }}
            >
              {stat}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* iPhone 14 Pro Max mockups */}
      <div className="hero-phones-wrapper">
        {/* LEFT PHONE — Feed / Shop Discovery — shown solo on mobile */}
        <div className="hero-phone-feed">
          <FeedScreen />
        </div>

        {/* CENTER PHONE — Video post with chat — desktop only */}
        <div className="hero-phone-center" style={{ zIndex: 2 }}>
          <VideoScreen />
        </div>

        {/* RIGHT PHONE — Seller profile — desktop only */}
        <div className="hero-phone-right" style={{ transform: "rotate(10deg) translateY(40px)" }}>
          <ProfileScreen />
        </div>
      </div>

      <style>{`
        .hero-phones-wrapper {
          margin-top: 3rem;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 1rem;
          perspective: 1200px;
          width: 100%;
          overflow: visible;
        }
        .hero-phone-feed { flex-shrink: 0; transform: rotate(-10deg) translateY(40px); }
        .hero-phone-center { flex-shrink: 0; }
        .hero-phone-right { flex-shrink: 0; }

        /* Mobile: show only the feed phone, full size */
        @media (max-width: 767px) {
          .hero-phone-center { display: none; }
          .hero-phone-right { display: none; }
          .hero-phones-wrapper {
            margin-top: 2rem;
            margin-bottom: 2rem;
            justify-content: center;
            overflow: visible;
          }
          .hero-phone-feed {
            transform: none;
          }
        }

        @media (min-width: 768px) {
          .hero-phones-wrapper { margin-top: 5rem; gap: 2rem; }
        }
      `}</style>
    </section>
  );
}

/* ─── Shared bottom nav (mirrors real BottomNav tabs) ─── */
function MockBottomNav({
  active,
}: {
  active: "home" | "explore" | "inbox" | "me";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
        borderTop: "1px solid rgb(var(--color-border))",
        background: "rgb(var(--color-bg-elevated) / 0.95)",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      {/* Home */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color:
            active === "home"
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-text-muted))",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
            stroke="currentColor"
            strokeWidth={active === "home" ? 2.2 : 1.7}
            strokeLinejoin="round"
            fill={active === "home" ? "currentColor" : "none"}
            fillOpacity={active === "home" ? 0.15 : 0}
          />
          <path
            d="M9 21V12h6v9"
            stroke="currentColor"
            strokeWidth={active === "home" ? 2.2 : 1.7}
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontSize: 7,
            fontWeight: active === "home" ? 600 : 400,
            fontFamily: "system-ui",
          }}
        >
          Home
        </span>
      </div>
      {/* Explore */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color:
            active === "explore"
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-text-muted))",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="11"
            cy="11"
            r="7.5"
            stroke="currentColor"
            strokeWidth={active === "explore" ? 2.2 : 1.7}
            fill={active === "explore" ? "currentColor" : "none"}
            fillOpacity={active === "explore" ? 0.1 : 0}
          />
          <path
            d="M17.5 17.5L21 21"
            stroke="currentColor"
            strokeWidth={active === "explore" ? 2.2 : 1.7}
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontSize: 7,
            fontWeight: active === "explore" ? 600 : 400,
            fontFamily: "system-ui",
          }}
        >
          Explore
        </span>
      </div>
      {/* Post (center pill) */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 36,
            height: 24,
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgb(var(--brand-primary) / 0.4)",
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
      {/* Inbox */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color:
            active === "inbox"
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-text-muted))",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7.414L4 19.414V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth={active === "inbox" ? 2.2 : 1.7}
            strokeLinejoin="round"
            fill={active === "inbox" ? "currentColor" : "none"}
            fillOpacity={active === "inbox" ? 0.12 : 0}
          />
        </svg>
        <span
          style={{
            fontSize: 7,
            fontWeight: active === "inbox" ? 600 : 400,
            fontFamily: "system-ui",
          }}
        >
          Inbox
        </span>
      </div>
      {/* Me */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flex: 1,
          color:
            active === "me"
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-text-muted))",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="3.5"
            stroke="currentColor"
            strokeWidth={active === "me" ? 2.2 : 1.7}
            fill={active === "me" ? "currentColor" : "none"}
            fillOpacity={active === "me" ? 0.15 : 0}
          />
          <path
            d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
            stroke="currentColor"
            strokeWidth={active === "me" ? 2.2 : 1.7}
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontSize: 7,
            fontWeight: active === "me" ? 600 : 400,
            fontFamily: "system-ui",
          }}
        >
          Me
        </span>
      </div>
    </div>
  );
}

/* ─── Status bar (adapts to screen bg colour via `light` prop) ─── */
function StatusBar({ light }: { light?: boolean }) {
  const c = light ? "rgba(0,0,0,0.85)" : "#fff";
  return (
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingBottom: 6,
        paddingLeft: 18,
        paddingRight: 18,
        position: "relative",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <span
        className="mt-3"
        style={{
          color: c,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "SF Pro Display, system-ui, sans-serif",
          letterSpacing: 0.2,
        }}
      >
        9:41
      </span>
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 24,
          borderRadius: 18,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1.5px solid #2a2a2a",
          }}
        />
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#2a2a2a",
          }}
        />
      </div>
      {/* Status icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              style={{
                width: 2.5,
                height: h,
                borderRadius: 1,
                background:
                  i < 3
                    ? c
                    : `${c.replace(")", ", 0.3)").replace("rgba", "rgba").replace("#fff", "rgba(255,255,255,0.35)").replace("rgba(0,0,0,0.85)", "rgba(0,0,0,0.3)")}`,
              }}
            />
          ))}
        </div>
        <svg width="12" height="9" viewBox="0 0 13 10" fill="none">
          <path d="M6.5 7.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill={c} />
          <path
            d="M3.5 5.5C4.4 4.6 5.4 4 6.5 4s2.1.6 3 1.5"
            stroke={c}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M1 3C2.7 1.3 4.5.3 6.5.3S10.3 1.3 12 3"
            stroke={c}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div
            style={{
              width: 18,
              height: 9,
              borderRadius: 2.5,
              border: `1.5px solid ${light ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)"}`,
              padding: "1px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "75%",
                height: "100%",
                borderRadius: 1,
                background: "#4cd964",
              }}
            />
          </div>
          <div
            style={{
              width: 2,
              height: 4.5,
              borderRadius: "0 1px 1px 0",
              background: light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── iPhone 14 Pro Max shell ─── */
function IPhone14ProMax({
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
          "0 0 0 1px #3c3c3c, 0 0 0 2.5px #0a0a0a, inset 0 1px 0 rgba(255,255,255,0.08), 0 36px 80px rgba(0,0,0,0.55), 0 8px 20px rgba(0,0,0,0.35)",
        padding: "8px",
        flexShrink: 0,
      }}
    >
      {/* Power button */}
      <div
        style={{
          position: "absolute",
          right: -3,
          top: 112,
          width: 3,
          height: 54,
          borderRadius: "0 2px 2px 0",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
          boxShadow: "2px 0 4px rgba(0,0,0,0.5)",
        }}
      />
      {/* Volume up */}
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 100,
          width: 3,
          height: 40,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
          boxShadow: "-2px 0 4px rgba(0,0,0,0.5)",
        }}
      />
      {/* Volume down */}
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 150,
          width: 3,
          height: 40,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
          boxShadow: "-2px 0 4px rgba(0,0,0,0.5)",
        }}
      />
      {/* Silent switch */}
      <div
        style={{
          position: "absolute",
          left: -3,
          top: 70,
          width: 3,
          height: 20,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(180deg, #3c3c3c, #1e1e1e)",
          boxShadow: "-2px 0 4px rgba(0,0,0,0.5)",
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
        {children}
      </div>
    </div>
  );
}

/* ─── Feed Screen — mirrors the Shopi post card design ─── */
function FeedScreen() {
  return (
    <IPhone14ProMax screenBg="rgb(var(--color-bg))">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "rgb(var(--color-bg))",
        }}
      >
        {/* App header */}
        <div
          style={{
            padding: "6px 14px 6px",
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
          <div style={{ display: "flex", gap: 10 }}>
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(var(--color-text-muted))"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        {/* Scrollable feed */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Post card — Dhrohar bed sheet (mirrors screenshot) */}
          <div
            style={{
              background: "rgb(var(--color-bg-elevated))",
              borderBottom: "1px solid rgb(var(--color-border))",
            }}
          >
            {/* Seller header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px 6px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #c9a87c, #8b6b3d)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                🛏
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                  }}
                >
                  Dhrohar
                </div>
                <div
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 7 }}
                >
                  May 21 at 9:57 AM
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
            {/* Post image area */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                background:
                  "linear-gradient(160deg, #f5e6c8, #e8d5a3, #d4b896)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Bed illustration */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(45deg, rgba(180,130,70,0.08) 0px, rgba(180,130,70,0.08) 1px, transparent 1px, transparent 16px)",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 42, marginBottom: 4 }}>🛏️</div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 10,
                    padding: "6px 14px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    style={{
                      color: "#8b5e3c",
                      fontSize: 9,
                      fontWeight: 800,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    Designed For Your
                  </div>
                  <div
                    style={{
                      color: "#8b5e3c",
                      fontSize: 9,
                      fontWeight: 800,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    Better Sleep
                  </div>
                </div>
                {/* Price tags */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 8,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      borderRadius: 8,
                      padding: "3px 7px",
                      border: "1px solid rgba(180,130,70,0.3)",
                    }}
                  >
                    <div
                      style={{ color: "#8b5e3c", fontSize: 8, fontWeight: 700 }}
                    >
                      Dhrohar
                    </div>
                    <div
                      style={{
                        color: "rgb(var(--brand-primary))",
                        fontSize: 8,
                        fontWeight: 800,
                      }}
                    >
                      KSh 2,224
                    </div>
                    <div
                      style={{
                        color: "rgb(var(--color-text-muted))",
                        fontSize: 7,
                        textDecoration: "line-through",
                      }}
                    >
                      KSh 6,670
                    </div>
                    <div
                      style={{ color: "#10b981", fontSize: 7, fontWeight: 700 }}
                    >
                      67% OFF
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      borderRadius: 8,
                      padding: "3px 7px",
                      border: "1px solid rgba(180,130,70,0.3)",
                    }}
                  >
                    <div
                      style={{ color: "#8b5e3c", fontSize: 8, fontWeight: 700 }}
                    >
                      Pink Set
                    </div>
                    <div
                      style={{
                        color: "rgb(var(--brand-primary))",
                        fontSize: 8,
                        fontWeight: 800,
                      }}
                    >
                      KSh 2,224
                    </div>
                    <div
                      style={{
                        color: "rgb(var(--color-text-muted))",
                        fontSize: 7,
                        textDecoration: "line-through",
                      }}
                    >
                      KSh 6,670
                    </div>
                    <div
                      style={{ color: "#10b981", fontSize: 7, fontWeight: 700 }}
                    >
                      67% OFF
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Post footer */}
            <div style={{ padding: "7px 12px 8px" }}>
              <div
                style={{
                  color: "rgb(var(--color-text))",
                  fontSize: 8,
                  lineHeight: 1.5,
                  marginBottom: 4,
                }}
              >
                your bedroom just turned into a soft little spring dream.{" "}
                <span style={{ color: "rgb(var(--brand-primary))" }}>
                  #bedsheet #homedecor #DHROHAR
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 8 }}
                >
                  ❤️ 248
                </span>
                <span
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 8 }}
                >
                  💬 31
                </span>
                <span
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 8 }}
                >
                  ↗ Share
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10 }}>🔖</span>
              </div>
            </div>
          </div>

          {/* Second post card */}
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
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                📱
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  TechDeals_Nrb
                </div>
                <div
                  style={{ color: "rgb(var(--color-text-muted))", fontSize: 7 }}
                >
                  Nairobi • 1h ago
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
              style={{
                width: "100%",
                height: 80,
                background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 30 }}>📱</div>
              <div>
                <div style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>
                  iPhone 13 Pro
                </div>
                <div style={{ color: "#10b981", fontSize: 8, fontWeight: 800 }}>
                  KSh 42,000
                </div>
              </div>
            </div>
          </div>
        </div>

        <MockBottomNav active="home" />
      </div>
    </IPhone14ProMax>
  );
}

/* ─── DM Conversation Screen ─── */
function VideoScreen() {
  return (
    <IPhone14ProMax screenBg="rgb(var(--color-bg))">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "rgb(var(--color-bg))",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 12px 8px",
            borderBottom: "1px solid rgb(var(--color-border))",
            flexShrink: 0,
            background: "rgb(var(--color-bg-elevated))",
          }}
        >
          <span
            style={{
              color: "rgb(var(--color-text-muted))",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ←
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a87c, #8b6b3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
              position: "relative",
            }}
          >
            🛍️
            {/* Online dot */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                border: "1.5px solid rgb(var(--color-bg-elevated))",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "rgb(var(--color-text))",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "system-ui",
              }}
            >
              FashionHub_KE
            </div>
            <div style={{ color: "#22c55e", fontSize: 7.5, fontWeight: 500 }}>
              Online now
            </div>
          </div>
          {/* Product thumbnail pinned */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #f5e6c8, #c9a87c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              border: "1px solid rgb(var(--color-border))",
              flexShrink: 0,
            }}
          >
            🛏️
          </div>
        </div>

        {/* Shared product context card */}
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
              background: "linear-gradient(135deg, #f5e6c8, #e0c9a0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🛏️
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
              Floral Embroidery Bedsheet Set
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  color: "rgb(var(--brand-primary))",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                KSh 2,224
              </span>
              <span
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 7.5,
                  textDecoration: "line-through",
                }}
              >
                KSh 6,670
              </span>
              <span
                style={{
                  color: "#22c55e",
                  fontSize: 7,
                  fontWeight: 700,
                  background: "rgba(34,197,94,0.12)",
                  padding: "1px 5px",
                  borderRadius: 10,
                }}
              >
                67% OFF
              </span>
            </div>
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
            gap: 8,
          }}
        >
          {/* Seller — opening */}
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a87c, #8b6b3d)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
              }}
            >
              🛍️
            </div>
            <div style={{ maxWidth: "72%" }}>
              <div
                style={{
                  background: "rgb(var(--color-bg-subtle))",
                  borderRadius: "12px 12px 12px 3px",
                  padding: "7px 10px",
                  border: "1px solid rgb(var(--color-border))",
                }}
              >
                <p
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Hi! 👋 Thanks for your interest in the bedsheet set. Are you
                  asking about the cream or the pink version?
                </p>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  paddingLeft: 4,
                }}
              >
                9:42 AM
              </div>
            </div>
          </div>

          {/* Buyer */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "72%" }}>
              <div
                style={{
                  background: "rgb(var(--brand-primary))",
                  borderRadius: "12px 12px 3px 12px",
                  padding: "7px 10px",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Hi! The cream one please 🌸 Does it come in King size?
                </p>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  textAlign: "right",
                  paddingRight: 4,
                }}
              >
                9:43 AM ✓✓
              </div>
            </div>
          </div>

          {/* Seller */}
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a87c, #8b6b3d)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
              }}
            >
              🛍️
            </div>
            <div style={{ maxWidth: "72%" }}>
              <div
                style={{
                  background: "rgb(var(--color-bg-subtle))",
                  borderRadius: "12px 12px 12px 3px",
                  padding: "7px 10px",
                  border: "1px solid rgb(var(--color-border))",
                }}
              >
                <p
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Yes! King size available ✅ Includes 1 flat sheet + 2
                  pillowcases. Soft & breathable cotton 🌿
                </p>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  paddingLeft: 4,
                }}
              >
                9:44 AM
              </div>
            </div>
          </div>

          {/* Buyer */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "72%" }}>
              <div
                style={{
                  background: "rgb(var(--brand-primary))",
                  borderRadius: "12px 12px 3px 12px",
                  padding: "7px 10px",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Perfect! Can you do same-day delivery to Kilimani? 📦
                </p>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  textAlign: "right",
                  paddingRight: 4,
                }}
              >
                9:45 AM ✓✓
              </div>
            </div>
          </div>

          {/* Seller — with delivery confirm */}
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a87c, #8b6b3d)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
              }}
            >
              🛍️
            </div>
            <div style={{ maxWidth: "80%" }}>
              <div
                style={{
                  background: "rgb(var(--color-bg-subtle))",
                  borderRadius: "12px 12px 12px 3px",
                  padding: "7px 10px",
                  border: "1px solid rgb(var(--color-border))",
                }}
              >
                <p
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: "0 0 6px",
                  }}
                >
                  Absolutely! 🚚 Order before 2 PM and we deliver by 6 PM. Pay
                  on delivery accepted too!
                </p>
                {/* Delivery info card */}
                <div
                  style={{
                    background: "rgb(var(--color-bg-elevated))",
                    borderRadius: 8,
                    padding: "5px 8px",
                    border: "1px solid rgb(var(--color-border))",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14 }}>🚚</span>
                  <div>
                    <div
                      style={{
                        color: "rgb(var(--color-text))",
                        fontSize: 7.5,
                        fontWeight: 700,
                      }}
                    >
                      Same-day • Kilimani
                    </div>
                    <div
                      style={{ color: "#22c55e", fontSize: 7, fontWeight: 600 }}
                    >
                      Free delivery • Pay on delivery ✓
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  paddingLeft: 4,
                }}
              >
                9:46 AM
              </div>
            </div>
          </div>

          {/* Buyer — confirm order */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "72%" }}>
              <div
                style={{
                  background: "rgb(var(--brand-primary))",
                  borderRadius: "12px 12px 3px 12px",
                  padding: "7px 10px",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: 8.5,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Amazing, I&apos;ll take it! 🎉 Sending my address now
                </p>
              </div>
              <div
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: 6.5,
                  marginTop: 2,
                  textAlign: "right",
                  paddingRight: 4,
                }}
              >
                9:46 AM ✓✓
              </div>
            </div>
          </div>
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(var(--color-text-muted))"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <div
            style={{
              flex: 1,
              background: "rgb(var(--color-bg-subtle))",
              borderRadius: 20,
              padding: "1px 2px",
              border: "1px solid rgb(var(--color-border))",
            }}
          >
            <span
              style={{
                color: "rgb(var(--color-text-placeholder))",
                fontSize: 8,
              }}
            >
              Message FashionHub_KE...
            </span>
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
    </IPhone14ProMax>
  );
}

/* ─── Seller Profile Screen ─── */
function ProfileScreen() {
  return (
    <IPhone14ProMax screenBg="rgb(var(--color-bg))">
      <StatusBar light />
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
            height: 76,
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary) / 0.7), rgb(var(--brand-accent) / 0.6))",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 12,
              right: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 15,
                lineHeight: 1,
              }}
            >
              ←
            </span>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>
              Profile
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 17,
                lineHeight: 1,
              }}
            >
              ⋮
            </span>
          </div>
        </div>
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
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                border: "3px solid rgb(var(--color-bg))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🛍️
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <div
                style={{
                  background: "rgb(var(--color-bg-subtle))",
                  borderRadius: 20,
                  padding: "4px 10px",
                  border: "1px solid rgb(var(--color-border))",
                }}
              >
                <span
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 7.5,
                    fontWeight: 700,
                  }}
                >
                  Message
                </span>
              </div>
              <div
                style={{
                  background: "rgb(var(--brand-primary))",
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <span style={{ color: "#fff", fontSize: 7.5, fontWeight: 700 }}>
                  Follow
                </span>
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
              FashionHub_KE{" "}
              <span
                style={{ color: "rgb(var(--brand-primary))", fontSize: 10 }}
              >
                ✓
              </span>
            </div>
            <div
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: 7.5,
                marginTop: 2,
              }}
            >
              📍 Nairobi CBD · Westlands Mall
            </div>
            <div
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: 7.5,
                marginTop: 3,
                lineHeight: 1.5,
              }}
            >
              ✨ Fashion & Accessories · Daily drops 🔥
            </div>
          </div>
          {/* Stats row */}
          <div
            style={{
              display: "flex",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid rgb(var(--color-border))",
            }}
          >
            {[
              { n: "248", l: "Posts" },
              { n: "18.4K", l: "Followers" },
              { n: "4.9★", l: "Rating" },
            ].map(({ n, l }) => (
              <div key={l} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    color: "rgb(var(--color-text))",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: 7.5,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
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
          {[
            {
              bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
              emoji: "👗",
              price: "KSh 1,200",
            },
            {
              bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              emoji: "👟",
              price: "KSh 2,800",
              video: true,
            },
            {
              bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              emoji: "👜",
              price: "KSh 950",
            },
            {
              bg: "linear-gradient(135deg, #fee2e2, #fecaca)",
              emoji: "🧢",
              price: "KSh 600",
            },
            {
              bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
              emoji: "⌚",
              price: "KSh 4,500",
            },
            {
              bg: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
              emoji: "💍",
              price: "KSh 780",
            },
          ].map(({ bg, emoji, price, video }, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                position: "relative",
              }}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <div
                style={{
                  color: "#333",
                  fontSize: 6.5,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.7)",
                  padding: "2px 5px",
                  borderRadius: 5,
                }}
              >
                {price}
              </div>
              {video && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgb(var(--brand-primary))",
                    borderRadius: 4,
                    padding: "1px 4px",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 6, fontWeight: 700 }}>
                    ▶
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <MockBottomNav active="me" />
      </div>
    </IPhone14ProMax>
  );
}
