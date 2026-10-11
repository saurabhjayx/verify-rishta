import { PostList } from "@/components/ui/PostCard";
import type { Post } from "@/content/posts";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section
      aria-labelledby="related"
      className="mt-16 border-t border-border pt-10"
    >
      <h2 id="related" className="mb-6 text-2xl leading-snug sm:text-[1.75rem]">
        Related reading
      </h2>
      <PostList posts={posts} />
    </section>
  );
}
