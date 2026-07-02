"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EmbeddedChatPanel } from "./EmbeddedChatPanel";

interface Props {
  lang: string;
  /**
   * The post/content id to chat about. `null` keeps the panel closed; setting it
   * animates the chat in. Switching ids re-mounts the conversation.
   */
  contentId: string | null;
  /** Collapse the panel (does not navigate). */
  onClose: () => void;
  /** Extra classes for the animated container (e.g. width, border, radius). */
  className?: string;
  /**
   * Hide the participant's name + avatar in the chat header. Set by the desktop
   * feed right rail, where the originating post card already shows the seller;
   * the PDP content sheet leaves it off and keeps the usual header.
   */
  hideParticipantHeader?: boolean;
}

/**
 * The right-side inline chat panel shared by the desktop feed (right rail) and
 * the desktop content sheet (PDP). Wraps {@link EmbeddedChatPanel} in a Framer
 * slide-in so both surfaces get the same open/close motion. State (which post,
 * open/closed) is owned by the host.
 */
export function InlineChatPanel({
  lang,
  contentId,
  onClose,
  className,
  hideParticipantHeader,
}: Props) {
  return (
    <AnimatePresence initial={false}>
      {contentId !== null && (
        <motion.div
          key="inline-chat"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          <EmbeddedChatPanel
            key={contentId}
            lang={lang}
            contentId={contentId}
            onClose={onClose}
            hideParticipantHeader={hideParticipantHeader}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
