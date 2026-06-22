"use client";

import { useEffect, type CSSProperties } from "react";
import Image from "next/image";
import type { TiktokEmbed } from "@/stores/create";

let registerPromise: Promise<unknown> | null = null;

function ensureTikTokVideoElement(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!registerPromise) {
    registerPromise = import("tiktok-video-element");
  }
  return registerPromise;
}

export function TikTokCreatePreview({
  embed,
  className,
  style,
  sizes = "240px",
}: {
  embed: TiktokEmbed;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
}) {
  useEffect(() => {
    void ensureTikTokVideoElement();
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-black ${className ?? ""}`}
      style={{ aspectRatio: "9 / 16", ...style }}
    >
      {embed.coverImageUrl && (
        <Image
          src={embed.coverImageUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
      <tiktok-video
        src={embed.shareUrl}
        autoplay
        muted
        loop
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
