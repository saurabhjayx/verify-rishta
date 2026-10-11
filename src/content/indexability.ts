import type { Post } from "./posts";

/** Archive pages stay noindex until they have this many posts (CLAUDE.md section 4). */
export const MIN_INDEXABLE_POSTS = 5;

/** A topic page is indexable if its pillar is, or (without a pillar) if any of its posts is. */
export function isCategoryIndexable(
  categoryPosts: Pick<Post, "pillar" | "noindex">[],
): boolean {
  const pillar = categoryPosts.find((p) => p.pillar);
  return pillar ? !pillar.noindex : categoryPosts.some((p) => !p.noindex);
}
