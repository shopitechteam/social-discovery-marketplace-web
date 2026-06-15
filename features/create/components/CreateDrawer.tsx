"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import { useMediaUpload } from "@/features/create/hooks/useMediaUpload";
import { CreateDraftDocument } from "@/types/__generated__/graphql";
import { Button } from "@/components/ui/button";

export function CreateDrawer({ lang }: { lang: string }) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { draftId, step, setDraftId, setContentType, setStep, setError, reset } =
    useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);
  const { startImageUpload, startVideoUpload } = useMediaUpload();

  function handleClose() {
    // If there's a draft in progress, resume it instead of going to feed
    if (draftId && step !== "pick") {
      router.push(`/${lang}/upload/create`);
    } else {
      window.location.href = `/${lang}/feed`;
    }
  }

  async function handleFiles(files: FileList, kind: "image" | "video") {
    if (!files.length) return;
    setError(null);

    // Start fresh for a new upload — wipes any previous draft
    reset();

    try {
      const { data, error } = await createDraft({
        variables: { input: { type: kind === "video" ? "VIDEO" : "IMAGE" } },
      });
      if (error || !data?.createDraft)
        throw new Error(error?.message ?? "Failed to create draft");

      const did = data.createDraft.id;
      setDraftId(did);
      setContentType(kind);

      const list = Array.from(files).slice(0, kind === "video" ? 1 : 10);
      list.forEach((file, i) => {
        if (kind === "image") startImageUpload(file, did, i);
        else startVideoUpload(file, did);
      });
      setStep("edit");
      router.push(`/${lang}/upload/create`);
    } catch (err) {
      setError(String(err));
    }
  }

  // function handleText() {
  //   reset();
  //   setContentType(null);
  //   router.push(`/${lang}/upload/create`);
  // }

  function handleVideoClick() {
    videoInputRef.current?.click();
  }

  function handleImageClick() {
    imageInputRef.current?.click();
  }

  const hasDraft = Boolean(draftId && step !== "pick");

  return (
    <>
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DrawerContent>
          <div className="flex flex-col">
            {/* Resume draft — only shown when a draft is in progress */}
            {hasDraft && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${lang}/upload/create`)}
                  className="w-full h-14 rounded-none active:bg-surface transition-colors"
                >
                  <span className="text-md font-medium text-primary">Continue draft</span>
                </Button>
                <div className="h-px bg-border" />
              </>
            )}

            {/* Video option */}
            <Button
              variant="ghost"
              onClick={handleVideoClick}
              className="w-full h-14 rounded-none active:bg-surface transition-colors"
            >
              <span className="text-md font-medium">Video</span>
            </Button>

            <div className="h-px bg-border" />

            {/* Image option */}
            <Button
              variant="ghost"
              onClick={handleImageClick}
              className="w-full h-14 rounded-none active:bg-surface transition-colors"
            >
              <span className="text-md font-medium">Photos</span>
            </Button>

            <div className="h-px bg-border" />

            {/* TikTok import */}
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = `/${lang}/upload/tiktok`;
              }}
              className="w-full h-14 rounded-none active:bg-surface transition-colors"
            >
              <span className="text-md font-medium">TikTok Imports</span>
            </Button>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Cancel button */}
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full h-14 rounded-none active:bg-surface transition-colors"
          >
            <span className="text-md font-medium text-muted-foreground">
              Cancel
            </span>
          </Button>
        </DrawerContent>
      </Drawer>

      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, "video")}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, "image")}
      />
    </>
  );
}
