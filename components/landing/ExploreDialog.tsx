"use client";

import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/app/shopi";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.shopi";

export function ExploreDialog({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("Please enter a valid Kenyan phone number.");
      return;
    }
    setError("");
    setSending(true);

    const fullNumber = `254${digits.replace(/^0/, "")}`;
    const message = encodeURIComponent(
      `Hey! Here are the Shopi app download links 📱\n\niOS: ${APP_STORE_URL}\nAndroid: ${PLAY_STORE_URL}\n\nDiscover what's selling near you 🛍️`,
    );
    window.open(`https://wa.me/${fullNumber}?text=${message}`, "_blank");
    setSending(false);
    setSent(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Explore Shopi"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 20,
          background: "rgb(var(--color-bg-elevated))",
          border: "1px solid rgb(var(--color-border))",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          animation: "slideUp 0.22s ease",
          overflow: "hidden",
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)), rgb(var(--brand-secondary)))",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "1.5rem 1.5rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            📱
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-subtle))",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              color: "rgb(var(--color-text-muted))",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "rgb(var(--color-text))",
              marginBottom: "0.5rem",
              lineHeight: 1.2,
            }}
          >
            Built for your phone — by design.
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgb(var(--color-text-muted))",
              lineHeight: 1.65,
              marginBottom: "1.5rem",
            }}
          >
            Scrolling a live feed, messaging sellers, and discovering products
            nearby is a hands-on experience — the kind that just works better on
            mobile.{" "}
            <b className="inline-flex">
              Open this page on your phone to jump straight into the web app,
            </b>
            or download the native app for the full experience.
          </p>

          {/* App store buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.875rem 1.25rem",
                borderRadius: 14,
                background: "rgb(var(--color-text))",
                color: "rgb(var(--color-bg))",
                textDecoration: "none",
                fontWeight: 600,
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {/* Apple icon */}
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
              </svg>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                  Download on the
                </div>
                <div style={{ fontSize: "1rem" }}>App Store</div>
              </div>
            </a>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.875rem 1.25rem",
                borderRadius: 14,
                background: "rgb(var(--color-bg-subtle))",
                color: "rgb(var(--color-text))",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid rgb(var(--color-border))",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgb(var(--color-border-strong))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgb(var(--color-border))")
              }
            >
              {/* Google Play icon */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3.18 23.76c.36.2.78.22 1.16.06L15.86 12 12.1 8.24 3.18 23.76Z"
                  fill="#EA4335"
                />
                <path
                  d="M20.54 10.27 17.3 8.45l-3.76 3.55 3.76 3.55 3.27-1.85c.93-.53.93-1.9-.03-2.43Z"
                  fill="#FBBC05"
                />
                <path
                  d="M3.18.24C2.82.48 2.58.9 2.58 1.42v21.16L12.1 12 3.18.24Z"
                  fill="#4285F4"
                />
                <path
                  d="M3.18 23.76 12.1 12 17.3 15.55l-12.96 8.27c-.4.25-.84.27-1.16-.06Z"
                  fill="#34A853"
                />
              </svg>
              <div style={{ lineHeight: 1.3 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  Get it on
                </div>
                <div style={{ fontSize: "1rem" }}>Google Play</div>
              </div>
            </a>
          </div>

          {/* Divider with label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgb(var(--color-border))",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgb(var(--color-text-muted))",
                whiteSpace: "nowrap",
              }}
            >
              Send link to your phone via WhatsApp
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgb(var(--color-border))",
              }}
            />
          </div>

          {/* WhatsApp send section */}
          {!sent ? (
            <form onSubmit={handleSend}>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgb(var(--color-text-muted))",
                  marginBottom: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                Enter your phone number and we&apos;ll open WhatsApp with the
                download links pre-filled — ready to send to yourself.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  borderRadius: 12,
                  border: error
                    ? "1.5px solid #ef4444"
                    : "1.5px solid rgb(var(--color-border))",
                  overflow: "hidden",
                  background: "rgb(var(--color-bg-subtle))",
                  transition: "border-color 0.15s ease",
                }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgb(var(--brand-primary))";
                }}
                onBlurCapture={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = error
                    ? "#ef4444"
                    : "rgb(var(--color-border))";
                }}
              >
                {/* Country code prefix */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0 0.875rem",
                    borderRight: "1px solid rgb(var(--color-border))",
                    background: "rgb(var(--color-bg-elevated))",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>🇰🇪</span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "rgb(var(--color-text))",
                      letterSpacing: "0.02em",
                    }}
                  >
                    +254
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.875rem 1rem",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "0.95rem",
                    color: "rgb(var(--color-text))",
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: "0.875rem 1.1rem",
                    background: "#25D366",
                    border: "none",
                    cursor: sending ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    flexShrink: 0,
                    opacity: sending ? 0.7 : 1,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {/* WhatsApp icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                    }}
                  >
                    Send
                  </span>
                </button>
              </div>
              {error && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#ef4444",
                    marginTop: "0.5rem",
                  }}
                >
                  {error}
                </p>
              )}
            </form>
          ) : (
            <div
              style={{
                padding: "1.25rem",
                borderRadius: 12,
                background: "rgba(37,211,102,0.1)",
                border: "1px solid rgba(37,211,102,0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>
                ✅
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.25rem",
                }}
              >
                WhatsApp opened!
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                Just hit send in WhatsApp to deliver the links to your phone.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        input::placeholder { color: rgb(var(--color-text-placeholder)); }
      `}</style>
    </div>
  );
}
