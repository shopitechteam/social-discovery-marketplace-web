import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The notice shown while referral rewards are paused. Plain type on a soft
 * fill, no icon: it is a status, not a promotion.
 *
 * Given `onOpen` or `href` it becomes the way into the referrals section, so a
 * referrer can still see who they brought in and what they will be paid.
 */
export function ReferralPausedBanner({
  className,
  compact = false,
  onOpen,
  href,
  active = false,
}: {
  className?: string;
  compact?: boolean;
  onOpen?: () => void;
  href?: string;
  /** The referrals section is open beside the menu (desktop only). */
  active?: boolean;
}) {
  const actionable = Boolean(onOpen || href);

  const body = (
    <>
      <p className={cn("font-semibold leading-tight text-main", compact ? "text-sm" : "text-base")}>
        Referral rewards are paused
      </p>
      <p className={cn("mt-1 leading-snug text-muted", compact ? "text-[13px]" : "text-sm")}>
        {compact
          ? "Qualified referrals are paid in full on the 28th of every month."
          : "We are reviewing referred-seller content because some posts do not meet Shopi marketplace guidelines. Qualified referrals are paid in full on the 28th of every month at 1:00 PM."}
      </p>
      {actionable && (
        <p
          className={cn(
            "mt-2.5 text-[13px] font-semibold underline underline-offset-2",
            active ? "text-main md:text-primary" : "text-main",
          )}
        >
          See your referrals and payouts
        </p>
      )}
    </>
  );

  const boxClass = cn(
    "block w-full rounded-xl bg-surface text-left",
    compact ? "px-4 py-3.5" : "px-4 py-4 sm:px-5",
    actionable && "transition-opacity hover:opacity-80 active:opacity-60",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={boxClass}>
        {body}
      </Link>
    );
  }

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-current={active ? "page" : undefined}
        className={boxClass}
      >
        {body}
      </button>
    );
  }

  return (
    <section aria-label="Referral update" className={boxClass}>
      {body}
    </section>
  );
}
