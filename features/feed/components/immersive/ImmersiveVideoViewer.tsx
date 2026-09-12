"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { useApolloClient } from "@apollo/client/react";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { resumeVideoElection, suspendVideoElection } from "@/lib/activeVideo";
import { invalidateVideoFeedCache } from "@/lib/apollo/feedCache";
import { videoPath } from "@/lib/content-url";
import { useAppBack } from "@/lib/useAppBack";
import { VIDEO_FEED_PREFETCH_AHEAD } from "@/features/feed/constants";
import { useVideoFeed } from "../../hooks/useVideoFeed";
import { useSnapPager } from "../../hooks/useSnapPager";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useInteractions } from "../../hooks/useInteractions";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useFollow } from "../../hooks/useFollow";
import { ImmersiveSlide, type SlideState } from "./ImmersiveSlide";
import { ImmersiveActions } from "./ImmersiveActions";
import { ImmersiveMeta } from "./ImmersiveMeta";
import { BufferSpinner } from "../BufferSpinner";
import { posterOf } from "../../lib/videoSource";
import { hasImmersiveHandoff } from "../../lib/immersiveHandoff";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";
import {
  onVideoPrefetchChange,
  videoPrefetchAllowed,
} from "../../lib/videoPrefetch";

const CommentsDrawer = dynamic(() =>
  import("../CommentsDrawer").then((mod) => mod.CommentsDrawer),
);

/** Slides within this distance of the active one keep a poster and chrome. */
const NEAR_WINDOW = 1;
/** How long after the index settles before the URL is rewritten. */
const URL_DEBOUNCE_MS = 150;

interface Props {
  /**
   * The tapped video's URL segment — a slug, though the API resolves an id or
   * a `title-id` form just as well. Initial value only, see the URL note below.
   */
  seed: string;
  lang: string;
}

export function ImmersiveVideoViewer({ seed: seedProp, lang }: Props) {
  const client = useApolloClient();

  // Frozen on purpose. Swiping rewrites the address bar with replaceState,
  // which Next never sees, so the route segment keeps rendering the original
  // slug. Treating the prop as live would re-key the query on every swipe.
  const [seed] = useState(() => seedProp);

  const { items, loading, loadingMore, hasMore, loadMore } = useVideoFeed(seed);
  const [commentsOpen, setCommentsOpen] = useState(false);
  // ssrDefault:false keeps the first paint mobile-first, matching how the
  // feed page decides its own layout.
  const desktop = useIsDesktop({ ssrDefault: false }) === true;

  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // Mirrored into a ref so the settle callback can stay referentially stable —
  // it is handed to useSnapPager, and a new identity per page would re-run the
  // pager's effects mid-scroll.
  const paginationRef = useRef({ hasMore, loadingMore, count: items.length });
  useEffect(() => {
    paginationRef.current = { hasMore, loadingMore, count: items.length };
  }, [hasMore, loadingMore, items.length]);

  // Pagination is index arithmetic, not a sentinel. With one slide per
  // viewport a "within 400px" sentinel only fires once the user is already on
  // the last slide, which is a wall rather than a prefetch.
  const handleSettle = useCallback((index: number) => {
    const { hasMore: more, loadingMore: busy, count } = paginationRef.current;
    if (more && !busy && count - index <= VIDEO_FEED_PREFETCH_AHEAD) {
      loadMoreRef.current();
    }
  }, []);

  const { scrollerRef, scrollerEl, index, goTo, handleScroll } = useSnapPager({
    count: items.length,
    onSettle: handleSettle,
  });

  const activePost = items[index];

  // ── Sound, for the whole viewer ──────────────────────────────────────────
  // One decision shared by every slide, and resolved in this initialiser so it
  // is already true on the first paint. Doing it in an effect was the bug the
  // user hit: the opened slide mounted muted, the unmute arrived a tick later,
  // and the browser was free to refuse it — so the video you tapped played
  // silent while the ones you swiped to (which mounted with sound already on)
  // played correctly.
  //
  // Tapping a card is user activation, and opening a video full-screen is a
  // request to watch it, so sound goes on. A cold load from a shared link has
  // no activation and no baton, so it honours the stored preference instead —
  // an unmuted autoplay there would be refused anyway.
  const setVideoMuted = useFeedPreferencesStore((s) => s.setVideoMuted);
  const [muted, setMuted] = useState(() =>
    hasImmersiveHandoff()
      ? false
      : useFeedPreferencesStore.getState().videoMuted,
  );

  // Mirror it into the shared preference so the feed behind and the next
  // session agree with what the viewer is doing — the same thing the mute
  // button already did before sound moved up here.
  useEffect(() => {
    setVideoMuted(muted);
  }, [muted, setVideoMuted]);

  const toggleMuted = useCallback(() => setMuted((value) => !value), []);

  // ── Take over playback from the feed still mounted behind us ─────────────
  // The card's click handler already suspended once, synchronously, so the
  // outgoing element was paused before the route changed. This second claim
  // covers the cold-load path (a shared link) and is released on unmount.
  useEffect(() => {
    suspendVideoElection();
    return () => resumeVideoElection();
  }, []);

  // Per-seed cache entries would otherwise pile up, one list per tap, for the
  // life of the session. gc is reference-aware, so the Content entities the
  // feed still points at survive.
  useEffect(
    () => () => {
      invalidateVideoFeedCache(client.cache);
    },
    [client],
  );

  // ── URL follows the swipe, without a navigation ──────────────────────────
  // Writes the canonical slug path, the same one the feed card pushes and the
  // route treats as canonical, so copying the address bar mid-swipe yields a
  // shareable, indexable link rather than an id that would only redirect.
  const nextPath = activePost ? videoPath(lang, activePost) : null;
  const lastWrittenPath = useRef<string | null>(null);
  useEffect(() => {
    if (!nextPath || nextPath === lastWrittenPath.current) return;

    const timer = setTimeout(() => {
      lastWrittenPath.current = nextPath;
      try {
        // history.state carries Next's route tree. Replacing it with null
        // breaks back, forward and the interception, so pass it through.
        // Debounced because Safari throttles replaceState and throws past it.
        window.history.replaceState(window.history.state, "", nextPath);
      } catch {
        // Throttled by the browser — the address bar lags, nothing else breaks.
      }
    }, URL_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [nextPath]);

  // A shared video link is the common way into this screen, and that arrival
  // has no app history behind it — a plain back() would do nothing at all and
  // trap the viewer open. Fall through to the feed instead.
  const close = useAppBack(`/${lang}/feed`);

  // ── Keyboard (desktop) ───────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // The rail holds a comment composer; never steal its keys.
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          goTo(index + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          goTo(index - 1);
          break;
        case "Escape":
          close();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, close]);

  // ── Mouse wheel (desktop only) ───────────────────────────────────────────
  // Desktop video paging is intentionally button/key driven. Wheel gestures
  // vary wildly across mice and trackpads, so swallowing them over the video
  // keeps the viewer from skipping or flickering. The comments rail is allowed
  // to keep its own normal wheel scrolling.
  useEffect(() => {
    // Keyed on the element, not [], because the scroller does not exist on the
    // first commit — the viewer renders a loading tree until the feed lands.
    if (!scrollerEl) return;
    // Touch devices already get correct native snap; never intercept there.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-immersive-rail]")
      ) {
        return;
      }
      if (Math.abs(event.deltaY) < 4) return;
      event.preventDefault();
    };

    scrollerEl.addEventListener("wheel", onWheel, { passive: false });
    return () => scrollerEl.removeEventListener("wheel", onWheel);
  }, [scrollerEl]);

  // Warm only the next poster. Anything more and the decoded-bitmap cost grows
  // without making the next slide meaningfully faster.
  useEffect(() => {
    const next = items[index + 1];
    if (!next) return;
    const src = posterOf(next);
    if (!src) return;
    const img = new window.Image();
    img.src = src;
  }, [items, index]);

  // ── Warm the next stream ─────────────────────────────────────────────────
  // Resolved after mount, and re-resolved when the connection changes, so a
  // viewer left open while the user loses signal stops prefetching. Starts
  // false because the check reads navigator, which does not exist on the
  // server.
  const [prefetchAllowed, setPrefetchAllowed] = useState(false);
  useEffect(() => {
    const sync = () => setPrefetchAllowed(videoPrefetchAllowed());
    sync();
    return onVideoPrefetchChange(sync);
  }, []);

  const slideStates = useMemo(
    () =>
      items.map((_, i): SlideState => {
        if (i === index) return "active";
        return Math.abs(i - index) <= NEAR_WINDOW ? "near" : "far";
      }),
    [items, index],
  );

  // Exactly one slide ahead. Two would double the idle bandwidth for a slide
  // the user is unlikely to reach before it needs rebuffering anyway, and the
  // slide behind is already warm from having been played.
  const prefetchIndex = prefetchAllowed ? index + 1 : -1;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <BufferSpinner />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      // The header row's vertical position, published once here so the mute
      // button — which lives inside the slide, a different component — can
      // sit on exactly the same line as the back button without the two
      // drifting apart.
      style={
        {
          "--immersive-top": "max(env(safe-area-inset-top, 0px), 16px)",
          // Bottom counterpart, published for the same reason: the progress
          // bar lives in the slide and the overlay's padding is set here, and
          // both have to clear the iPhone home indicator by the same amount or
          // the scrubber ends up under it.
          "--immersive-bottom": "max(env(safe-area-inset-bottom, 0px), 16px)",
          // Rail width, shared with the slide's grid so the paging chevrons
          // land over the video column instead of on top of the rail.
          "--immersive-rail": "400px",
        } as CSSProperties
      }
    >
      <button
        type="button"
        onClick={close}
        aria-label="Back"
        className="absolute left-4 top-[var(--immersive-top)] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm active:scale-95"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scroll-indicator h-full w-full overflow-y-auto overscroll-y-contain"
        style={{
          // `contain`, not `none`: the rubber-band is what makes it feel
          // native, but chaining into the feed mounted behind would destroy
          // the scroll position we restore on close.
          scrollSnapType: commentsOpen ? "none" : "y mandatory",
          overflowY: commentsOpen ? "hidden" : "auto",
        }}
      >
        {items.map((post, i) => (
          <section
            key={post.id}
            data-index={i}
            // h-full, not 100svh: inside a fixed inset-0 parent both resize
            // together when the iOS toolbar collapses, so a slide is always
            // exactly one container height and never leaves the next one
            // peeking.
            className="relative h-full w-full"
            style={{
              scrollSnapAlign: "start",
              // Without `always`, a hard fling skips several videos.
              scrollSnapStop: "always",
            }}
          >
            <SlideContainer
              post={post}
              state={slideStates[i]}
              prefetch={i === prefetchIndex}
              muted={muted}
              onToggleMuted={toggleMuted}
              lang={lang}
              desktop={desktop}
              onOpenComments={() => setCommentsOpen(true)}
              onRequestNext={() => goTo(i + 1)}
            />
          </section>
        ))}

        {/* Every child of a mandatory snap container must be a full-height
            snap target. The pagination spinner used to live here as a 96px
            box with no snap-align, appearing mid-fling exactly when a page
            was requested — it inserted an unsnappable gap and let a hard
            flick sail past several videos. It is an overlay now, outside the
            scroller entirely. */}
        {!hasMore && items.length > 0 && (
          <section
            className="flex h-full w-full items-center justify-center bg-black"
            style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            <p className="text-sm text-white/60">No more videos</p>
          </section>
        )}
      </div>

      {loadingMore && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <BufferSpinner />
        </div>
      )}

      {/* Desktop paging chevrons */}
      {/* Paging chevrons, inset past the rail so they stay over the video —
          they are light-on-dark and would vanish against the themed panel.
          Rendered on the same `desktop` flag as the rail so the two can never
          disagree about whether that column exists. */}
      {desktop && (
        <div
          className="absolute top-1/2 z-40 flex -translate-y-1/2 flex-col gap-4"
          style={{ right: "calc(var(--immersive-rail) + 2rem)" }}
        >
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous video"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/18 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[background-color,transform,opacity] hover:scale-105 hover:bg-white/28 active:scale-95 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronUp className="h-7 w-7" strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index >= items.length - 1}
            aria-label="Next video"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/18 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[background-color,transform,opacity] hover:scale-105 hover:bg-white/28 active:scale-95 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronDown className="h-7 w-7" strokeWidth={2.6} />
          </button>
        </div>
      )}

      {/* Mobile comments, portalled above the viewer so the video stays visible
          and playing behind it — the arrangement people expect from TikTok. */}
      {commentsOpen &&
        activePost &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[110] md:hidden">
            <CommentsDrawer
              contentId={activePost.id}
              contentCreatorId={activePost.creatorId}
              lang={lang}
              open
              // The viewer owns the viewport already; locking the body would
              // only reflow the large feed still mounted behind it.
              lockBody={false}
              onClose={() => setCommentsOpen(false)}
              onOpenChange={setCommentsOpen}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * One slide's interactive state.
 *
 * Split out so each post owns its own like/save/follow hooks. Hoisting them
 * into the viewer would mean one set of hooks reused across every slide, and
 * the counts would lag a swipe behind.
 */
function SlideContainer({
  post,
  state,
  prefetch,
  muted,
  onToggleMuted,
  lang,
  desktop,
  onOpenComments,
  onRequestNext,
}: {
  post: ContentCardFieldsFragment;
  state: SlideState;
  prefetch: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  lang: string;
  desktop: boolean;
  onOpenComments: () => void;
  onRequestNext: () => void;
}) {
  const router = useRouter();
  const { requireAuth } = useAuthGuard(lang);
  const {
    liked,
    likeCount,
    handleLike,
    saved,
    handleSave,
    handleShare,
    fireView,
  } = useInteractions(post, { requireAuth });

  // Straight to the conversation for this listing. `source=content` tells the
  // messaging screen to create-or-reuse the thread in place, so it never
  // flashes the inbox list — the same contract the feed card and the product
  // page both use.
  const openContact = useCallback(() => {
    if (!requireAuth({ contentId: post.id })) return;
    router.push(`/${lang}/notifications/${post.id}?source=content`);
  }, [requireAuth, router, lang, post.id]);

  const { following, toggle: handleFollow } = useFollow({
    userId: post.creator?.id ?? post.creatorId,
    initialFollowing: post.creator?.isFollowedByMe ?? false,
    initialFollowerCount: post.creator?.followerCount ?? 0,
    lang,
  });

  // Becoming active is a view. This feeds the seen-decay term in the server's
  // ranking, so swiping past a video de-prioritises it next session.
  const fireViewRef = useRef(fireView);
  useEffect(() => {
    fireViewRef.current = fireView;
  }, [fireView]);
  useEffect(() => {
    if (state !== "active") return;
    fireViewRef.current();
  }, [state, post.id]);

  if (state === "far") {
    return <div className="h-full w-full bg-black" aria-hidden />;
  }

  const actions = (
    <ImmersiveActions
      liked={liked}
      likeCount={likeCount}
      onLike={handleLike}
      saved={saved}
      onSave={handleSave}
      commentCount={post.stats?.comments ?? 0}
      onComment={onOpenComments}
      onShare={handleShare}
      orientation="column"
      tone="overlay"
    />
  );

  return (
    <ImmersiveSlide
      post={post}
      state={state}
      prefetch={prefetch}
      muted={muted}
      onToggleMuted={onToggleMuted}
      onRequestNext={onRequestNext}
      // Mobile only — ImmersiveSlide renders this subtree under `md:hidden`.
      // The rail takes over on desktop, where the comments panel already
      // carries the composer and a full-width button would be wrong.
      overlay={
        <div className="flex h-full w-full flex-col justify-end gap-3 p-4 pb-[calc(var(--immersive-bottom)+2.25rem)]">
          {/* Action rail sits above the text block rather than beside it, so
              the meta below can use the full width for the price and the
              action button. No pointer-events-auto on the wrappers:
              ImmersiveMeta and ImmersiveActions opt their own interactive
              children in, leaving the rest of the frame tappable for
              play/pause. */}
          <div className="flex justify-end">{actions}</div>

          <ImmersiveMeta
            post={post}
            lang={lang}
            variant="overlay"
            following={following}
            onFollow={handleFollow}
            cta={
              // Hidden on your own listing — there is nobody to contact.
              post.isMyContent ? null : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openContact();
                  }}
                  className="pointer-events-auto mt-0.5 mb-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[0.8rem] font-bold text-white transition-transform active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
                  {/* Deliberately not "Chat to Buy". Half this marketplace is
                      not a purchase in that sense — a shamba, a plot, a rental,
                      a service, a quote — and a buy-now label misreads all of
                      them. "Contact seller" is the one phrase that fits every
                      listing type, and it matches the feed card's button. */}
                  Contact seller
                </button>
              )
            }
          />
        </div>
      }
      // Gated on a real media query, not `hidden md:block`. CSS still mounts
      // the subtree and runs its comment query; on a phone that is a wasted
      // round trip per slide for a panel nobody can see.
      rail={
        desktop ? (
          <div
            data-immersive-rail
            className="flex h-full min-h-0 flex-col overflow-hidden"
          >
            <div className="shrink-0 border-b border-default p-4">
              <ImmersiveMeta
                post={post}
                lang={lang}
                variant="rail"
                following={following}
                onFollow={handleFollow}
              />
              <div className="mt-4">
                <ImmersiveActions
                  liked={liked}
                  likeCount={likeCount}
                  onLike={handleLike}
                  saved={saved}
                  onSave={handleSave}
                  commentCount={post.stats?.comments ?? 0}
                  onComment={onOpenComments}
                  onShare={handleShare}
                  orientation="row"
                  tone="surface"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {state === "active" && (
                <CommentsDrawer
                  contentId={post.id}
                  contentCreatorId={post.creatorId}
                  lang={lang}
                  open
                  desktopInline
                  onClose={() => {}}
                />
              )}
            </div>
          </div>
        ) : null
      }
    />
  );
}
