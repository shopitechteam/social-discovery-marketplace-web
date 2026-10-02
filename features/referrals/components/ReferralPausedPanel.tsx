"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client/react";
import {
  MyReferralProgramDocument,
  type ReferralPersonFieldsFragment,
  type ReferralProgramFieldsFragment,
} from "@/types/__generated__/graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PayoutPhone } from "./InviteEarnPanel";
import { ReferralPausedBanner } from "./ReferralPausedBanner";

/**
 * The referrals section while rewards are paused. It stands in for
 * InviteEarnPanel (swap the two in ProfileView to bring sharing back): no
 * invite link to share, but every referral the user already made is listed
 * with what it pays, and when.
 */

type Program = ReferralProgramFieldsFragment;
type Person = ReferralPersonFieldsFragment;
type Reward = Program["rewards"][number];

function kes(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

/** Date scalars arrive untyped from codegen; they are ISO strings on the wire. */
function day(value: unknown) {
  return dayjs(value as string | null | undefined);
}

/** Payouts go out on the 28th of every month at 1:00 PM. */
function nextPayout() {
  const now = dayjs();
  const thisMonth = now.date(28).hour(13).minute(0).second(0).millisecond(0);
  return now.isBefore(thisMonth) ? thisMonth : thisMonth.add(1, "month");
}

function initials(name: string) {
  const letters = name
    .replace(/^@/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "S";
}

const column = "mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-5 sm:px-6 md:py-6";

export function ReferralPausedPanel() {
  const { data, loading, error, refetch } = useQuery(MyReferralProgramDocument, {
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <ReferralPausedSkeleton />;

  const program = data?.myReferralProgram;
  if (!program) {
    return (
      <section className={column}>
        <ReferralPausedBanner />
        <div className="text-center">
          <p className="text-sm text-muted">
            {error ? "Couldn’t load your referrals." : "No referral details yet."}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 h-10 rounded-full border border-border px-5 text-sm font-semibold text-main active:opacity-70"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={column}>
      <ReferralPausedBanner />
      <PayoutSummary program={program} />
      <InviteLinkPaused />
      <PayoutPhone program={program} />
      <Referrals program={program} />
    </section>
  );
}

// ── What the user is owed ────────────────────────────────────────────────────

function PayoutSummary({ program }: { program: Program }) {
  const stats = [
    { label: "Referrals", value: String(program.joinedCount) },
    { label: "Qualified", value: String(program.qualifiedCount) },
    { label: "Paid so far", value: kes(program.paidKes) },
  ];

  return (
    <div>
      <p className="text-sm text-muted">To be paid</p>
      <p className="mt-1 text-[32px] font-bold leading-none tabular-nums text-main">
        {kes(program.pendingPayoutKes)}
      </p>
      <p className="mt-2 text-sm text-muted">
        {program.pendingPayoutKes > 0 ? "Paying out" : "Next payout"}{" "}
        {nextPayout().format("D MMM [at] h:mm A")}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="truncate text-xs text-muted">{stat.label}</dt>
            <dd className="mt-1 truncate text-base font-semibold tabular-nums text-main">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Where InviteEarnPanel shows the share link — kept in place, saying why it's gone. */
function InviteLinkPaused() {
  return (
    <div>
      <p className="text-sm font-semibold text-main">Your invite link</p>
      <p className="mt-2 rounded-xl border border-border px-4 py-3 text-sm text-muted">
        Referral paused
      </p>
    </div>
  );
}

// ── Each referral and what it pays ───────────────────────────────────────────

function Referrals({ program }: { program: Program }) {
  const { referrals, rewards, terms } = program;
  // A qualified referral earns one reward; match them by seller.
  const rewardBySeller = new Map(
    rewards.filter((reward) => reward.seller).map((reward) => [reward.seller!.id, reward]),
  );

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-main">Your referrals</h3>
        {program.joinedCount > 0 && (
          <p className="text-xs text-muted">
            {program.qualifiedCount} of {program.joinedCount} qualified
          </p>
        )}
      </div>

      {referrals.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Sellers who joined with your link will show here.
        </p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {referrals.map((referral) => (
            <li key={referral.id} className="flex items-center gap-3 py-3">
              <PersonAvatar person={referral.seller} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-main">
                  {referral.seller.displayName}
                </p>
                <p className="text-xs text-muted">
                  Joined {day(referral.joinedAt).format("D MMM YYYY")}
                </p>
              </div>
              <ReferralPayout
                status={referral.status}
                reward={rewardBySeller.get(referral.seller.id)}
                listingCount={referral.listingCount}
                minListings={terms.minListings}
                rewardKes={terms.rewardKes}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The amount on the right of a referral, and where that money stands. */
function ReferralPayout({
  status,
  reward,
  listingCount,
  minListings,
  rewardKes,
}: {
  status: Program["referrals"][number]["status"];
  reward: Reward | undefined;
  listingCount: number;
  minListings: number;
  rewardKes: number;
}) {
  let amount = 0;
  let note: string;
  let settled = false;

  if (status === "REJECTED" || reward?.status === "CANCELLED") {
    note = "Not payable";
  } else if (reward?.status === "PAID") {
    amount = reward.amountKes;
    note = `Paid ${day(reward.paidAt).format("D MMM")}`;
    settled = true;
  } else if (status === "QUALIFIED") {
    amount = reward?.amountKes ?? rewardKes;
    note = "To be paid";
  } else {
    note = `${Math.min(listingCount, minListings)}/${minListings} listings`;
  }

  return (
    <div className="shrink-0 text-right">
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          amount > 0 ? "text-main" : "text-muted",
        )}
      >
        {kes(amount)}
      </p>
      <p className={cn("text-xs", settled ? "text-success" : "text-muted")}>{note}</p>
    </div>
  );
}

function PersonAvatar({ person }: { person: Person }) {
  return (
    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface">
      {person.avatar ? (
        <Image src={person.avatar} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-main">
          {initials(person.displayName)}
        </span>
      )}
    </span>
  );
}

function ReferralPausedSkeleton() {
  return (
    <section className={column}>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}
