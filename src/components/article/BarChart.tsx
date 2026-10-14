type Bar = { label: string; value: number };

const fmt = (n: number, digits = 2) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: digits });

/** Axis step of 1, 2 or 5 times a power of ten, giving at most 5 intervals. */
function niceStep(max: number): number {
  const raw = max / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow;
}

const PLOT_HEIGHT = 176; // px; fixed so the chart never shifts layout

/**
 * Single-series column chart for article statistics. Server-rendered HTML and
 * CSS, zero client JS (CLAUDE.md rule 2), sized in real pixels so labels stay
 * legible on phones. Values sit on each cap; the native `title` gives a hover
 * tooltip; the collapsible table is the accessible view. Colours are theme
 * tokens, so dark mode follows the site.
 */
export function BarChart({
  title,
  unit,
  data,
  source,
  sourceUrl,
  note,
}: {
  title: string;
  /** Shown after the title and in the table header, e.g. "₹ crore". */
  unit: string;
  data: Bar[];
  source: string;
  sourceUrl: string;
  note?: string;
}) {
  const step = niceStep(Math.max(...data.map((d) => d.value)));
  const top = Math.ceil(Math.max(...data.map((d) => d.value)) / step) * step;
  const ticks = Array.from(
    { length: Math.round(top / step) + 1 },
    (_, i) => i * step,
  );

  return (
    <figure className="not-prose my-8 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <figcaption>
        <p className="text-base font-semibold text-text">{title}</p>
        <p className="text-sm text-muted">{unit}</p>
      </figcaption>

      {/* Visual chart; the table below carries the same data for assistive tech. */}
      {/* pt-6 leaves room for the top tick and the tallest value label. */}
      <div aria-hidden="true" className="mt-2 flex gap-2 pt-6">
        <div
          className="relative w-12 shrink-0 text-right text-xs text-muted"
          style={{ height: PLOT_HEIGHT }}
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2"
              style={{ bottom: `${(t / top) * 100}%` }}
            >
              {fmt(t, 1)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end justify-around">
              {data.map((d) => (
                <div
                  key={d.label}
                  title={`${d.label}: ${fmt(d.value)} ${unit}`}
                  className="relative flex h-full w-16 items-end justify-center"
                >
                  <div
                    className="relative w-6 rounded-t-[4px] bg-trust"
                    style={{ height: `${(d.value / top) * 100}%` }}
                  >
                    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-text">
                      {fmt(d.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1 flex justify-around text-xs text-muted">
            {data.map((d) => (
              <span key={d.label} className="w-16 text-center">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Source:{" "}
        <a
          href={sourceUrl}
          rel="noopener"
          className="text-trust underline underline-offset-2"
        >
          {source}
        </a>
        {note ? `. ${note}` : ""}
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted">Show data table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1 font-semibold">Year</th>
              <th className="py-1 font-semibold">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-b border-border">
                <td className="py-1">{d.label}</td>
                <td className="py-1">{fmt(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
