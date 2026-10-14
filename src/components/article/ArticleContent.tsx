import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { BarChart } from "@/components/article/BarChart";

/** Components articles may use in MDX. Server components only (no client JS). */
const components = { BarChart };

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
      <Content components={components} />
    </div>
  );
}
