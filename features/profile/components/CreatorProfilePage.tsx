"use client";

import { useQuery } from "@apollo/client/react";
import { GetUserProfileDocument } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { CreatorProfileView } from "./CreatorProfileView";

interface Props {
  username: string;
  lang: string;
}

export function CreatorProfilePage({ username, lang }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data, loading } = useQuery(GetUserProfileDocument, {
    variables: { username },
  });

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "rgb(var(--color-bg))" }}
      >
        <div className="mx-auto max-w-2xl px-4 pb-6 pt-10 sm:px-6">
          <div className="flex items-start gap-4">
            <div
              className="h-20 w-20 shrink-0 animate-pulse rounded-full sm:h-24 sm:w-24"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
            <div className="flex-1 space-y-2 pt-2">
              <div
                className="h-5 w-36 animate-pulse rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="h-4 w-24 animate-pulse rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="mt-3 h-9 w-28 animate-pulse rounded-xl"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
            </div>
          </div>
          <div
            className="mt-5 h-20 animate-pulse rounded-2xl"
            style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
          />
        </div>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl"
                style={{
                  aspectRatio: "9/16",
                  backgroundColor: "rgb(var(--color-bg-subtle))",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.userProfile) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "rgb(var(--color-bg))" }}
      >
        <p
          style={{
            color: "rgb(var(--color-text-muted))",
            fontSize: "var(--text-base)",
          }}
        >
          Creator not found.
        </p>
      </div>
    );
  }

  const isOwnProfile = Boolean(
    currentUserId && currentUserId === data.userProfile.id,
  );

  return (
    <CreatorProfileView
      user={data.userProfile}
      lang={lang}
      isOwnProfile={isOwnProfile}
    />
  );
}
