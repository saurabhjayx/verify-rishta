import Link from "next/link";
import { CheckCircle } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils/date";
import type { Author } from "@/content/authors";
import type { Post } from "@/content/posts";

export function ArticleHeader({
  post,
  author,
  reviewer,
  eyebrow,
}: {
  post: Post;
  author: Author;
  reviewer?: Author;
  eyebrow: string;
}) {
  return (
    <header className="mt-4 mb-8">
      <p className="mb-3 text-sm font-semibold tracking-wide text-trust uppercase">
        {eyebrow}
      </p>
      <h1 className="text-[2rem] leading-tight sm:text-4xl lg:text-[2.75rem]">
        {post.title}
      </h1>
      <div className="mt-5 flex flex-col gap-1 text-base text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <p>
          By{" "}
          <Link
            href={`/authors/${author.slug}`}
            className="font-semibold text-text underline underline-offset-2"
          >
            {author.name}
          </Link>
          {reviewer && (
            <>
              , reviewed by{" "}
              <Link
                href={`/authors/${reviewer.slug}`}
                className="font-semibold text-text underline underline-offset-2"
              >
                {reviewer.name}
              </Link>
            </>
          )}
        </p>
        {/* "Last reviewed" is a trust claim: show it only when a review happened. */}
        {post.lastReviewedAt ? (
          <p className="flex items-center gap-1.5">
            <CheckCircle className="shrink-0 text-trust" />
            Last reviewed{" "}
            <time dateTime={post.lastReviewedAt.toISOString()}>
              {formatDate(post.lastReviewedAt)}
            </time>
          </p>
        ) : (
          <p>
            Updated{" "}
            <time dateTime={post.updatedAt.toISOString()}>
              {formatDate(post.updatedAt)}
            </time>
          </p>
        )}
        <p>{post.readingMinutes} min read</p>
      </div>
    </header>
  );
}
