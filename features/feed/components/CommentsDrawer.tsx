"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { X } from "lucide-react";
import {
  GetCommentsDocument,
  AddCommentDocument,
  ToggleCommentLikeDocument,
  GetRepliesDocument,
} from "@/types/__generated__/graphql";
import type { GetCommentsQuery, GetRepliesQuery } from "@/types/__generated__/graphql";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useVisualViewport } from "@/hooks/useKeyboardInset";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

type CommentItem = NonNullable<GetCommentsQuery["comments"]["items"]>[number];
type ReplyItem = NonNullable<GetRepliesQuery["replies"]>[number];

interface Props {
  contentId: string;
  /** The userId of the content's creator — used to label their comments "Creator" */
  contentCreatorId?: string;
  onClose: () => void;
  onCommentAdded?: () => void;
  desktopInline?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(raw: unknown): string {
  if (!raw) return "";
  const diff = Date.now() - new Date(raw as string).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function getInitials(c: { creatorId: string; author?: { profile?: { firstName?: string | null; lastName?: string | null } | null } | null }): string {
  const f = c.author?.profile?.firstName;
  const l = c.author?.profile?.lastName;
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return c.creatorId.slice(-2).toUpperCase();
}

function getDisplayName(c: { creatorId: string; author?: { profile?: { firstName?: string | null; lastName?: string | null } | null } | null }): string {
  const f = c.author?.profile?.firstName;
  const l = c.author?.profile?.lastName;
  if (f && l) return `${f} ${l}`;
  if (f) return f;
  return `User ${c.creatorId.slice(-6)}`;
}

// Small "Creator" badge — shown when the commenter is the content's creator
function CreatorBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold leading-none bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
      Creator
    </span>
  );
}

const AVATAR_COLORS = [
  "from-primary to-secondary",
  "from-violet-500 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-sky-400 to-blue-600",
];

function Avatar({ comment }: { comment: CommentItem | ReplyItem }) {
  const avatar = comment.author?.profile?.avatar;
  const color = AVATAR_COLORS[parseInt(comment.creatorId.slice(-1), 16) % AVATAR_COLORS.length];
  if (avatar) {
    return (
      <Image src={avatar} alt={getDisplayName(comment)} width={32} height={32}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white text-xs font-bold">{getInitials(comment)}</span>
    </div>
  );
}

// ─── Reply row (compact, no nested replies) ───────────────────────────────────

function ReplyRow({
  reply,
  onLike,
  contentCreatorId,
}: {
  reply: ReplyItem;
  onLike: (id: string, liked: boolean, count: number) => void;
  contentCreatorId?: string;
}) {
  const [liked, setLiked] = useState(reply.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(reply.likeCount ?? 0);
  const [toggleLike] = useMutation(ToggleCommentLikeDocument);

  async function handleLike() {
    const was = liked;
    setLiked(!was);
    setLikeCount((c) => c + (was ? -1 : 1));
    try {
      const { data } = await toggleLike({ variables: { commentId: reply.id } });
      if (data?.toggleCommentLike) {
        setLiked(data.toggleCommentLike.liked);
        setLikeCount(data.toggleCommentLike.likeCount);
        onLike(reply.id, data.toggleCommentLike.liked, data.toggleCommentLike.likeCount);
      }
    } catch {
      setLiked(was);
      setLikeCount((c) => c + (was ? 1 : -1));
    }
  }

  return (
    <div className="flex gap-2.5 py-2 pl-11 pr-4">
      <Avatar comment={reply} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-default truncate max-w-[120px]">{getDisplayName(reply)}</span>
          {contentCreatorId && reply.creatorId === contentCreatorId && <CreatorBadge />}
          <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-default leading-snug">{reply.text}</p>
      </div>
      {/* Like button */}
      <button onClick={handleLike} className="flex flex-col items-center gap-0.5 ml-1 flex-shrink-0 pt-0.5">
        <svg className={`w-3.5 h-3.5 ${liked ? "fill-red-500 stroke-red-500" : "fill-none stroke-current text-muted-foreground"}`}
          strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        {likeCount > 0 && (
          <span className={`text-xs leading-none ${liked ? "text-red-500" : "text-muted-foreground"}`}>
            {formatCount(likeCount)}
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Comment row (with replies) ───────────────────────────────────────────────

function CommentRow({
  comment,
  onReply,
  onLikeComment,
  contentCreatorId,
}: {
  comment: CommentItem;
  onReply: (comment: CommentItem) => void;
  onLikeComment: (id: string, liked: boolean, count: number) => void;
  contentCreatorId?: string;
}) {
  const [liked, setLiked] = useState(comment.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);
  const [showReplies, setShowReplies] = useState(false);
  const replyCount = comment.replyCount ?? 0;
  const [toggleLike] = useMutation(ToggleCommentLikeDocument);

  const { data: repliesData, loading: repliesLoading } = useQuery(GetRepliesDocument, {
    variables: { commentId: comment.id },
    skip: !showReplies,
    fetchPolicy: "cache-and-network",
  });
  const replies = repliesData?.replies ?? [];

  async function handleLike() {
    const was = liked;
    setLiked(!was);
    setLikeCount((c) => c + (was ? -1 : 1));
    try {
      const { data } = await toggleLike({ variables: { commentId: comment.id } });
      if (data?.toggleCommentLike) {
        setLiked(data.toggleCommentLike.liked);
        setLikeCount(data.toggleCommentLike.likeCount);
        onLikeComment(comment.id, data.toggleCommentLike.liked, data.toggleCommentLike.likeCount);
      }
    } catch {
      setLiked(was);
      setLikeCount((c) => c + (was ? 1 : -1));
    }
  }

  return (
    <div className="border-b border-default last:border-b-0">
      {/* Main comment */}
      <div className="flex gap-3 py-3 px-4">
        <Avatar comment={comment} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-default truncate max-w-[140px]">{getDisplayName(comment)}</span>
            {contentCreatorId && comment.creatorId === contentCreatorId && <CreatorBadge />}
            <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-default leading-snug">{comment.text}</p>

          {/* Action row */}
          <div className="flex items-center gap-4 mt-1.5">
            <button
              onClick={() => onReply(comment)}
              className="text-xs text-muted-foreground font-medium hover:text-default transition-colors"
            >
              Reply
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="text-xs text-primary font-medium"
              >
                {showReplies ? "Hide replies" : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>
        </div>

        {/* Like button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 ml-1 flex-shrink-0 pt-0.5">
          <svg className={`w-4 h-4 ${liked ? "fill-red-500 stroke-red-500" : "fill-none stroke-current text-muted-foreground"}`}
            strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {likeCount > 0 && (
            <span className={`text-xs leading-none ${liked ? "text-red-500" : "text-muted-foreground"}`}>
              {formatCount(likeCount)}
            </span>
          )}
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="bg-surface/40">
          {repliesLoading && (
            <div className="flex justify-center py-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {replies.map((r) => (
            <ReplyRow
              key={r.id}
              reply={r}
              contentCreatorId={contentCreatorId}
              onLike={(_, __, ___) => { void ___; }}
            />
          ))}
          {/* Reply input shortcut */}
          <button
            onClick={() => onReply(comment)}
            className="w-full text-left pl-11 pr-4 py-2 text-xs text-primary font-medium"
          >
            + Add a reply…
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton — mirrors the comment row layout ────────────────────────

function CommentSkeleton({ short }: { short?: boolean }) {
  return (
    <div className="flex gap-3 py-3 px-4">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2 py-0.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-2.5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        {!short && <Skeleton className="h-3 w-2/3 rounded-full" />}
        <Skeleton className="h-2.5 w-10 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
    </div>
  );
}

function CommentListSkeleton() {
  return (
    <div className="divide-y divide-default">
      {Array.from({ length: 13 }).map((_, i) => (
        <CommentSkeleton key={i} short={i % 3 === 0} />
      ))}
    </div>
  );
}

// ─── Main drawer ─────────────────────────────────────────────────────────────

export function CommentsDrawer({ contentId, contentCreatorId, onClose, onCommentAdded, desktopInline = false }: Props) {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const client = useApolloClient();
  const { keyboardHeight } = useVisualViewport();

  // `visible` drives the open/close animation; when it flips to false the sheet
  // animates out and AnimatePresence's onExitComplete fires the real onClose
  // (which unmounts us). This gives a smooth slide-down on dismiss.
  const [visible, setVisible] = useState(true);
  const requestClose = useCallback(() => setVisible(false), []);

  // Swipe-to-dismiss handled by framer-motion `drag="y"`. Past ~120px pull or a
  // fast downward flick → dismiss.
  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 600) requestClose();
  }

  const { data, loading, fetchMore } = useQuery(GetCommentsDocument, {
    variables: { contentId, limit: 20 },
    fetchPolicy: "cache-and-network",
  });

  const [addComment] = useMutation(AddCommentDocument);
  const [optimistic, setOptimistic] = useState<CommentItem[]>([]);

  const serverItems = data?.comments?.items ?? [];
  const hasMore = data?.comments?.hasMore ?? false;
  const endCursor = data?.comments?.endCursor;

  const serverIds = new Set(serverItems.map((c) => c.id));
  const seenIds = new Set<string>();
  const merged: CommentItem[] = [
    ...optimistic.filter((c) => !serverIds.has(c.id)),
    ...serverItems,
  ].filter((c) => { if (seenIds.has(c.id)) return false; seenIds.add(c.id); return true; });

  // Auto-focus + label input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleReply = useCallback((comment: CommentItem) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  }, []);

  const handleLikeComment = useCallback((id: string, liked: boolean, likeCount: number) => {
    const cacheId = client.cache.identify({ __typename: "Comment", id });
    if (cacheId) {
      client.cache.modify({
        id: cacheId,
        fields: { isLikedByMe: () => liked, likeCount: () => likeCount },
      });
    }
  }, [client]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    const parentId = replyingTo?.id ?? undefined;
    setReplyingTo(null);

    // Only show optimistic for top-level comments (replies appear inline)
    if (!parentId) {
      const tempId = `temp-${Date.now()}`;
      const optimisticComment: CommentItem = {
        id: tempId,
        text: trimmed,
        creatorId: "me",
        createdAt: new Date().toISOString() as unknown,
        parentId: null,
        likeCount: 0,
        replyCount: 0,
        isLikedByMe: false,
        author: null,
      };
      setOptimistic((prev) => [optimisticComment, ...prev]);
      onCommentAdded?.();
      requestAnimationFrame(() => { if (listRef.current) listRef.current.scrollTop = 0; });

      try {
        const { data: res } = await addComment({ variables: { input: { contentId, text: trimmed, parentId } } });
        if (res?.addComment) {
          setOptimistic((prev) =>
            prev.map((c) => c.id === tempId
              ? { ...res.addComment, parentId: res.addComment.parentId ?? null, replyCount: 0, isLikedByMe: false }
              : c,
            ),
          );
        }
      } catch {
        setOptimistic((prev) => prev.filter((c) => c.id !== tempId));
        onCommentAdded?.();
      }
    } else {
      // Reply — write the new reply directly into the Apollo cache for
      // only this parent's GetReplies query. No network calls to other rows.
      try {
        const { data: res } = await addComment({
          variables: { input: { contentId, text: trimmed, parentId } },
        });

        if (res?.addComment) {
          // 1. Append reply into the cached replies list for this parent only
          client.cache.updateQuery(
            { query: GetRepliesDocument, variables: { commentId: parentId } },
            (existing) => {
              const prev = existing?.replies ?? [];
              // Avoid duplicates if the mutation already wrote it
              if (prev.some((r: { id: string }) => r.id === res.addComment.id)) return existing;
              return { replies: [...prev, res.addComment] };
            },
          );
          // 2. Increment replyCount on parent
          const cacheId = client.cache.identify({ __typename: "Comment", id: parentId });
          if (cacheId) {
            client.cache.modify({
              id: cacheId,
              fields: { replyCount: (prev: number) => prev + 1 },
            });
          }
        }
      } catch { /* silent */ }
    }
  }

  function handleScroll() {
    const el = listRef.current;
    if (!el || !hasMore || !endCursor) return;
    if (el.scrollTop < 80) {
      fetchMore({
        variables: { contentId, limit: 20, after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const seen = new Set<string>();
          const deduped = [
            ...(prev.comments?.items ?? []),
            ...(fetchMoreResult.comments?.items ?? []),
          ].filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
          return { comments: { ...fetchMoreResult.comments, items: deduped } };
        },
      });
    }
  }

  // Note: no auto-focus on open — let the user read comments first; the
  // keyboard appears only when they tap the input or hit Reply.

  // Lock the page behind the sheet so it can't scroll while open. Restores the
  // exact scroll position on close (position:fixed would otherwise jump to top).
  useEffect(() => {
    if (desktopInline) return;
    document.body.classList.add("comments-open");

    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.classList.remove("comments-open");
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [desktopInline]);

  const inner = (
    <>
      {/* Comment list */}
      <div ref={listRef} onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain" style={{ minHeight: 0 }}>
        {loading && merged.length === 0 && <CommentListSkeleton />}
        {!loading && merged.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
            <span className="text-2xl mb-2">💬</span>
            No comments yet. Be the first!
          </div>
        )}
        {merged.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onLikeComment={handleLikeComment}
            contentCreatorId={contentCreatorId}
          />
        ))}
        {hasMore && (
          <div className="flex justify-center py-3 text-xs text-muted-foreground">Scroll up to load more</div>
        )}
      </div>

      {/* Input bar — TikTok behaviour: only THIS bar lifts above the keyboard;
          the drawer body behind it stays anchored and doesn't shift. */}
      <div
        className="border-t border-default shrink-0 bg-app"
        style={{
          transform: desktopInline
            ? undefined
            : `translateY(-${keyboardHeight}px)`,
          transition: "transform 0.18s ease-out",
          paddingBottom: desktopInline
            ? "0px"
            : keyboardHeight > 0
              ? "0px"
              : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Replying-to banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-surface text-xs text-muted-foreground">
            <span>Replying to <span className="text-default font-medium">{getDisplayName(replyingTo)}</span></span>
            <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-default ml-2">✕</button>
          </div>
        )}
        <div className="flex items-end gap-2 px-3 pt-2 pb-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={replyingTo ? `Reply to ${getDisplayName(replyingTo)}…` : "Add a comment…"}
            maxLength={500}
            rows={1}
            className="flex-1 bg-surface text-default text-sm rounded-2xl px-4 py-2.5 outline-none placeholder:text-muted-foreground border border-default focus:border-primary transition-colors resize-none overflow-hidden"
            style={{ minHeight: "40px" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary, var(--brand-primary))))" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  if (desktopInline) {
    return <div className="flex flex-col flex-1 overflow-hidden">{inner}</div>;
  }

  // ── Mobile: keyboard-avoiding bottom sheet (TikTok-style) ──
  // The overlay is full-screen `position: fixed` so it never affects page layout
  // and the drawer body stays put. When the keyboard opens we DON'T move the
  // sheet — only the input bar lifts to sit above the keyboard (see `inner`),
  // exactly like TikTok: the keyboard slides up over the content, the drawer
  // itself doesn't shift.
  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <div
          className="fixed inset-0 z-80"
          role="dialog"
          aria-modal="true"
        >
          {/* Scrim */}
          <motion.button
            type="button"
            aria-label="Close comments"
            onClick={requestClose}
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Sheet — slides up; drag the handle down to dismiss. */}
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto flex max-w-107.5 flex-col overflow-hidden rounded-t-3xl bg-app shadow-2xl"
            style={{ height: "75dvh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            {/* Grabber + header — drag handle for swipe-to-close */}
            <div className="shrink-0 border-b border-default cursor-grab active:cursor-grabbing">
              {/* Drawer grabber pill — the "pull me" indicator on top */}
              <div className="flex justify-center pt-3 pb-1.5">
                <div className="h-1.5 w-11 rounded-full bg-muted-foreground/35" />
              </div>
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <h2 className="text-sm font-bold text-default">Comments</h2>
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {inner}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
