import Image from "next/image";
import { cn } from "@/lib/utils";
import { TEAM_DISPLAY_NAME } from "../types";

/** The Shopi logo, used wherever the Shopi team is the sender. */
export function TeamAvatar({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-primary/10", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/assets/shopi-logo.png"
        alt={TEAM_DISPLAY_NAME}
        fill
        className="object-contain p-1.5"
        sizes={`${size}px`}
      />
    </div>
  );
}
