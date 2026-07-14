// Static, server-safe — no "use client"

import Image from "next/image";
import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Send,
} from "lucide-react";

export const landingPhotos = {
  sofa:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=82",
  phone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&crop=center&w=1000&h=140&q=70",
  produce:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=82",
  fashion:
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=82",
  car:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=82",
};

function PhotoTile({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      quality={55}
      sizes="(max-width: 768px) 84vw, 360px"
      className={`object-cover ${className}`}
    />
  );
}

export function FeedMockup() {
  return (
    <div aria-hidden className="w-full max-w-90 select-none">
      <div className="overflow-hidden rounded-2xl border border-default bg-elevated shadow-md">
        {/* Media */}
        <div className="relative aspect-4/3 overflow-hidden">
          <PhotoTile
            src={landingPhotos.sofa}
            alt="Brown leather sofa in a bright living room"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold tracking-normal text-white tabular-nums">
            KES 45,000
          </span>
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white tabular-nums">
            0:14
          </span>
        </div>
        {/* Seller + title */}
        <div className="flex flex-col gap-2 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              W
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-default">
                Wanjiku M.
              </p>
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin size={11} /> Ongata Rongai · 2h
              </p>
            </div>
          </div>
          <p className="text-sm text-default">
            3-seater leather sofa, barely used. Pickup this weekend.
          </p>
          <div className="mt-0.5 flex items-center gap-4 text-muted">
            <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
              <Heart size={15} /> 214
            </span>
            <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
              <MessageCircle size={15} /> 12
            </span>
            <span className="ml-auto flex items-center">
              <Bookmark size={15} />
            </span>
          </div>
        </div>
      </div>
      {/* Next post peeking — the scroll */}
      <div className="mx-3 h-9 rounded-t-2xl border border-b-0 border-default bg-elevated opacity-60">
        <div className="relative h-full overflow-hidden rounded-t-2xl">
          <PhotoTile
            src={landingPhotos.phone}
            alt="Smartphone product listing preview"
          />
        </div>
      </div>
    </div>
  );
}

export function ChatMockup() {
  return (
    <div
      aria-hidden
      className="w-full max-w-90 select-none overflow-hidden rounded-2xl border border-default bg-elevated shadow-md"
    >
      {/* Header — who + what the chat is about */}
      <div className="flex items-center gap-2.5 border-b border-default px-3.5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
          W
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold text-default">Wanjiku M.</p>
          <p className="truncate text-xs text-muted tabular-nums">
            Leather sofa · KES 45,000
          </p>
        </div>
      </div>
      {/* Thread */}
      <div className="flex flex-col gap-2 px-3.5 py-4">
        <p className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-subtle px-3.5 py-2 text-sm text-default">
          Is the sofa still available?
        </p>
        <p className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-white">
          Yes. I can do 42,000 if you pick it up in Rongai.
        </p>
        <p className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-subtle px-3.5 py-2 text-sm text-default">
          Deal. Saturday morning?
        </p>
      </div>
      {/* Composer */}
      <div className="flex items-center gap-2 px-3.5 pb-3.5">
        <span className="flex-1 rounded-full border border-default px-3.5 py-2 text-sm text-placeholder">
          Message…
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Send size={15} />
        </span>
      </div>
    </div>
  );
}

export function SellMockup() {
  return (
    <div
      aria-hidden
      className="w-full max-w-90 select-none overflow-hidden rounded-2xl border border-default bg-elevated shadow-md"
    >
      <div className="border-b border-default px-3.5 py-3">
        <p className="text-sm font-semibold text-default">New post</p>
      </div>
      <div className="flex flex-col gap-3 p-3.5">
        {/* Media tiles */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <PhotoTile
              src={landingPhotos.sofa}
              alt="Sofa photo selected for a seller post"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
              0:14
            </span>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <PhotoTile
              src={landingPhotos.produce}
              alt="Fresh produce photo selected for a seller post"
            />
          </div>
          <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-default text-muted">
            <Plus size={18} />
          </div>
        </div>
        {/* Fields */}
        <div className="rounded-xl bg-subtle px-3.5 py-2.5 text-sm text-default">
          3-seater leather sofa
        </div>
        <div className="rounded-xl bg-subtle px-3.5 py-2.5 text-sm font-semibold text-default tabular-nums">
          KES 45,000
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-subtle px-3.5 py-2.5 text-sm text-default">
          <MapPin size={14} className="text-muted" /> Ongata Rongai
        </div>
        <div className="mt-0.5 rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white">
          Post to the feed
        </div>
      </div>
    </div>
  );
}
