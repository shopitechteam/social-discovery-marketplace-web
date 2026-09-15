"use client";

import { useState } from "react";
import Image from "next/image";
import { shouldUnoptimize } from "@/lib/imageUtils";

/**
 * Avatar photo that falls back to the seller's initials if it fails to load.
 *
 * Google profile photos (lh3.googleusercontent.com) — what most sellers who
 * sign in with Google have — intermittently refuse hotlinked requests in the
 * browser even though the URL is valid. Without a fallback the circle shows
 * the image's alt text cut off ("Dayte…"). next/image re-fires errors that
 * happened before hydration, so a failure during page load is caught too.
 */
export function SellerAvatarImage({
  src,
  alt,
  size,
  initials,
}: {
  src: string;
  alt: string;
  size: number;
  initials: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <span aria-hidden>{initials}</span>;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={`${size}px`}
      unoptimized={shouldUnoptimize(src)}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
