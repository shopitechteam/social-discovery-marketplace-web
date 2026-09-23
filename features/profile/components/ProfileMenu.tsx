"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChartColumn,
  ChevronRight,
  Eye,
  FileEdit,
  KeyRound,
  LayoutGrid,
  LogOut,
  Moon,
  ShieldCheck,
  Star,
  Trash2,
  UserPen,
  Users,
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
import { useMutation } from "@apollo/client/react";
import {
  DeleteMyAccountDocument,
  type ProfileUserFieldsFragment,
} from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { settingsSubPageHref } from "../lib/settingsReturn";
import { cn } from "@/lib/utils";

/**
 * The profile's menu: one grouped list holding everything the profile offers,
 * from the user's own posts down to logging out.
 *
 * It replaces a row of icon tabs. Five unlabelled icons was the ceiling for a
 * phone's width, and the icons alone didn't say what they were. A list takes a
 * new item without a redesign, and every row names itself.
 *
 * On a phone it is the whole screen, and a row drills into its section. On
 * desktop it is a sidebar next to the open section, with that row highlighted.
 */

/** Sections that open inside the profile page rather than on their own route. */
export type ProfileSection = "posts" | "drafts" | "saved" | "analytics";

export const PROFILE_SECTION_LABELS: Record<ProfileSection, string> = {
  posts: "My posts",
  drafts: "Drafts",
  saved: "Saved",
  analytics: "Analytics",
};

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;

function formatCount(value: number | null | undefined) {
  if (value == null) return undefined;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function MenuGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {title ? (
        <h3 className="mb-0.5 text-[15px] font-semibold text-main md:text-base">{title}</h3>
      ) : null}
      <div>{children}</div>
    </section>
  );
}

/**
 * One row. A section row is a button that opens that section; otherwise it is
 * a link, an action, or a row carrying its own control (a switch) in place of
 * the chevron.
 */
function MenuRow({
  icon: RowIcon,
  label,
  meta,
  active,
  danger,
  href,
  onClick,
  control,
  disabled,
}: {
  icon: Icon;
  label: string;
  /** Small muted value before the chevron, like a count. */
  meta?: string;
  /**
   * The section open beside the menu. Coloured on desktop only: on a phone the
   * menu is its own screen with nothing open beside it, so marking a row there
   * reads as a stray highlight.
   */
  active?: boolean;
  danger?: boolean;
  href?: string;
  onClick?: () => void;
  control?: React.ReactNode;
  disabled?: boolean;
}) {
  const body = (
    <>
      <RowIcon
        className={cn(
          "h-5 w-5 shrink-0 md:h-5.5 md:w-5.5",
          danger
            ? "text-rose-600 dark:text-rose-400"
            : active
              ? "text-main md:text-primary"
              : "text-main",
        )}
        strokeWidth={1.7}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-left text-sm font-normal md:text-[15px]",
          danger
            ? "text-rose-600 dark:text-rose-400"
            : active
              ? "text-main md:text-primary"
              : "text-main",
        )}
      >
        {label}
      </span>
      {meta ? (
        <span className="shrink-0 text-[13px] tabular-nums text-muted md:text-sm">
          {meta}
        </span>
      ) : null}
      {control ?? (
        <ChevronRight
          className={cn(
            "h-4.5 w-4.5 shrink-0",
            active ? "text-main md:text-primary" : "text-main",
          )}
          strokeWidth={1.8}
          aria-hidden
        />
      )}
    </>
  );

  // Every row is the same height (48px on a phone, 52px on desktop), with no
  // boxes or dividers: the even rhythm and the icons are what group the list.
  // Feedback is an opacity dip on press, and the desktop's open section is
  // marked by colour alone.
  const rowClass =
    "flex h-12 w-full items-center gap-3.5 transition-opacity md:h-13 md:gap-4";

  if (control) {
    return <div className={rowClass}>{body}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={cn(rowClass, "hover:opacity-75 active:opacity-50")}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={cn(
        rowClass,
        "hover:opacity-75 active:opacity-50 disabled:opacity-50",
      )}
    >
      {body}
    </button>
  );
}

export function ProfileMenu({
  lang,
  user,
  active,
  onSelect,
}: {
  lang: string;
  user: ProfileUserFieldsFragment;
  /** Highlighted section; only shown on desktop, where the menu is a sidebar. */
  active: ProfileSection | null;
  onSelect: (section: ProfileSection) => void;
}) {
  const push = usePushNotifications(lang);
  const { logout, loading: loggingOut } = useLogout(lang);
  // Accounts from Google or Apple have no password to change, and the server
  // rejects the mutation for them, so the row would only lead to an error.
  const hasPassword = user.authProviders?.local === true;

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const section = (key: ProfileSection, icon: Icon, meta?: string) => (
    <MenuRow
      icon={icon}
      label={PROFILE_SECTION_LABELS[key]}
      meta={meta}
      active={active === key}
      onClick={() => onSelect(key)}
    />
  );

  return (
    <nav aria-label="Profile menu" className="flex flex-col gap-6 md:gap-7">
      <MenuGroup title="Your content">
        {section("posts", LayoutGrid, formatCount(user.postCount))}
        {section("drafts", FileEdit)}
        {section("saved", Bookmark)}
      </MenuGroup>

      <MenuGroup title="Audience">
        {section("analytics", ChartColumn)}
        <MenuRow
          icon={Users}
          label="Followers"
          meta={formatCount(user.followerCount)}
          href={`/${lang}/profile/followers`}
        />
        <MenuRow
          icon={Eye}
          label="Profile visitors"
          href={`/${lang}/profile/visitors`}
        />
      </MenuGroup>

      <MenuGroup title="Account">
        <MenuRow
          icon={UserPen}
          label="Edit profile"
          href={settingsSubPageHref(lang, "/profile/edit")}
        />
        {hasPassword && (
          <MenuRow
            icon={KeyRound}
            label="Change password"
            href={settingsSubPageHref(lang, "/profile/change-password")}
          />
        )}
        <MenuRow icon={Moon} label="Dark mode" control={<ThemeToggle />} />
        {/* Only offered where the browser can actually do it. A dead toggle
            is worse than an absent one. */}
        {push.isSupported && (
          <MenuRow
            icon={Bell}
            label="Push notifications"
            control={
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
      </MenuGroup>

      <MenuGroup title="Support">
        <MenuRow
          icon={ShieldCheck}
          label="Safety centre"
          href={`/${lang}/safety-centre`}
        />
        <MenuRow
          icon={Star}
          label="Rate us"
          href={settingsSubPageHref(lang, "/profile/rate")}
        />
      </MenuGroup>

      {/* Destructive rows sit apart at the bottom rather than tinted inline
          among the rest — the separation is what keeps a thumb off them. */}
      <MenuGroup>
        <MenuRow
          icon={LogOut}
          label="Log out"
          danger
          onClick={() => setConfirmLogout(true)}
          disabled={loggingOut}
        />
        <MenuRow
          icon={Trash2}
          label="Delete account"
          danger
          onClick={() => setConfirmDelete(true)}
        />
      </MenuGroup>

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
    </nav>
  );
}

/**
 * Closing an account. The guard is typing the word: it is deliberate enough to
 * rule out a mis-tap on the row beside Log out, without asking for a password
 * that a Google or Apple account does not have in the first place.
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
