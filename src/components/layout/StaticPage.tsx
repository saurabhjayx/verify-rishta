import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/seo/jsonld";

export function StaticPage({
  title,
  path,
  children,
}: {
  title: string;
  path: string;
  children: ReactNode;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <JsonLd nodes={[breadcrumbNode(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <article className="prose-article mt-4">
        <h1 className="text-[2rem] leading-tight sm:text-4xl">{title}</h1>
        {children}
      </article>
    </div>
  );
}
