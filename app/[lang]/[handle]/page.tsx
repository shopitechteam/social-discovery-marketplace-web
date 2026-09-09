import type { Metadata } from "next";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

/**
 * Public seller profiles live at the root of a locale as `/en/@emmac`.
 *
 * This is a bare dynamic segment, so it sits below every static route under
 * `[lang]` in Next's matching order — `/en/explore` and friends still win. The
 * "@" is required and part of the URL, which is what keeps this from
 * swallowing arbitrary paths: anything without it is a 404, as it should be.
 *
 * Note the folder cannot be named `@handle`; a leading "@" marks a parallel
 * route slot in the App Router, not a URL segment.
 */
function usernameFromHandle(handle: string): string | null {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  const username = decoded.slice(1).trim().toLowerCase();
  return /^[a-z0-9._-]{1,40}$/.test(username) ? username : null;
}
import { CreatorProfilePage } from "@/features/profile/components/CreatorProfilePage";
import { query } from "@/lib/apollo/ApolloClient";
import { GetUserProfileDocument } from "@/types/__generated__/graphql";
import type { ProfileUserFieldsFragment } from "@/types/__generated__/graphql";
import { siteConfig } from "@/config/site";
import { profilePageSchema, jsonLd } from "@/lib/structured-data";
import { localeAlternates } from "@/lib/metadata";

interface Props {
  params: Promise<{ lang: string; handle: string }>;
}

// Profiles change (new posts, follower counts) — revalidate hourly so shared
// links and crawled metadata stay reasonably fresh.
export const revalidate = 3600;

type Profile = ProfileUserFieldsFragment;

async function getProfile(username: string): Promise<Profile | null> {
  try {
    const { data } = await query({
      query: GetUserProfileDocument,
      variables: { username },
    });
    return (data?.userProfile as Profile | undefined) ?? null;
  } catch {
    return null;
  }
}

function displayName(p: Profile): string {
  const full = [p.profile?.firstName, p.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || p.username || "Shopi seller";
}

function buildDescription(p: Profile): string {
  if (p.profile?.bio?.trim()) return p.profile.bio.slice(0, 300);
  const name = displayName(p);
  const stats: string[] = [];
  if (typeof p.postCount === "number") {
    stats.push(`${p.postCount} listing${p.postCount === 1 ? "" : "s"}`);
  }
  if (typeof p.followerCount === "number") {
    stats.push(
      `${p.followerCount} follower${p.followerCount === 1 ? "" : "s"}`,
    );
  }
  const tail = stats.length ? ` · ${stats.join(" · ")}` : "";
  return `${name} on ${siteConfig.name}, Kenya's social marketplace${tail}. Browse their listings and message them directly.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, handle } = await params;
  const username = usernameFromHandle(handle);
  if (!username) return { title: siteConfig.name, robots: { index: false, follow: false } };

  const profile = await getProfile(username);
  const canonical = `${siteConfig.url}/${lang}/@${username}`;

  if (!profile) {
    return {
      title: `@${username}`,
      description: siteConfig.description,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const name = displayName(profile);
  const handleLabel = profile.username ? `@${profile.username}` : "";
  const title = `${name}${handleLabel ? ` (${handleLabel})` : ""}`;
  const shareTitle = `${title} | ${siteConfig.name}`;
  const description = buildDescription(profile);

  return {
    title,
    description,
    keywords: [
      name,
      profile.username,
      `${name} Shopi`,
      "Shopi seller",
      "Kenya marketplace seller",
    ].filter(Boolean) as string[],
    alternates: {
      canonical,
      ...localeAlternates(`/@${username}`),
    },
    openGraph: {
      type: "profile",
      url: canonical,
      siteName: siteConfig.name,
      title: shareTitle,
      description,
      locale: "en_KE",
      // og:image comes from the sibling opengraph-image route. Next
      // fingerprints image routes under dynamic segments, so a hand-built
      // "/opengraph-image" URL 404s and would override the real one.
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: shareTitle,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { lang, handle } = await params;
  if (!isValidLocale(lang)) notFound();

  const username = usernameFromHandle(handle);
  if (!username) notFound();

  const profile = await getProfile(username);
  const canonical = `${siteConfig.url}/${lang}/@${username}`;

  return (
    <>
      {profile && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              profilePageSchema({
                url: canonical,
                displayName: displayName(profile),
                username: profile.username,
                bio: profile.profile?.bio,
                avatar: profile.profile?.avatar,
                website: profile.profile?.website,
                followerCount: profile.followerCount,
                postCount: profile.postCount,
              }),
            ),
          }}
        />
      )}
      <CreatorProfilePage
        username={username}
        lang={lang}
        initialProfile={profile}
      />
    </>
  );
}
