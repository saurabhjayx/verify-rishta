import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/seo/OgCard";
import { getCategory } from "@/content/categories";
import { getPost } from "@/content/posts";

// Share card for articles without a hero image. A plain route, not an
// opengraph-image file: file-based OG images override metadata, which would
// hide an article's own hero.jpg.
// Same params as the article page, so cards are prerendered, not rendered per request.
export { generateStaticParams } from "../page";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[cluster]/[slug]/og.png">,
) {
  const post = await getPost((await params).slug);
  const kicker = (post && getCategory(post.category)?.name) ?? "VerifyRishta";
  return new ImageResponse(
    <OgCard kicker={kicker} title={post?.title ?? "VerifyRishta"} />,
    OG_SIZE,
  );
}
