"use client";

import { useEffect } from "react";
import { useCreateStore } from "@/stores/create";
import { StepEdit } from "./StepEdit";
import { StepOptions } from "./StepOptions";
import { StepReady } from "./StepReady";
import { useRouter } from "next/navigation";

interface CreateFlowProps {
  lang: string;
}

export function CreateFlow({ lang }: CreateFlowProps) {
  const { step } = useCreateStore();
  const router = useRouter();

  // If user lands here without having picked media (direct nav / hard reload),
  // redirect to the picker.
  useEffect(() => {
    if (step === "pick") {
      router.replace(`/${lang}/upload`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBack() {
    router.push(`/${lang}/upload`);
  }

  // Video review renders its own fixed-fullscreen layout (handles desktop
  // centering internally with dimmed side panels) — no card wrapper needed.
  if (step === "ready") {
    return <StepReady lang={lang} />;
  }

  return (
    /*
     * Mobile  (< md): normal page flow, max-width 430 centred.
     * Desktop (≥ md): fixed backdrop + centred dialog card.
     */
    <div className="md:fixed md:inset-0 md:z-50 md:flex md:items-center md:justify-center md:bg-black/50 md:backdrop-blur-sm">
      {/* Card — mobile: full page | desktop: dialog */}
      <div className="create-flow-card flex flex-col bg-app w-full md:rounded-2xl md:shadow-2xl md:overflow-hidden">
        <div className="flex-1 flex flex-col">
          {step === "edit"    && <StepEdit onBack={handleBack} />}
          {step === "options" && <StepOptions />}
        </div>
      </div>
    </div>
  );
}
