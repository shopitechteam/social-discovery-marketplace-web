import { InlineText } from "./InlineText";

/**
 * A data table that stays readable on a phone: a normal table from md up,
 * and below that each row becomes a small card with its column labels — no
 * sideways scrolling, and the thead is hidden so labels are read only once.
 */
export function ArticleTable({
  head,
  rows,
  caption,
  lang,
}: {
  head: string[];
  rows: string[][];
  caption?: string;
  lang: string;
}) {
  return (
    <figure className="my-6">
      {/* A figcaption rather than <caption>: once the table switches to
          block layout on phones, a <caption> collapses to a narrow column. */}
      {caption && (
        <figcaption className="mb-3 text-sm font-semibold text-muted">
          {caption}
        </figcaption>
      )}
      <table className="w-full border-collapse text-[0.95rem] leading-snug max-md:block">
        <thead className="max-md:hidden">
          <tr className="border-b-2 border-border">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="px-3 py-2.5 text-left text-xs font-bold tracking-wide text-muted uppercase"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border max-md:mb-3 max-md:block max-md:rounded-xl max-md:border max-md:bg-elevated max-md:px-4 max-md:py-3"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`align-top text-muted max-md:block md:px-3 md:py-3 ${
                    j === 0
                      ? "font-semibold text-foreground max-md:pb-1 max-md:text-base"
                      : "max-md:py-0.5"
                  }`}
                >
                  {j > 0 && (
                    <span className="font-semibold text-foreground md:hidden">
                      {head[j]}:{" "}
                    </span>
                  )}
                  <InlineText text={cell} lang={lang} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
