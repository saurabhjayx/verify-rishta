import Link from "next/link";
import { getCategory } from "@/content/categories";
import { postPath, type Post } from "@/content/posts";

type CardPost = Pick<
  Post,
  "slug" | "category" | "pillar" | "title" | "excerpt" | "readingMinutes"
>;

/** Whole card is one tap target (stretched link), so it is far above 44px. */
export function PostCard({ post }: { post: CardPost }) {
  const categoryName = getCategory(post.category)?.name;
  return (
    <article className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-trust">
      {categoryName && (
        <p className="text-sm font-semibold text-trust">{categoryName}</p>
      )}
      <h3 className="mt-1 text-xl leading-snug">
        <Link
          href={postPath(post)}
          className="after:absolute after:inset-0 after:rounded-lg"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-base text-muted">{post.excerpt}</p>
      <p className="mt-auto pt-4 text-sm text-muted">
        {post.readingMinutes} min read
      </p>
    </article>
  );
}

export function PostList({ posts }: { posts: CardPost[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
