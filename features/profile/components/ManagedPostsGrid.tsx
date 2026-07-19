"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bookmark,
  CircleAlert,
  Eye,
  Globe,
  Loader2,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SHIMMER_PORTRAIT } from "@/lib/shimmer";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CategoryPickerDrawer } from "@/features/create/components/CategoryPickerDrawer";
import {
  useManagedPostMutations,
  type ManagedPost,
} from "../hooks/useManagedPosts";

interface Props {
  posts: ManagedPost[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  lang: string;
  onRefresh: () => Promise<unknown> | void;
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatPrice(amount: number, currency: string) {
  if (amount <= 0) return "Custom";
  return `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });
}

function getPostThumb(post: ManagedPost) {
  const firstMedia = post.media?.[0];
  if (post.type === "IMAGE") {
    return (
      firstMedia?.r2Variants?.find((v) => v.variant === "original")?.url ??
      firstMedia?.r2Variants?.find((v) => v.variant === "large")?.url ??
      firstMedia?.r2Variants?.find((v) => v.variant === "medium")?.url ??
      firstMedia?.url ??
      firstMedia?.r2Variants?.[0]?.url ??
      firstMedia?.thumbnailUrl ??
      null
    );
  }

  const muxPlaybackId = firstMedia?.muxMeta?.playbackId;
  const muxDerivedThumb = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=0&width=540&fit_mode=smartcrop`
    : null;

  return (
    firstMedia?.muxMeta?.thumbnailUrl ??
    firstMedia?.thumbnailUrl ??
    firstMedia?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    firstMedia?.r2Variants?.[0]?.url ??
    firstMedia?.url ??
    muxDerivedThumb ??
    null
  );
}

function statusCopy(post: ManagedPost) {
  switch (post.status) {
    case "ACTIVE":
      return {
        label: post.isLive ? "Live" : "Approved",
        tone: "success",
        helper: post.isLive ? "Visible to buyers" : "Awaiting media ready",
      } as const;
    case "PENDING_REVIEW":
      return {
        label: "Pending review",
        tone: "warning",
        helper: "Waiting for approval",
      } as const;
    case "PROCESSING":
      return {
        label: "Processing",
        tone: "info",
        helper: "Preparing media",
      } as const;
    case "REJECTED":
      return {
        label: "Rejected",
        tone: "danger",
        helper: "Needs changes before relisting",
      } as const;
    case "FAILED":
      return {
        label: "Failed",
        tone: "danger",
        helper: "Needs a retry or update",
      } as const;
    case "UNDER_REVIEW":
      return {
        label: "Under review",
        tone: "warning",
        helper: "Moderation is checking it",
      } as const;
    default:
      return {
        label: "Draft",
        tone: "neutral",
        helper: "Not visible yet",
      } as const;
  }
}

function toneClasses(
  tone: "success" | "warning" | "danger" | "info" | "neutral",
) {
  switch (tone) {
    case "success":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    case "danger":
      return "bg-rose-500/10 text-rose-700 border-rose-500/20";
    case "info":
      return "bg-sky-500/10 text-sky-700 border-sky-500/20";
    default:
      return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  }
}

function visibilityLabel(visibility: ManagedPost["visibility"]) {
  return visibility === "PUBLIC" ? "Shown" : "Hidden";
}

function InventoryCard({
  post,
  lang,
  priority,
  onOpenActions,
}: {
  post: ManagedPost;
  lang: string;
  priority: boolean;
  onOpenActions: (post: ManagedPost) => void;
}) {
  const thumb = getPostThumb(post);
  const isVideo = post.type === "VIDEO";
  const status = statusCopy(post);

  return (
    <article
      className="overflow-hidden rounded-[20px] border"
      style={{
        borderColor: "rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-elevated))",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="relative aspect-[0.94]">
        <Link
          href={`/${lang}/profile/posts/${post.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Open insights for ${post.title}`}
        />

        {thumb ? (
          <Image
            src={thumb}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={SHIMMER_PORTRAIT}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
          >
            <span
              className="px-4 text-center font-medium"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              No preview yet
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.75 text-[10px] font-semibold backdrop-blur",
                toneClasses(status.tone),
              )}
            >
              {status.label}
            </span>
            <span className="rounded-full border border-black/10 bg-white/88 px-2 py-0.75 text-[10px] font-semibold text-slate-700 backdrop-blur">
              {visibilityLabel(post.visibility)}
            </span>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenActions(post);
            }}
            className="relative z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-transform active:scale-95"
            aria-label={`Manage ${post.title}`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
              <Play
                size={20}
                fill="currentColor"
                strokeWidth={0}
                className="ml-0.5"
              />
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/78 via-black/30 to-transparent p-2.5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-[13px] font-semibold sm:text-sm">
                {post.title || "Untitled post"}
              </p>
              <p className="mt-0.5 text-[10px] text-white/80 sm:text-[11px]">
                Updated {formatDate(post.updatedAt)}
              </p>
            </div>
            <p className="shrink-0 text-[13px] font-bold sm:text-sm">
              {formatPrice(post.price.amount, post.price.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-bg-subtle))] px-2 py-1">
            <Eye size={12} />
            {formatCompact(post.stats.views)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-bg-subtle))] px-2 py-1">
            <Bookmark size={12} />
            {formatCompact(post.stats.saves)}
          </span>
          {post.price.negotiable && (
            <span className="inline-flex items-center rounded-full bg-[rgb(var(--brand-primary)_/_0.1)] px-2 py-1 text-[10px] font-semibold text-[rgb(var(--brand-primary))] sm:text-[11px]">
              Negotiable
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <p
            className="min-w-0 line-clamp-2"
            style={{
              fontSize: "12px",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {post.approval?.rejectionReason && post.status === "REJECTED"
              ? post.approval.rejectionReason
              : status.helper}
          </p>

          <Link
            href={`/${lang}/profile/posts/${post.id}`}
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors hover:bg-surface sm:text-[11px]"
            style={{
              borderColor: "rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
            }}
          >
            Insights
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: "15px",
                color: "rgb(var(--color-text))",
              }}
            >
              {title}
            </h2>
            <p
              className="mt-1"
              style={{
                fontSize: "13px",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {subtitle}
            </p>
          </div>
          {right}
        </div>
        {children}
      </div>
    </section>
  );
}

type EditFormState = {
  title: string;
  caption: string;
  amount: string;
  currency: string;
  negotiable: boolean;
  categoryId: string | null;
  categoryLabel: string | null;
};

export function ManagedPostsGrid({
  posts,
  hasMore,
  onLoadMore,
  loading,
  lang,
  onRefresh,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const isDesktop = useIsDesktop({ ssrDefault: false });
  const [actionsPost, setActionsPost] = useState<ManagedPost | null>(null);
  const [editingPost, setEditingPost] = useState<ManagedPost | null>(null);
  const [deletePost, setDeletePost] = useState<ManagedPost | null>(null);
  const [editState, setEditState] = useState<EditFormState | null>(null);
  const {
    updatePost,
    setHidden,
    deletePost: removePost,
    loading: mutationBusy,
  } = useManagedPostMutations();

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, posts.length]);

  const openEdit = (post: ManagedPost) => {
    setActionsPost(null);
    setEditingPost(post);
    setEditState({
      title: post.title ?? "",
      caption: post.caption ?? "",
      amount: String(post.price.amount ?? 0),
      currency: post.price.currency ?? "KES",
      negotiable: post.price.negotiable ?? false,
      categoryId: post.categoryId ?? null,
      categoryLabel: null,
    });
  };

  async function refreshAndClose() {
    await onRefresh();
    setActionsPost(null);
  }

  async function handleToggleHidden(post: ManagedPost) {
    try {
      const hidden = post.visibility === "PUBLIC";
      await setHidden({
        variables: { contentId: post.id, hidden },
      });
      toast.success(hidden ? "Post hidden" : "Post shown again");
      await refreshAndClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update visibility",
      );
    }
  }

  async function handleDelete() {
    if (!deletePost) return;
    try {
      await removePost({ variables: { contentId: deletePost.id } });
      toast.success("Post deleted");
      setDeletePost(null);
      setActionsPost(null);
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  }

  async function handleSaveEdit() {
    if (!editingPost || !editState) return;
    const parsedAmount = Number(editState.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast.error("Enter a valid price");
      return;
    }

    try {
      await updatePost({
        variables: {
          contentId: editingPost.id,
          input: {
            title: editState.title.trim(),
            caption: editState.caption.trim(),
            categoryId: editState.categoryId,
            price: {
              amount: parsedAmount,
              currency: editState.currency.trim() || "KES",
              negotiable: editState.negotiable,
            },
          },
        },
      });
      toast.success("Post updated");
      setEditingPost(null);
      setEditState(null);
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  }

  const createdCountLabel =
    posts.length === 1
      ? "1 post in your inventory"
      : `${posts.length} posts in your inventory`;

  const actionItems = useMemo(() => {
    if (!actionsPost) return [];
    return [
      {
        key: "insights",
        label: "Open insights",
        href: `/${lang}/profile/posts/${actionsPost.id}`,
        icon: BarChart3,
      },
      {
        key: "visit",
        label: "Visit listing",
        href: `/${lang}/content/${actionsPost.id}`,
        icon: Globe,
      },
    ];
  }, [actionsPost, lang]);

  if (posts.length === 0 && loading) {
    return (
      <SectionShell
        title="Manage posts"
        subtitle="Loading your seller inventory"
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-5 xl:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[22px] border"
              style={{
                borderColor: "rgb(var(--color-border))",
                backgroundColor: "rgb(var(--color-bg-elevated))",
              }}
            >
              <Skeleton className="aspect-[0.94] w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <SectionShell
        title="Manage posts"
        subtitle="Edit pricing, manage visibility, and keep track of performance in one place."
      >
        <div className="flex min-h-80 flex-col items-center justify-center rounded-[24px] border px-6 py-12 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary) / 0.14), rgb(var(--brand-secondary) / 0.18))",
              color: "rgb(var(--brand-primary))",
            }}
          >
            <Plus size={28} />
          </div>
          <h3
            className="font-bold"
            style={{
              fontSize: "var(--text-lg)",
              color: "rgb(var(--color-text))",
            }}
          >
            No inventory yet
          </h3>
          <p
            className="mt-2 max-w-sm leading-relaxed"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Post your first item and you will be able to edit the price,
            description, title, negotiable setting, and category from here.
          </p>
          <Link
            href={`/${lang}/upload`}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            }}
          >
            <Plus size={16} />
            Create post
          </Link>
        </div>
      </SectionShell>
    );
  }

  return (
    <>
      <SectionShell
        title="Manage posts"
        subtitle={createdCountLabel}
        right={
          <Link
            href={`/${lang}/upload`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 font-semibold text-white"
            style={{
              fontSize: "13px",
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            }}
          >
            <Plus size={16} />
            Create
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-4">
          {posts.map((post, index) => (
            <InventoryCard
              key={post.id}
              post={post}
              lang={lang}
              priority={index < 6}
              onOpenActions={setActionsPost}
            />
          ))}
        </div>

        <div ref={sentinelRef} className="h-px" />
        {hasMore && loading && (
          <div className="flex justify-center py-6 text-sm text-muted-foreground">
            Loading more posts...
          </div>
        )}
      </SectionShell>

      <ActionSurface
        desktop={isDesktop}
        post={actionsPost}
        busy={mutationBusy}
        onClose={() => setActionsPost(null)}
      >
        {actionsPost && (
          <div className="space-y-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex min-h-13 items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-surface"
                  style={{ borderColor: "rgb(var(--color-border))" }}
                  onClick={() => setActionsPost(null)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--color-bg-subtle))]">
                    <Icon size={18} />
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => actionsPost && openEdit(actionsPost)}
              className="flex min-h-13 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-surface"
              style={{ borderColor: "rgb(var(--color-border))" }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--color-bg-subtle))]">
                <Pencil size={18} />
              </span>
              <span className="font-semibold">Edit post</span>
            </button>

            <button
              type="button"
              disabled={mutationBusy}
              onClick={() =>
                actionsPost && void handleToggleHidden(actionsPost)
              }
              className="flex min-h-13 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-surface disabled:opacity-60"
              style={{ borderColor: "rgb(var(--color-border))" }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--color-bg-subtle))]">
                <Globe size={18} />
              </span>
              <span className="font-semibold">
                {actionsPost.visibility === "PUBLIC"
                  ? "Hide post"
                  : "Show post"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeletePost(actionsPost);
                setActionsPost(null);
              }}
              className="flex min-h-13 w-full items-center gap-3 rounded-2xl border border-rose-200 px-4 py-3 text-left text-rose-600 transition-colors hover:bg-rose-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">
                <Trash2 size={18} />
              </span>
              <span className="font-semibold">Delete post</span>
            </button>
          </div>
        )}
      </ActionSurface>

      <EditSurface
        desktop={isDesktop}
        open={Boolean(editingPost && editState)}
        busy={mutationBusy}
        onClose={() => {
          setEditingPost(null);
          setEditState(null);
        }}
        onSubmit={() => void handleSaveEdit()}
      >
        {editState && (
          <div className="space-y-4">
            <FieldBlock label="Title">
              <Input
                value={editState.title}
                maxLength={140}
                onChange={(event) =>
                  setEditState((current) =>
                    current
                      ? { ...current, title: event.target.value }
                      : current,
                  )
                }
              />
            </FieldBlock>

            <FieldBlock label="Description">
              <Textarea
                value={editState.caption}
                maxLength={2000}
                className="min-h-28"
                onChange={(event) =>
                  setEditState((current) =>
                    current
                      ? { ...current, caption: event.target.value }
                      : current,
                  )
                }
              />
            </FieldBlock>

            <FieldBlock label="Category">
              <CategoryPickerDrawer
                value={editState.categoryId}
                fallbackLabel={editState.categoryLabel}
                onChange={(id, name) =>
                  setEditState((current) =>
                    current
                      ? { ...current, categoryId: id, categoryLabel: name }
                      : current,
                  )
                }
              />
            </FieldBlock>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <FieldBlock label="Price">
                <Input
                  inputMode="decimal"
                  value={editState.amount}
                  onChange={(event) =>
                    setEditState((current) =>
                      current
                        ? { ...current, amount: event.target.value }
                        : current,
                    )
                  }
                />
              </FieldBlock>

              <FieldBlock label="Negotiable">
                <div className="flex h-11 items-center justify-end rounded-2xl border px-3">
                  <Switch
                    checked={editState.negotiable}
                    onCheckedChange={(checked) =>
                      setEditState((current) =>
                        current ? { ...current, negotiable: checked } : current,
                      )
                    }
                  />
                </div>
              </FieldBlock>
            </div>

            <div className="rounded-2xl border border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-3 text-sm text-muted-foreground">
              Media and location are locked after publishing so buyers always
              see the same asset and pickup context.
            </div>
          </div>
        )}
      </EditSurface>

      <DeleteSurface
        desktop={isDesktop}
        open={Boolean(deletePost)}
        busy={mutationBusy}
        onClose={() => setDeletePost(null)}
        onConfirm={() => void handleDelete()}
      >
        {deletePost && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-relaxed">
                This removes <strong>{deletePost.title || "this post"}</strong>{" "}
                from your inventory. Buyers will no longer see it.
              </p>
            </div>
          </div>
        )}
      </DeleteSurface>
    </>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ActionSurface({
  desktop,
  post,
  busy,
  onClose,
  children,
}: {
  desktop: boolean | null;
  post: ManagedPost | null;
  busy: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const title = post?.title || "Manage post";
  const subtitle =
    "Quick actions for editing, visibility, deletion, and performance review.";

  if (desktop) {
    return (
      <Dialog open={Boolean(post)} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[min(92vw,520px)] rounded-[28px] border border-default bg-app p-0">
          <DialogHeader className="border-b border-default px-6 py-5 text-left">
            <DialogTitle className="pr-8">{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-6 py-5">{children}</div>
          <DialogFooter className="border-t border-default px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={Boolean(post)} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="mx-auto max-w-107.5 rounded-t-[28px] border-default bg-app">
        <DrawerHeader className="pb-1 text-left">
          <DrawerTitle className="pr-6 text-[15px]">{title}</DrawerTitle>
          <DrawerDescription className="text-[12px] leading-relaxed">
            {subtitle}
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-2 px-4 pb-5">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

function EditSurface({
  desktop,
  open,
  busy,
  onClose,
  onSubmit,
  children,
}: {
  desktop: boolean | null;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const title = "Edit post";
  const description =
    "You can update price, negotiable, title, description, and category.";

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="w-[min(92vw,680px)] rounded-[28px] border border-default bg-app p-0">
          <DialogHeader className="border-b border-default px-6 py-5 text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">{children}</div>
          <DialogFooter className="border-t border-default px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button className="text-white" onClick={onSubmit} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent className="mx-auto max-w-107.5 rounded-t-[28px] border-default bg-app">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-[15px]">{title}</DrawerTitle>
          <DrawerDescription className="text-[12px] leading-relaxed">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{children}</div>
        <DrawerFooter className="border-t border-default px-4 pt-3">
          <Button
            className="h-10 rounded-xl text-white text-[13px]"
            onClick={onSubmit}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl text-[13px]"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DeleteSurface({
  desktop,
  open,
  busy,
  onClose,
  onConfirm,
  children,
}: {
  desktop: boolean | null;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const title = "Delete post";
  const description = "This action cannot be undone.";

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="w-[min(92vw,460px)] rounded-[28px] border border-default bg-app p-0">
          <DialogHeader className="border-b border-default px-6 py-5 text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">{children}</div>
          <DialogFooter className="border-t border-default px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent className="mx-auto max-w-107.5 rounded-t-[28px] border-default bg-app">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-[15px]">{title}</DrawerTitle>
          <DrawerDescription className="text-[12px] leading-relaxed">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{children}</div>
        <DrawerFooter className="border-t border-default px-4 pt-3">
          <Button
            variant="destructive"
            className="h-10 rounded-xl text-[13px]"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            Delete
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl text-[13px]"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
