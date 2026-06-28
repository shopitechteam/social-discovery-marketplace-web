"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { CommentThread } from "./CommentThread";

interface Props {
  contentId: string;
  /** The userId of the content's creator — used to label their comments "Creator". */
  contentCreatorId?: string;
  onClose: () => void;
  onCommentAdded?: () => void;
  desktopInline?: boolean;
}

/**
 * The comments surface — a mobile bottom sheet, a desktop centred dialog, or an
 * inline panel (`desktopInline`). It's purely the shell/animation; the comment
 * list, replies, and composer all live in the shared {@link CommentThread}.
 */
export function CommentsDrawer({
  contentId,
  contentCreatorId,
  onClose,
  onCommentAdded,
  desktopInline = false,
}: Props) {
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

  if (desktopInline) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <CommentThread
          contentId={contentId}
          contentCreatorId={contentCreatorId}
          onCommentAdded={onCommentAdded}
        />
      </div>
    );
  }

  // ── Mobile: keyboard-avoiding bottom sheet (TikTok-style) ──
  // The overlay is full-screen `position: fixed` so it never affects page layout
  // and the drawer body stays put. When the keyboard opens we DON'T move the
  // sheet — only the input bar lifts to sit above the keyboard (CommentThread's
  // `keyboardAvoiding`), exactly like TikTok.
  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <div className="fixed inset-0 z-80" role="dialog" aria-modal="true">
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

          {/* Mobile sheet — TikTok-style bottom drawer. */}
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto flex max-w-107.5 flex-col overflow-hidden rounded-t-3xl bg-app shadow-2xl md:hidden"
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

            <CommentThread
              contentId={contentId}
              contentCreatorId={contentCreatorId}
              onCommentAdded={onCommentAdded}
              keyboardAvoiding
            />
          </motion.div>

          {/* Desktop / tablet dialog — centered, wider, and not draggable. */}
          <motion.div
            className="absolute left-1/2 top-1/2 hidden w-[min(760px,calc(100vw-3rem))] max-w-[760px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-default bg-app shadow-2xl md:flex lg:w-[min(860px,calc(100vw-5rem))] lg:max-w-[860px]"
            style={{ height: "min(82dvh, 860px)" }}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="shrink-0 border-b border-default bg-[rgb(var(--color-bg)/0.96)] backdrop-blur-md">
              <div className="flex items-center justify-between px-5 py-4 lg:px-6">
                <div>
                  <h2 className="text-base font-bold text-default">Comments</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Join the conversation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-default"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <CommentThread
              contentId={contentId}
              contentCreatorId={contentCreatorId}
              onCommentAdded={onCommentAdded}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
