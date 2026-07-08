"use client";

import { useEffect } from "react";
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
  className = "aspect-[9/16]",
  sizes = "240px",
}: {
  embed: TiktokEmbed;
  /** Sizing/aspect classes — default is a 9:16 portrait box. */
  className?: string;
  sizes?: string;
}) {
  useEffect(() => {
    void ensureTikTokVideoElement();
  }, []);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
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
      />
    </div>
  );
}
