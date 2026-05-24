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

  const { setDraftId, setContentType, setError, draftId } = useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);
  const { startImageUpload, startVideoUpload } = useMediaUpload();

  function handleClose() {
    window.location.href = `/${lang}/feed`;
  }

  async function ensureDraft(type: "image" | "video"): Promise<string> {
    if (draftId) return draftId;
    const { data, error } = await createDraft({
      variables: { input: { type: type === "video" ? "VIDEO" : "IMAGE" } },
    });
    if (error || !data?.createDraft)
      throw new Error(error?.message ?? "Failed to create draft");
    const id = data.createDraft.id;
    setDraftId(id);
    return id;
  }

  async function handleFiles(files: FileList, kind: "image" | "video") {
    if (!files.length) return;
    setError(null);
    try {
      const did = await ensureDraft(kind);
      setContentType(kind);
      const list = Array.from(files).slice(0, kind === "video" ? 1 : 10);
      for (const file of list) {
        if (kind === "image") startImageUpload(file, did);
        else startVideoUpload(file, did);
      }
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

            {/* Text option */}
            {/* <Button
              variant="ghost"
              onClick={handleText}
              className="w-full h-14 rounded-none active:bg-surface transition-colors"
            >
              <span className="text-md font-medium">Text</span>
            </Button> */}

            <div className="h-px bg-border" />

            {/* TikTok import */}
            <Button
              variant="ghost"
              onClick={() => {
                //router.push(`/${lang}/upload/tiktok`);

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
