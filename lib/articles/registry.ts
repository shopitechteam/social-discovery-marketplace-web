import { LEGACY_ARTICLES } from "./legacy.ts";
import { POSTS } from "./posts/index.ts";
import type { Article } from "./types.ts";

/** Every article in the repo, drafts included. Read it through index.ts. */
export const ALL_ARTICLES: Article[] = [...POSTS, ...LEGACY_ARTICLES];
