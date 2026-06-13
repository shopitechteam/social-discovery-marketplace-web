"use client";

import { useMemo } from "react";

/**
 * Full-bleed celebration overlay: theme-colored confetti "rain" falling from the
 * top + a centered success card with a pop-in checkmark and burst ring. Pure CSS
 * (no deps). Colors come from the app's brand/accent theme tokens.
 */

const CONFETTI_COLORS = [
  "rgb(var(--brand-primary))",
  "rgb(var(--brand-secondary))",
  "rgb(var(--brand-accent))",
  "rgb(var(--color-success))",
  "rgb(var(--color-warning))",
];

const PIECE_COUNT = 70;

interface Piece {
  left: number; // %
  delay: number; // s
  duration: number; // s
  size: number; // px
  color: string;
  rounded: boolean;
  drift: number; // px horizontal sway
  rotate: number; // deg
}

function buildPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const rand = (seed: number) => {
      const x = Math.sin(seed * 99.13 + i * 17.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      left: rand(1) * 100,
      delay: rand(2) * 2.2,
      duration: 2.6 + rand(3) * 2.2,
      size: 6 + Math.floor(rand(4) * 8),
      color: CONFETTI_COLORS[Math.floor(rand(5) * CONFETTI_COLORS.length)],
      rounded: rand(6) > 0.5,
      drift: (rand(7) - 0.5) * 120,
      rotate: rand(8) * 720 - 360,
    };
  });
}

export function Celebration({ children }: { children: React.ReactNode }) {
  const pieces = useMemo(() => buildPieces(), []);

  return (
    <div className="celebration-root">
      {/* Confetti rain */}
      <div className="confetti-layer" aria-hidden>
        {pieces.map((p, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.rounded ? p.size : p.size * 0.5,
                backgroundColor: p.color,
                borderRadius: p.rounded ? "50%" : "2px",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--drift": `${p.drift}px`,
                "--rotate": `${p.rotate}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Centered content */}
      <div className="celebration-content">{children}</div>

      <style jsx>{`
        .celebration-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confetti-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .confetti-piece {
          position: absolute;
          top: -24px;
          opacity: 0;
          will-change: transform, opacity;
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
          animation-iteration-count: infinite;
        }
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), 105vh, 0) rotate(var(--rotate));
            opacity: 1;
          }
        }
        .celebration-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

/** The animated success badge — burst ring + pop-in checkmark. */
export function SuccessBadge() {
  return (
    <div className="badge-wrap">
      <span className="burst-ring" aria-hidden />
      <div className="badge">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-path"
          />
        </svg>
      </div>

      <style jsx>{`
        .badge-wrap {
          position: relative;
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgb(var(--brand-primary)),
            rgb(var(--brand-secondary))
          );
          box-shadow: 0 10px 36px rgb(var(--brand-primary) / 0.45);
          transform: scale(0);
          animation: badge-pop 0.55s cubic-bezier(0.17, 0.89, 0.32, 1.28)
            forwards;
        }
        .burst-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid rgb(var(--brand-primary) / 0.5);
          transform: scale(0.7);
          opacity: 0.8;
          animation: burst 0.8s ease-out 0.2s forwards;
        }
        .check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: check-draw 0.4s ease-out 0.45s forwards;
        }
        @keyframes badge-pop {
          0% {
            transform: scale(0);
          }
          70% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes burst {
          0% {
            transform: scale(0.7);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @keyframes check-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
