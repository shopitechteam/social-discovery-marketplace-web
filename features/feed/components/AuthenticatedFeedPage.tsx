"use client";

import { Suspense, useSyncExternalStore } from "react";
import { FeedPage } from "./FeedPage";
import { FeedSkeleton } from "./FeedSkeleton";

const subscribe = () => () => {};

/**
 * Auth tokens are restored from localStorage and are therefore unavailable to
 * server rendering. Delay the personalized query until hydration so the Apollo
 * auth link can attach the token instead of seeding the cache with guest data.
 */
export function AuthenticatedFeedPage({ lang }: { lang: string }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  if (!hydrated) return <FeedSkeleton />;

  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedPage lang={lang} />
    </Suspense>
  );
}
