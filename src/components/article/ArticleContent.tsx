import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

/**
 * Renders an article's compiled MDX on the server (no client JS). The code was
 * produced by compileArticle() from a reviewed .mdx file in git.
 */
export async function ArticleContent({ code }: { code: string }) {
  const { default: Content } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return (
    <div className="prose-article">
      <Content />
    </div>
  );
}
