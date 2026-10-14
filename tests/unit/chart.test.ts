import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BarChart } from "@/components/article/BarChart";

const render = (values: number[]) =>
  renderToStaticMarkup(
    createElement(BarChart, {
      title: "T",
      unit: "u",
      data: values.map((value, i) => ({ label: `${2021 + i}`, value })),
      source: "S",
      sourceUrl: "https://example.com",
    }),
  );

// Axis tick labels are the right-aligned spans in the y-axis column.
const ticks = (html: string) =>
  [...html.matchAll(/-translate-y-1\/2"[^>]*>([^<]+)</g)].map((m) => m[1]);

describe("BarChart", () => {
  it("uses round axis steps, never quarters like 6,250", () => {
    expect(ticks(render([2290.24, 7465.18, 22845.73]))).toEqual([
      "0",
      "5,000",
      "10,000",
      "15,000",
      "20,000",
      "25,000",
    ]);
    expect(ticks(render([4.52, 10.29, 15.96, 22.68]))).toEqual([
      "0",
      "5",
      "10",
      "15",
      "20",
      "25",
    ]);
  });

  it("keeps the data in an accessible table", () => {
    const html = render([15489, 12343]);
    expect(html).toContain("<table");
    expect(html).toContain("15,489");
    expect(html).toContain('aria-hidden="true"');
  });
});
