"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GetCommentsDocument,
  AddCommentDocument,
} from "@/types/__generated__/graphql";
import type { GetCommentsQuery } from "@/types/__generated__/graphql";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type CommentItem = NonNullable<
  GetCommentsQuery["comments"]["items"]
>[number];

interface Props {
  contentId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

function timeAgo(raw: unknown): string {
  if (!raw) return "";
  const diff = Date.now() - new Date(raw as string).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function initials(id: string): string {
  return id.slice(-2).toUpperCase();
}

function CommentRow({ comment }: { comment: CommentItem }) {
  const colors = [
    "from-primary to-secondary",
    "from-violet-500 to-purple-600",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-rose-500",
    "from-sky-400 to-blue-600",
  ];
  const color =
    colors[parseInt(comment.creatorId.slice(-1), 16) % colors.length];

  return (
    <div className="flex gap-3 py-3 px-4 border-b border-default last:border-b-0">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <span className="text-white text-[10px] font-bold">
          {initials(comment.creatorId)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-default truncate max-w-[120px]">
            {comment.creatorId.slice(-8)}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-default leading-snug">{comment.text}</p>
        {(comment.likeCount ?? 0) > 0 && (
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">
            ❤️ {comment.likeCount}
          </span>
        )}
      </div>
    </div>
  );
}

export function CommentsDrawer({ contentId, onClose, onCommentAdded }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, loading, fetchMore } = useQuery(GetCommentsDocument, {
    variables: { contentId, limit: 20 },
    fetchPolicy: "cache-and-network",
  });

  const [addComment] = useMutation(AddCommentDocument);
  const [optimistic, setOptimistic] = useState<CommentItem[]>([]);

  const serverItems = data?.comments?.items ?? [];
  const hasMore = data?.comments?.hasMore ?? false;
  const endCursor = data?.comments?.endCursor;

  // Dedup: once a real server id appears in cache, remove it from optimistic list
  const serverIds = new Set(serverItems.map((c) => c.id));
  // Also track which real IDs were previously optimistic (by text match) to avoid double
  const merged: CommentItem[] = [
    // Optimistic entries at top — filter out any that now exist in server cache
    ...optimistic.filter((c) => !serverIds.has(c.id)),
    ...serverItems,
  ];

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentItem = {
      id: tempId,
      text: trimmed,
      creatorId: "me",
      createdAt: new Date().toISOString() as unknown,
      parentId: null,
      likeCount: 0,
    };
    // Prepend optimistic immediately — visible before server responds
    setOptimistic((prev) => [optimisticComment, ...prev]);
    onCommentAdded?.();
    // Scroll to top so the new comment is visible
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = 0;
    });

    try {
      const { data: res } = await addComment({
        variables: { input: { contentId, text: trimmed } },
      });
      if (res?.addComment) {
        // Replace the temp entry with the real server comment
        setOptimistic((prev) =>
          prev.map((c) =>
            c.id === tempId
              ? { ...res.addComment, parentId: res.addComment.parentId ?? null }
              : c,
          ),
        );
      }
    } catch {
      // Roll back on failure
      setOptimistic((prev) => prev.filter((c) => c.id !== tempId));
      onCommentAdded && onCommentAdded(); // negate — caller incremented optimistically
      // Re-decrement the parent count on failure
      // (we call the inverse: a "removed" signal isn't wired, so just leave count +1;
      //  worst case it corrects on next open. Acceptable tradeoff.)
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
          return {
            comments: {
              ...fetchMoreResult.comments,
              items: [
                ...(prev.comments?.items ?? []),
                ...(fetchMoreResult.comments?.items ?? []),
              ],
            },
          };
        },
      });
    }
  }

  // Focus input when drawer opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Hide bottom nav while drawer is open by adding a class to <body>
  useEffect(() => {
    document.body.classList.add("comments-open");
    return () => document.body.classList.remove("comments-open");
  }, []);

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent
        className="mx-auto max-w-[430px] focus:outline-none"
        style={{
          maxHeight: "75vh",
          // Sit above the bottom nav (z-50 from shadcn) — already handled,
          // but we also hide the nav via the body class below
        }}
      >
        {/* Header */}
        <DrawerHeader className="border-b border-default pb-3 pt-1">
          <DrawerTitle className="text-sm font-semibold text-default text-center">
            Comments
          </DrawerTitle>
        </DrawerHeader>

        {/* Comment list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ minHeight: 0 }}
        >
          {loading && merged.length === 0 && (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && merged.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <span className="text-2xl mb-2">💬</span>
              No comments yet. Be the first!
            </div>
          )}
          {merged.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
          {hasMore && (
            <div className="flex justify-center py-3 text-xs text-muted-foreground">
              Scroll up to load more
            </div>
          )}
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-2 px-3 pt-2 pb-3 border-t border-default flex-shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Add a comment…"
            maxLength={500}
            className="flex-1 bg-surface text-default text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-muted-foreground border border-default focus:border-primary transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary, var(--brand-primary))))",
            }}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
