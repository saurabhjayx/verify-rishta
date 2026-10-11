import type {
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  Graph,
  Organization,
  Person,
  Thing,
} from "schema-dts";
import type { Author } from "@/content/authors";
import type { Post } from "@/content/posts";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "./site";

const orgId = () => absoluteUrl("/#organization");
const authorId = (slug: string) => absoluteUrl(`/authors/${slug}#author`);

/** One @graph per page. Organization and WebSite are always included. */
export function buildGraph(...nodes: Thing[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId(),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        description: SITE_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icons/icon-512.png"),
          width: "512",
          height: "512",
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        inLanguage: "en-IN",
        publisher: { "@id": orgId() },
      },
      ...nodes,
    ],
  };
}

/** Person for named authors, Organization for team bylines. */
export function authorNode(author: Author): Person | Organization {
  const common = {
    "@id": authorId(author.slug),
    name: author.name,
    url: absoluteUrl(`/authors/${author.slug}`),
    sameAs: author.sameAs,
    knowsAbout: author.expertise,
  };
  return author.kind === "Organization"
    ? {
        "@type": "Organization",
        ...common,
        parentOrganization: { "@id": orgId() },
      }
    : {
        "@type": "Person",
        ...common,
        jobTitle: author.role,
        worksFor: { "@id": orgId() },
      };
}

export function blogPostingNode(
  post: Post,
  path: string,
  imageUrl: string,
): BlogPosting {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@id": authorId(post.author) },
    publisher: { "@id": orgId() },
    mainEntityOfPage: absoluteUrl(path),
    inLanguage: post.lang,
    image: imageUrl,
    wordCount: post.wordCount,
  };
}

export function breadcrumbNode(
  items: { name: string; path: string }[],
): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqNode(faqs: Post["faqs"]): FAQPage {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** Safe for inline <script>: "<" is escaped so content cannot close the tag. */
export const serializeJsonLd = (graph: Graph) =>
  JSON.stringify(graph).replace(/</g, "\\u003c");
