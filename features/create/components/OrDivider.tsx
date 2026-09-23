/** Dotted "- - - or - - -" separator between alternative ways to add media. */
export function OrDivider({
  label = "or",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const line =
    "h-0 flex-1 border-t-2 border-dotted border-[rgb(var(--color-border-strong))]";
  return (
    <div
      className={`flex items-center gap-3 text-xs font-semibold text-muted ${className}`}
    >
      <span aria-hidden className={line} />
      <span>{label}</span>
      <span aria-hidden className={line} />
    </div>
  );
}
