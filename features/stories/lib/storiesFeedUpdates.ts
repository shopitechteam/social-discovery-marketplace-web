import type {
  StoriesFeedQuery,
  StoryViewersQuery,
} from "@/types/__generated__/graphql";
import type {
  StoryCreatorPayload,
  StoryPayload,
  StoryViewedPayload,
} from "@/lib/socket";

/**
 * Pure edits to cached query results, applied as socket events arrive — so the
 * tray and "Seen by" change in place instead of refetching.
 *
 * Every node carries its __typename: Apollo needs it to normalise the Story
 * and User entities these results point at.
 */

type Ring = StoriesFeedQuery["storiesFeed"][number];
type RingStory = Ring["stories"][number];

function creatorNode(creator: StoryCreatorPayload): Ring["user"] {
  return {
    __typename: "User",
    id: creator.id,
    username: creator.username,
    profile: creator.profile ? { __typename: "UserProfile", ...creator.profile } : null,
  } as Ring["user"];
}

function storyNode(story: StoryPayload): RingStory {
  return {
    __typename: "Story",
    id: story.id,
    caption: story.caption,
    expiresAt: story.expiresAt,
    createdAt: story.createdAt,
    viewCount: story.viewCount,
    // New to everyone — including its creator, until they watch it back.
    isViewed: false,
    media: { __typename: "StoryMedia", ...story.media },
  } as RingStory;
}

/**
 * A story went live. It joins its creator's ring — which moves to the front,
 * newest update first, as WhatsApp does — or starts a new ring there.
 */
export function withStoryAdded(
  data: StoriesFeedQuery,
  story: StoryPayload,
  creator: StoryCreatorPayload,
): StoriesFeedQuery {
  const rings = data.storiesFeed;
  if (rings.some((ring) => ring.stories.some((s) => s.id === story.id))) return data;

  const node = storyNode(story);
  const index = rings.findIndex((ring) => ring.user.id === creator.id);
  if (index === -1) {
    const ring = {
      __typename: "StoryRing",
      hasUnviewed: true,
      totalCount: 1,
      user: creatorNode(creator),
      stories: [node],
    } as Ring;
    return { ...data, storiesFeed: [ring, ...rings] };
  }

  const ring = rings[index];
  const updated: Ring = {
    ...ring,
    stories: [...ring.stories, node],
    totalCount: ring.totalCount + 1,
    hasUnviewed: true,
  };
  return {
    ...data,
    storiesFeed: [updated, ...rings.slice(0, index), ...rings.slice(index + 1)],
  };
}

/** A story was deleted; its ring goes too once it's empty. */
export function withStoryRemoved(data: StoriesFeedQuery, storyId: string): StoriesFeedQuery {
  if (!data.storiesFeed.some((ring) => ring.stories.some((s) => s.id === storyId))) return data;
  const storiesFeed = data.storiesFeed
    .map((ring) => {
      if (!ring.stories.some((s) => s.id === storyId)) return ring;
      const stories = ring.stories.filter((s) => s.id !== storyId);
      return {
        ...ring,
        stories,
        totalCount: stories.length,
        hasUnviewed: stories.some((s) => !s.isViewed),
      };
    })
    .filter((ring) => ring.stories.length > 0);
  return { ...data, storiesFeed };
}

/** A first view of your story arrived: top of "Seen by", count updated. */
export function withViewerAdded(
  data: StoryViewersQuery,
  view: StoryViewedPayload,
): StoryViewersQuery {
  const list = data.storyViewers;
  const already = list.viewers.some((v) => v.user.id === view.viewer.id);
  const viewers = already
    ? list.viewers
    : [
        {
          __typename: "StoryViewer",
          viewedAt: view.viewedAt,
          user: creatorNode(view.viewer),
        } as (typeof list.viewers)[number],
        ...list.viewers,
      ];
  return {
    ...data,
    storyViewers: { ...list, viewers, totalCount: Math.max(list.totalCount, view.viewCount) },
  };
}
