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
        <div className="w-full px-4 pb-6 pt-10 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-6">
            <div className="flex items-start gap-4 lg:rounded-[28px] lg:border lg:border-[rgb(229_231_235)] lg:bg-[rgb(var(--color-bg-elevated)/0.78)] lg:p-6">
              <div
                className="h-20 w-20 shrink-0 animate-pulse rounded-full sm:h-24 sm:w-24 lg:h-32 lg:w-32"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div className="flex-1 space-y-2 pt-2 lg:pt-3">
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
              className="rounded-[28px] lg:border lg:border-[rgb(229_231_235)] lg:bg-[rgb(var(--color-bg-elevated)/0.72)] lg:p-6"
            >
              <div
                className="h-5 w-28 animate-pulse rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="mt-2 h-4 w-56 animate-pulse rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-6 lg:max-w-3xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl border border-[rgb(229_231_235)]"
                    style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3 xl:grid-cols-4">
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
            fontSize: "var(--text-base)",
            color: "rgb(var(--color-text-muted))",
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
