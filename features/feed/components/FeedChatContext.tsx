"use client";

import { createContext, useContext } from "react";

/**
 * Lets PostCards anywhere in the desktop feed tree open the inline chat panel
 * (right rail) instead of navigating to the full-screen chat. Provided by
 * DesktopFeed; `null` everywhere else, so PostCard falls back to navigation.
 *
 * The originating card element is passed so the host can auto-close the chat
 * once that post scrolls out of view.
 */
const FeedChatContext = createContext<
  ((contentId: string, anchor: HTMLElement | null) => void) | null
>(null);

export const FeedChatProvider = FeedChatContext.Provider;

export function useFeedChat() {
  return useContext(FeedChatContext);
}
