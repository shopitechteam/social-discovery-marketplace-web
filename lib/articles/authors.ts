import type { Author } from "./types.ts";

/**
 * Bylines. Articles are written by the Shopi team, so the byline is the team
 * and the Article schema's author is the Organization. Add a Person here only
 * for a real, named writer — never a persona.
 */
export const AUTHORS: Author[] = [
  {
    id: "shopi-team",
    name: "Shopi Team",
    role: "Guides and price checks",
    kind: "Organization",
    initials: "S",
  },
];

export function getAuthor(id: string): Author | undefined {
  return AUTHORS.find((author) => author.id === id);
}
