import type { StoryCreatorFieldsFragment } from "@/types/__generated__/graphql";

/** The short name under a ring and in the viewer header. */
export function storyUserName(user: StoryCreatorFieldsFragment): string {
  return user.profile?.firstName?.trim() || user.username || "Seller";
}
