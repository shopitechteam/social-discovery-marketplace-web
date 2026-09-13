"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  KeyRound,
  LogOut,
  Palette,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { usePushNotifications } from "@/features/messaging/hooks/usePushNotifications";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { cn } from "@/lib/utils";

/**
 * The profile's Settings tab.
 *
 * A grouped list rather than a page of cards: every row is one setting, the
 * icon carries the recognition, and related rows sit together with a gap
 * between groups. It reads the way settings read on a phone, which is where
 * almost all of this traffic is.
 *
 * Destructive rows are visually separated into their own group at the bottom
 * rather than tinted red inline — colour on a row you scroll past twenty times
 * a week is noise, and the separation is what actually keeps a thumb off them.
 */

type RowTone = "neutral" | "brand" | "danger";

const TONE_CLASSES: Record<RowTone, string> = {
  // Slate, matching the muted icon tiles the rest of the app uses for
  // secondary actions.
  neutral: "bg-slate-400/20 text-slate-600 dark:text-slate-300",
  brand: "bg-primary/12 text-primary",
  danger: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "rgb(var(--color-bg-elevated))",
        borderColor: "rgb(var(--color-border))",
      }}
    >
      {children}
    </div>
  );
}

/**
 * One row. Renders as a link, a button, or a plain row with its own control on
 * the right — a toggle, say — depending on what it is given.
 */
function SettingsRow({
  icon: Icon,
  label,
  tone = "neutral",
  href,
  onClick,
  control,
  disabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone?: RowTone;
  href?: string;
  onClick?: () => void;
  /** Rendered on the right instead of a chevron. */
  control?: React.ReactNode;
  disabled?: boolean;
}) {
  const body = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span
        className="min-w-0 flex-1 truncate text-left font-medium"
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text))",
        }}
      >
        {label}
      </span>
      {control ?? (
        <ChevronRight
          className="h-5 w-5 shrink-0"
          style={{ color: "rgb(var(--color-text-muted))" }}
          aria-hidden
        />
      )}
    </>
  );

  // The row is 64px tall so the whole thing is a comfortable target, not just
  // the label.
  const rowClass =
    "flex w-full items-center gap-3.5 px-4 py-3.5 transition-colors not-last:border-b";
  const rowStyle = { borderColor: "rgb(var(--color-border))" };

  if (control) {
    return (
      <div className={rowClass} style={rowStyle}>
        {body}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cn(rowClass, "hover:bg-surface")} style={rowStyle}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(rowClass, "hover:bg-surface disabled:opacity-60")}
      style={rowStyle}
    >
      {body}
    </button>
  );
}

export function SettingsList({ lang }: { lang: string }) {
  const push = usePushNotifications(lang);
  const { logout, loading: loggingOut } = useLogout(lang);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <section className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <SettingsGroup>
          <SettingsRow
            icon={UserRound}
            label="Edit profile"
            tone="brand"
            href={`/${lang}/profile/edit`}
          />
          <SettingsRow icon={Palette} label="Appearance" control={<ThemeToggle />} />
          {/* Only offered where the browser can actually do it. A dead toggle
              is worse than an absent one. */}
          {push.isSupported && (
            <SettingsRow
              icon={Bell}
              label="Push notifications"
              control={
                <button
                  type="button"
                  onClick={() => void push.toggle()}
                  disabled={push.isUpdating}
                  aria-pressed={push.isEnabled}
                  aria-label={
                    push.isEnabled
                      ? "Turn off push notifications"
                      : "Turn on push notifications"
                  }
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
                    push.isEnabled ? "bg-primary" : "bg-slate-400/40",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      push.isEnabled ? "translate-x-5.5" : "translate-x-0.5",
                    )}
                  />
                </button>
              }
            />
          )}
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={ShieldCheck}
            label="Safety centre"
            href={`/${lang}/safety-centre`}
          />
          <SettingsRow icon={Star} label="Rate us" href={`/${lang}/contact`} />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={KeyRound}
            label="Change password"
            href={`/${lang}/auth/forgot-password`}
          />
          <SettingsRow
            icon={Trash2}
            label="Delete my account permanently"
            tone="danger"
            href={`/${lang}/contact`}
          />
          <SettingsRow
            icon={LogOut}
            label="Log out"
            tone="danger"
            onClick={() => setConfirmLogout(true)}
            disabled={loggingOut}
          />
        </SettingsGroup>
      </div>

      {/* Signing out drops the session and the feed position with it, and the
          row sits directly under a permanent-deletion row — a mis-tap there is
          worth one question. */}
      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You will need to sign in again to message sellers, save listings
              or post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              className="h-10 rounded-full border border-border px-4 text-sm font-semibold text-default transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut}
              className="h-10 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
