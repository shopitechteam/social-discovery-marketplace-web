"use client";

import Image from "next/image";
import { useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  Check,
  Copy,
  Gift,
  Loader2,
  Share2,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  ClaimReferralCodeDocument,
  MyReferralProgramDocument,
  SetReferralPayoutPhoneDocument,
  type ReferralPersonFieldsFragment,
  type ReferralProgramFieldsFragment,
} from "@/types/__generated__/graphql";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * "Invite & earn" — the referrer's side of the seller referral programme.
 *
 * Built around one number: how many of the next five sellers are already in.
 * The progress tracker leads, sharing sits right under it (the only action
 * that moves the number), and the details — each invited seller's listing
 * count, payouts, the rules — follow for whoever wants them.
 *
 * Every amount and threshold comes from `terms` on the server, so the copy
 * here can never promise a reward the programme does not pay.
 */

type Program = ReferralProgramFieldsFragment;
type Person = ReferralPersonFieldsFragment;

/** Date scalars arrive untyped from codegen; they are ISO strings on the wire. */
function day(value: unknown) {
  return dayjs(value as string | null | undefined);
}

function kes(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

function errorMessage(error: unknown, fallback: string): string {
  if (CombinedGraphQLErrors.is(error)) return error.errors[0]?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Safari denies the clipboard API outside a trusted gesture chain, and
    // every browser does over plain http — same fallback StoreTile uses.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function shareMessage(link: string) {
  return (
    "I sell on Shopi — posting is free, there's no commission, and buyers " +
    `message you directly. Sign up with my link and post your items: ${link}`
  );
}

/** "https://www.shopi.co.ke/invite/K7M2QX" → "shopi.co.ke/invite/K7M2QX" */
function displayLink(link: string) {
  return link.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

export function InviteEarnPanel() {
  const { data, loading, error, refetch } = useQuery(MyReferralProgramDocument, {
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <InviteEarnSkeleton />;

  const program = data?.myReferralProgram;
  if (!program) {
    return (
      <section className="px-4 py-12 text-center sm:px-6">
        <p className="text-sm text-muted">
          {error ? "Couldn’t load your invites." : "Nothing to show yet."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 h-10 rounded-full border border-border px-5 text-sm font-semibold text-main active:opacity-70"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-6">
      <ProgressCard program={program} />
      <ShareBlock program={program} />
      {(program.earnedKes > 0 || program.joinedCount > 0) && <EarningsRow program={program} />}
      <PayoutPhone program={program} />
      <HowItWorks program={program} />
      <InvitedSellers program={program} />
      {program.rewards.length > 0 && <RewardHistory program={program} />}
      {program.invitedBy && <InvitedByNote inviter={program.invitedBy} program={program} />}
      {program.canClaimCode && <ClaimCode program={program} />}
    </section>
  );
}

// ── Progress ─────────────────────────────────────────────────────────────────

function ProgressCard({ program }: { program: Program }) {
  const { terms, progressCount } = program;
  const remaining = terms.sellersPerReward - progressCount;

  // The sellers counting toward the next reward, newest first — whose faces
  // fill the slots. The server settles rewards on the oldest, so these are the
  // most recent qualifiers.
  const counting = program.referrals
    .filter((referral) => referral.status === "QUALIFIED")
    .sort((a, b) => day(b.qualifiedAt).valueOf() - day(a.qualifiedAt).valueOf())
    .slice(0, progressCount)
    .map((referral) => referral.seller);

  return (
    <div className="rounded-3xl bg-primary p-5 text-white">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
          <Gift className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
          Invite & earn
        </p>
        <h2 className="mt-2 text-[26px] font-black leading-tight">
          Earn {kes(terms.rewardKes)}
        </h2>
        <p className="mt-1 text-sm leading-snug text-white/90">
          for every {terms.sellersPerReward} sellers you bring to Shopi who post{" "}
          {terms.minListings} listings.
        </p>

        <div className="mt-5 flex items-center gap-2" aria-hidden>
          {Array.from({ length: terms.sellersPerReward }, (_, index) => {
            const seller = counting[index];
            return seller ? (
              <SlotAvatar key={seller.id} person={seller} />
            ) : (
              <span
                key={`empty-${index}`}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-white/55 text-white/70"
              >
                <UserPlus className="h-4.5 w-4.5" strokeWidth={2} />
              </span>
            );
          })}
        </div>

        <p className="mt-3 text-sm font-semibold" aria-live="polite">
          <span className="text-lg font-black tabular-nums">{progressCount}</span>
          <span className="text-white/85"> / {terms.sellersPerReward} sellers</span>
          <span className="font-medium text-white/85">
            {" "}
            · {remaining === 1 ? "1 more to go" : `${remaining} more to go`}
          </span>
        </p>
        {program.pendingCount > 0 && (
          <p className="mt-1 text-xs text-white/85">
            {program.pendingCount === 1
              ? "1 seller has joined and is still posting."
              : `${program.pendingCount} sellers have joined and are still posting.`}
          </p>
        )}
      </div>
    </div>
  );
}

function SlotAvatar({ person }: { person: Person }) {
  return person.avatar ? (
    <span className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-white">
      <Image src={person.avatar} alt="" fill sizes="44px" className="object-cover" />
    </span>
  ) : (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-black text-primary ring-2 ring-white">
      {initials(person.displayName)}
    </span>
  );
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

// ── Sharing ──────────────────────────────────────────────────────────────────

function ShareBlock({ program }: { program: Program }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy(kind: "link" | "code") {
    await copyText(kind === "link" ? program.link : program.code);
    setCopied(kind);
    toast.success(kind === "link" ? "Invite link copied" : "Invite code copied");
    window.setTimeout(() => setCopied((current) => (current === kind ? null : current)), 2000);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Sell on Shopi", text: shareMessage(program.link) });
    } catch (error) {
      // Dismissing the share sheet is a choice, not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy("link");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareMessage(program.link))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#eee] text-base font-bold text-main transition-opacity active:opacity-70 dark:bg-subtle"
      >
        <WhatsAppIcon className="h-5.5 w-5.5" />
        Invite on WhatsApp
      </a>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-elevated p-1.5 pl-4">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-main" title={program.link}>
          {displayLink(program.link)}
        </p>
        <button
          type="button"
          onClick={() => void copy("link")}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-surface px-4 text-sm font-semibold text-main transition-opacity active:opacity-70"
        >
          {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === "link" ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void copy("code")}
          className="inline-flex items-center gap-2 text-sm text-muted active:opacity-70"
          aria-label={`Copy your invite code ${program.code}`}
        >
          Your code
          <span className="rounded-lg bg-surface px-2.5 py-1 font-mono text-sm font-bold tracking-[0.2em] text-main">
            {program.code}
          </span>
          {copied === "code" && <Check className="h-4 w-4 text-main" aria-hidden />}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-semibold text-main active:opacity-70"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            More
          </button>
        )}
      </div>
    </div>
  );
}

// ── Earnings & payout ────────────────────────────────────────────────────────

function EarningsRow({ program }: { program: Program }) {
  const tiles = [
    { label: "Earned", value: kes(program.earnedKes) },
    { label: "Paid out", value: kes(program.paidKes) },
    { label: "On its way", value: kes(program.pendingPayoutKes) },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl border border-border bg-elevated px-3 py-3">
          <p className="text-xs text-muted">{tile.label}</p>
          <p className="mt-0.5 truncate text-base font-black tabular-nums text-main">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}

function PayoutPhone({ program }: { program: Program }) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [savePhone, { loading }] = useMutation(SetReferralPayoutPhoneDocument, {
    update(cache, { data }) {
      if (!data) return;
      cache.writeQuery({
        query: MyReferralProgramDocument,
        data: { myReferralProgram: data.setReferralPayoutPhone },
      });
    },
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!phone.trim() || loading) return;
    try {
      await savePhone({ variables: { phone } });
      toast.success("M-Pesa number saved");
      setEditing(false);
      setPhone("");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t save that number."));
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="payout-phone" className="text-sm font-semibold text-main">
          M-Pesa number for your rewards
        </label>
        <div className="flex gap-2">
          <input
            id="payout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0712 345 678"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-elevated px-3 font-medium text-main outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!phone.trim() || loading}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="self-start text-sm text-muted active:opacity-70"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <Smartphone className="h-5 w-5 shrink-0 text-main" strokeWidth={1.8} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">Rewards are sent to M-Pesa</p>
        <p className="truncate text-sm font-semibold text-main">
          {program.payoutPhone ?? "Add the number to pay"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 text-sm font-semibold text-main underline underline-offset-2 active:opacity-70"
      >
        {program.payoutPhone ? "Change" : "Add"}
      </button>
    </div>
  );
}

// ── Rules ────────────────────────────────────────────────────────────────────

function HowItWorks({ program }: { program: Program }) {
  const { terms } = program;
  const steps = [
    "Share your link with people who have things to sell.",
    `They sign up with your link and post ${terms.minListings} listings.`,
    `Every ${terms.sellersPerReward} sellers who do earns you ${kes(terms.rewardKes)} on M\u2011Pesa.`,
  ];
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-main">How it works</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-main">
              {index + 1}
            </span>
            <span className="pt-0.5 text-sm leading-snug text-main">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Only new Shopi accounts count, and only real listings. We check each seller before
        paying, so fake accounts or listings won’t earn a reward.
      </p>
    </div>
  );
}

// ── Invited sellers ──────────────────────────────────────────────────────────

function InvitedSellers({ program }: { program: Program }) {
  const { referrals, terms } = program;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold text-main">Your sellers</h3>
        {program.joinedCount > 0 && (
          <p className="text-xs text-muted">
            {program.qualifiedCount} of {program.joinedCount} qualified
          </p>
        )}
      </div>

      {referrals.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm font-semibold text-main">No sellers yet</p>
          <p className="mt-1 text-sm text-muted">
            Sellers who sign up with your link show up here, with how many listings they’ve
            posted.
          </p>
        </div>
      ) : (
        <ul className="mt-2">
          {referrals.map((referral) => (
            <li key={referral.id} className="flex items-center gap-3 py-2.5">
              <PersonAvatar person={referral.seller} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-main">
                  {referral.seller.displayName}
                </p>
                <p className="text-xs text-muted">Joined {day(referral.joinedAt).format("D MMM YYYY")}</p>
              </div>
              <SellerStatus
                status={referral.status}
                listingCount={referral.listingCount}
                minListings={terms.minListings}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SellerStatus({
  status,
  listingCount,
  minListings,
}: {
  status: Program["referrals"][number]["status"];
  listingCount: number;
  minListings: number;
}) {
  if (status === "QUALIFIED") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-main">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        Qualified
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="shrink-0 text-xs font-medium text-muted">Doesn’t count</span>
    );
  }
  const shown = Math.min(listingCount, minListings);
  return (
    <div className="flex w-24 shrink-0 flex-col items-end gap-1">
      <span className="text-xs font-semibold tabular-nums text-main">
        {shown}/{minListings} listings
      </span>
      <span
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={minListings}
        aria-valuenow={shown}
        aria-label="Listings posted"
      >
        <span
          className="block h-full rounded-full bg-main transition-[width]"
          style={{ width: `${(shown / minListings) * 100}%` }}
        />
      </span>
    </div>
  );
}

function PersonAvatar({ person, size = 40 }: { person: Person; size?: number }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {person.avatar ? (
        <Image src={person.avatar} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-surface text-xs font-bold text-main">
          {initials(person.displayName)}
        </span>
      )}
    </span>
  );
}

// ── Rewards ──────────────────────────────────────────────────────────────────

function RewardHistory({ program }: { program: Program }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-main">Rewards</h3>
      <ul className="mt-2">
        {program.rewards.map((reward) => (
          <li key={reward.id} className="flex items-center gap-3 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-main">
              <Gift className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-main">{kes(reward.amountKes)}</p>
              <p className="truncate text-xs text-muted">
                {reward.status === "PAID"
                  ? `Paid ${day(reward.paidAt).format("D MMM YYYY")}${reward.mpesaReference ? ` · M-Pesa ${reward.mpesaReference}` : ""}`
                  : reward.status === "CANCELLED"
                    ? "Withdrawn — a seller behind it didn’t qualify"
                    : `Earned ${day(reward.earnedAt).format("D MMM YYYY")}`}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-semibold",
                reward.status === "CANCELLED" ? "text-muted" : "text-main",
              )}
            >
              {reward.status === "PAID" ? "Paid" : reward.status === "CANCELLED" ? "Withdrawn" : "On its way"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── The viewer's own inviter ─────────────────────────────────────────────────

function InvitedByNote({ inviter, program }: { inviter: Person; program: Program }) {
  const firstName = inviter.displayName.split(" ")[0];
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <PersonAvatar person={inviter} size={36} />
      <p className="text-sm leading-snug text-main">
        <span className="font-semibold">{inviter.displayName}</span> invited you to Shopi. Post{" "}
        {program.terms.minListings} listings to help {firstName} earn their reward.
      </p>
    </div>
  );
}

function ClaimCode({ program }: { program: Program }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [claim, { loading }] = useMutation(ClaimReferralCodeDocument, {
    update(cache, { data }) {
      if (!data) return;
      cache.writeQuery({
        query: MyReferralProgramDocument,
        data: { myReferralProgram: data.claimReferralCode },
      });
    },
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || loading) return;
    try {
      const { data } = await claim({ variables: { code } });
      const inviter = data?.claimReferralCode.invitedBy?.displayName;
      toast.success(inviter ? `Thanks! ${inviter} gets the credit.` : "Invite code added");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t add that code."));
    }
  }

  const deadline = program.claimDeadline ? day(program.claimDeadline).format("D MMM") : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-muted underline underline-offset-2 active:opacity-70"
      >
        Did someone invite you? Enter their code
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-2xl border border-border p-4">
      <label htmlFor="claim-code" className="text-sm font-semibold text-main">
        Who invited you?
      </label>
      <p className="text-xs text-muted">
        Enter their invite code so they get the credit
        {deadline ? ` — you can add it until ${deadline}` : ""}.
      </p>
      <div className="flex gap-2">
        <input
          id="claim-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="K7M2QX"
          maxLength={6}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-elevated px-3 font-mono font-bold tracking-[0.2em] text-main outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={code.trim().length < 6 || loading}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add
        </button>
      </div>
    </form>
  );
}

// ── Loading ──────────────────────────────────────────────────────────────────

function InviteEarnSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-6">
      <Skeleton className="h-56 rounded-3xl" />
      <Skeleton className="h-13 rounded-2xl" />
      <Skeleton className="h-13 rounded-2xl" />
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
