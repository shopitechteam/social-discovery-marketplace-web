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
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/features/messaging/hooks/usePushNotifications";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useMyProfile } from "../hooks/useMyProfile";
import { useMutation } from "@apollo/client/react";
import { DeleteMyAccountDocument } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { settingsSubPageHref } from "../lib/settingsReturn";
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
  neutral: "text-muted",
  brand: "text-primary",
  danger: "text-rose-600 dark:text-rose-400",
};

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-muted">
        {title}
      </h3>
      <div className="overflow-hidden border-y border-border">{children}</div>
    </section>
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
          "flex h-9 w-9 shrink-0 items-center justify-center",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span
        className="min-w-0 flex-1 truncate text-left font-semibold"
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
    "flex w-full items-center gap-3 px-0 py-3.5 transition-colors not-last:border-b";
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
  const { data: profileData } = useMyProfile();
  // Undefined while the profile loads. Treated as "no password" so the row
  // appears once we know it belongs there, rather than flashing in and out.
  const hasPassword = profileData?.me?.authProviders?.local === true;

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <section className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <h2 className="text-base font-black text-main md:text-lg">
            Settings
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Manage your account, appearance, notifications, and safety options.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-14">
          <div className="space-y-8">
        <SettingsGroup title="Account">
          <SettingsRow
            icon={UserRound}
            label="Edit profile"
            tone="brand"
            href={settingsSubPageHref(lang, "/profile/edit")}
          />
          <SettingsRow icon={Palette} label="Appearance" control={<ThemeToggle />} />
          {/* Only offered where the browser can actually do it. A dead toggle
              is worse than an absent one. */}
          {push.isSupported && (
            <SettingsRow
              icon={Bell}
              label="Push notifications"
              control={
                // The same Switch the Appearance row uses. The hand-rolled
                // version this replaces positioned its knob with translate
                // utilities that no longer resolved, so the thumb sat outside
                // the track and the row read as broken.
                <Switch
                  checked={push.isEnabled}
                  onCheckedChange={() => void push.toggle()}
                  disabled={push.isUpdating}
                  aria-label={
                    push.isEnabled
                      ? "Turn off push notifications"
                      : "Turn on push notifications"
                  }
                />
              }
            />
          )}
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow
            icon={ShieldCheck}
            label="Safety centre"
            href={`/${lang}/safety-centre`}
          />
          <SettingsRow
            icon={Star}
            label="Rate us"
            href={settingsSubPageHref(lang, "/profile/rate")}
          />
        </SettingsGroup>
          </div>

          <div className="space-y-8">
        <SettingsGroup title="Security">
          {/* Only for accounts with a password to change. Someone who signed
              up through Google or Apple has none, and the server rejects the
              mutation for them — so offering the row would just be a dead end
              with an error at the bottom of it. */}
          {hasPassword && (
            <SettingsRow
              icon={KeyRound}
              label="Change password"
              href={settingsSubPageHref(lang, "/profile/change-password")}
            />
          )}
          {!hasPassword && (
            <div className="py-3.5 text-sm leading-6 text-muted">
              Password settings are managed by your sign-in provider.
            </div>
          )}
        </SettingsGroup>

        <SettingsGroup title="Session and account">
          <SettingsRow
            icon={Trash2}
            label="Delete my account permanently"
            tone="danger"
            onClick={() => setConfirmDelete(true)}
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
        </div>
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

      <DeleteAccountDialog
        lang={lang}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
      />
    </section>
  );
}

/**
 * Closing an account. The guard is typing the word: it is deliberate enough to
 * rule out the mis-tap this row is one position away from (Log out sits
 * directly above it), without asking for a password that a Google or Apple
 * account does not have in the first place.
 */
const CONFIRM_WORD = "DELETE";

function DeleteAccountDialog({
  lang,
  open,
  onOpenChange,
}: {
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteAccount, { loading }] = useMutation(DeleteMyAccountDocument);

  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  async function handleDelete() {
    if (!confirmed || loading) return;
    setError(null);
    try {
      // The signed-in session is the proof of ownership; the typed word above
      // is the proof of intent.
      await deleteAccount({ variables: { password: null } });
      // Straight out, not through the logout mutation — the account is gone and
      // a full reload is the only way to be sure nothing cached survives.
      useAuthStore.getState().clearAuth();
      window.location.href = `/${lang}/for-you`;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not delete your account. Try again.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        if (!next) {
          setTyped("");
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This cannot be undone. Your listings, comments and saved items stop
            being visible, and you are signed out everywhere.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="delete-confirm"
              className="text-sm font-semibold text-default"
            >
              Type {CONFIRM_WORD} to confirm
            </label>
            <input
              id="delete-confirm"
              value={typed}
              autoComplete="off"
              onChange={(event) => setTyped(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-elevated px-3 font-medium text-default outline-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl px-3 py-2 text-sm font-medium"
              style={{
                backgroundColor: "rgb(var(--color-error) / 0.1)",
                color: "rgb(var(--color-error))",
              }}
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 rounded-full border border-border px-4 text-sm font-semibold text-default transition-colors hover:bg-surface disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={!confirmed || loading}
            className="h-10 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete account"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
