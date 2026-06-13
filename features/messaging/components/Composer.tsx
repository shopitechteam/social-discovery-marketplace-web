"use client";

import { useRef } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  composer: string;
  isSending: boolean;
  isUploading: boolean;
  requireAuth: () => boolean;
  onChange: (value: string) => void;
  onSendText: () => void;
  onPickMedia: (file: File, kind: "image" | "video") => void;
}

/** Message composer — media pickers, text input, send button. */
export function Composer({
  composer,
  isSending,
  isUploading,
  requireAuth,
  onChange,
  onSendText,
  onPickMedia,
}: Props) {
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="shrink-0 border-t px-4 pt-3"
      style={{
        borderColor: "rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg))",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
      }}
    >
      <div className="flex items-end gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-11 w-11 rounded-full"
          onClick={() => {
            if (!requireAuth()) return;
            mediaInputRef.current?.click();
          }}
          disabled={isUploading || isSending}
          aria-label="Attach photo or video"
        >
          <Paperclip size={18} />
        </Button>

        <div className="flex-1">
          <Input
            value={composer}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Message..."
            className="h-11 rounded-full"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSendText();
              }
            }}
          />
        </div>

        <Button
          type="button"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={onSendText}
          disabled={isSending || isUploading || !composer.trim()}
        >
          {isSending || isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>

      {/* One attachment input — kind is derived from the file's MIME type. */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            const kind = file.type.startsWith("video/") ? "video" : "image";
            onPickMedia(file, kind);
          }
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
