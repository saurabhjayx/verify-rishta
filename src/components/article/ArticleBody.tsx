import type { ReactNode } from "react";
import { ArticleContent } from "@/components/article/ArticleContent";
import { AuthorBox } from "@/components/article/AuthorBox";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { Faqs } from "@/components/article/Faqs";
import { Sources } from "@/components/article/Sources";
import { TocDesktop, TocMobile } from "@/components/article/Toc";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import type { Author } from "@/content/authors";
import type { Post } from "@/content/posts";

/**
 * Article layout shared by article and pillar pages. Server-only, no client JS.
 * Phones: one column, collapsible TOC. Desktop: 68ch text column + sticky TOC.
 * `after` renders full width below the grid (related posts, cluster listings).
 */
export function ArticleBody({
  post,
  author,
  reviewer,
  crumbs,
  eyebrow,
  after,
}: {
  post: Post;
  author: Author;
  reviewer?: Author;
  crumbs: Crumb[];
  /** Small label above the H1: "Complete guide" on pillars, the topic name on articles. */
  eyebrow: string;
  after?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <Breadcrumbs items={crumbs} />
      <div className="lg:grid lg:grid-cols-[minmax(0,68ch)_15rem] lg:justify-between lg:gap-12">
        <article className="min-w-0">
          <ArticleHeader
            post={post}
            author={author}
            reviewer={reviewer}
            eyebrow={eyebrow}
          />
          <TocMobile toc={post.toc} />
          <ArticleContent code={post.code} />
          <Faqs faqs={post.faqs} />
          <Sources sources={post.sources} />
          <AuthorBox author={author} />
        </article>
        <aside className="hidden lg:block">
          <TocDesktop toc={post.toc} />
        </aside>
      </div>
      {after}
    </div>
  );
}
