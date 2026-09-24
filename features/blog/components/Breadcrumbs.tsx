import Link from "next/link";

/**
 * Visible breadcrumbs. The page emits the matching BreadcrumbList JSON-LD
 * from the same trail, so what readers see and what engines read agree.
 */
export function Breadcrumbs({
  trail,
}: {
  /** Full hrefs; the last item is the current page and isn't linked. */
  trail: { name: string; href: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-[0.82rem] text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-foreground">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="text-muted no-underline hover:text-foreground">
                    {item.name}
                  </Link>
                  <span aria-hidden>›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
