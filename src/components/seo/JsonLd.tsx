import type { Thing } from "schema-dts";
import { buildGraph, serializeJsonLd } from "@/lib/seo/jsonld";

export function JsonLd({ nodes = [] }: { nodes?: Thing[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(buildGraph(...nodes)),
      }}
    />
  );
}
