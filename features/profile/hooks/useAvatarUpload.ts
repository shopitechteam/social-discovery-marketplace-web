"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type AvatarUploadStatus = "idle" | "uploading" | "error";

/**
 * Uploads an avatar image to the REST endpoint `POST /upload/avatar`, which
 * processes it (square WebP) and returns a public CDN URL. The caller then
 * stores that URL via updateProfile(input: { avatar }).
 */
export function useAvatarUpload() {
  const [status, setStatus] = useState<AvatarUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setError(null);
    setStatus("uploading");
    try {
      const token = useAuthStore.getState().accessToken;
      const body = new FormData();
      body.append("file", file);

      const res = await fetch(`${API_URL}/upload/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Avatar upload failed");
      }

      const data = (await res.json()) as { avatarUrl?: string };
      if (!data.avatarUrl) throw new Error("No avatar URL returned");

      setStatus("idle");
      return data.avatarUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
      setStatus("error");
      return null;
    }
  }, []);

  return { upload, status, error, uploading: status === "uploading" };
}
