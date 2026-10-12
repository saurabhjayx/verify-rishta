import Link from "next/link";
import { preload } from "react-dom";
import { CheckCircle } from "@/components/ui/icons";
import { heroFiles } from "@/content/article";
import { formatDate } from "@/lib/utils/date";
import type { Author } from "@/content/authors";
import type { Post } from "@/content/posts";

type Hero = NonNullable<Post["heroImage"]>;

// The text column is 68ch (~680px) on desktop and full width minus the gutter below.
const HERO_SIZES = "(min-width: 1024px) 680px, calc(100vw - 2rem)";

/**
 * Banner and likely LCP element: pre-sized static WebP (800w for phones,
 * 1200w otherwise), so no image optimizer is needed. Preloaded from <head>
 * at high priority and never lazy; width/height reserve space (no CLS).
 */
function HeroImage({ hero }: { hero: Hero }) {
  const { src, small } = heroFiles(hero.src);
  const srcSet = `${small} 800w, ${src} 1200w`;
  preload(src, {
    as: "image",
    imageSrcSet: srcSet,
    imageSizes: HERO_SIZES,
    fetchPriority: "high",
  });
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static, pre-sized variants; next/image would add an optimizer round trip
    <img
      src={src}
      srcSet={srcSet}
      sizes={HERO_SIZES}
      width={hero.width}
      height={hero.height}
      alt={hero.alt}
      fetchPriority="high"
      className="mt-6 h-auto w-full rounded-lg bg-surface-2"
    />
  );
}

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
      {post.heroImage && <HeroImage hero={post.heroImage} />}
    </header>
  );
}
