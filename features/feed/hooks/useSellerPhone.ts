"use client";

/**
 * Fetch a seller's contact number only after a buyer requests it.
 *
 * The number is never part of the content payload — it's fetched only when a
 * signed-in buyer asks for it, which keeps every seller's number out of the
 * crawlable PDP HTML and off the feed responses, and gives us a real contact
 * intent moment to measure. Callers decide whether to use it for a phone call
 * or a WhatsApp handoff.
 */

import { useCallback, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { SellerContactPhoneDocument } from "@/types/__generated__/graphql";
import { telHref } from "@/lib/phone";

export function useSellerPhone(contentId: string | null | undefined) {
  const [resolvedPhone, setResolvedPhone] = useState<{
    contentId: string;
    value: string;
  } | null>(null);
  const [unavailableContentId, setUnavailableContentId] = useState<
    string | null
  >(null);
  const phone =
    resolvedPhone && resolvedPhone.contentId === contentId
      ? resolvedPhone.value
      : null;
  const unavailable = Boolean(
    contentId && unavailableContentId === contentId,
  );
  const [fetchPhone, { loading }] = useLazyQuery(SellerContactPhoneDocument, {
    fetchPolicy: "network-only",
  });

  /**
   * Returns the revealed number, or null when it couldn't be shown. Callers
   * that already hold a number should dial instead of calling this again.
   */
  const reveal = useCallback(async (): Promise<string | null> => {
    if (!contentId) return null;
    if (phone) return phone;

    const { data } = await fetchPhone({ variables: { contentId } });
    const revealed = data?.sellerContactPhone ?? null;
    if (!revealed) {
      // Listings published before contact numbers became mandatory have none.
      setUnavailableContentId(contentId);
      return null;
    }
    setResolvedPhone({ contentId, value: revealed });
    return revealed;
  }, [contentId, phone, fetchPhone]);

  /**
   * Pass the number when dialling straight off a `reveal()` — that state write
   * hasn't landed yet in the same tick, so the closed-over `phone` is stale.
   */
  const dial = useCallback(
    (override?: string) => {
      const target = override ?? phone;
      if (!target) return;
      window.location.href = telHref(target);
    },
    [phone],
  );

  return { phone, reveal, dial, loading, unavailable };
}
