import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/seo/OgCard";
import { getCategory } from "@/content/categories";
import { getPost } from "@/content/posts";

// Same params as the article page, so images are prerendered, not rendered per request.
export { generateStaticParams } from "./page";

export const alt = "VerifyRishta article";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}) {
  const post = await getPost((await params).slug);
  const kicker = (post && getCategory(post.category)?.name) ?? "VerifyRishta";
  return new ImageResponse(
    <OgCard kicker={kicker} title={post?.title ?? "VerifyRishta"} />,
    size,
  );
}
