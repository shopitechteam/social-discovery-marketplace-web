"use client";

interface StatRowProps {
  likes: number;
  comments: number;
  views?: number;
  inverted?: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function StatRow({ likes, comments, views, inverted }: StatRowProps) {
  const cls = inverted
    ? "text-white/80 text-[11px]"
    : "text-muted-foreground text-[11px]";

  return (
    <div className={`flex items-center gap-3 ${cls}`}>
      {!!views && (
        <span className="flex items-center gap-0.5">
          <EyeIcon className="w-3.5 h-3.5" />
          {fmt(views)}
        </span>
      )}
      <span className="flex items-center gap-0.5">
        <HeartIcon className="w-3.5 h-3.5" />
        {fmt(likes)}
      </span>
      <span className="flex items-center gap-0.5">
        <ChatIcon className="w-3.5 h-3.5" />
        {fmt(comments)}
      </span>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}
