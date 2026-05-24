"use client";

import { useEffect } from "react";
import { useCreateStore, CreateStep } from "@/stores/create";
import { StepEdit } from "./StepEdit";
import { StepOptions } from "./StepOptions";
import { StepReady } from "./StepReady";
import { useRouter } from "next/navigation";

interface CreateFlowProps {
  lang: string;
}

// 3 steps — media is picked before arriving here
const NAMED_STEPS: CreateStep[] = ["edit", "options", "ready"];

export function CreateFlow({ lang }: CreateFlowProps) {
  const { step } = useCreateStore();
  const router = useRouter();

  const stepIndex = NAMED_STEPS.indexOf(step);

  // If user lands here without having picked media (direct nav / hard reload),
  // redirect to feed. We cannot send them to /upload because on a hard reload
  // the intercept route doesn't fire — /upload would render CreateFlow again
  // and the same redirect would repeat, creating an infinite loop.
  useEffect(() => {
    if (step === "pick") {
      router.replace(`/${lang}/upload`);
    }
  }, []);

  function handleBack() {
    // Step 1 back → go back to drawer (feed with drawer open)
    router.push(`/${lang}/upload`);
  }

  return (
    <div
      className="flex flex-col relative bg-app"
      style={{ minHeight: "100svh", maxWidth: 430, margin: "0 auto" }}
    >
      {/* Progress bar */}
      {/* <div className="flex gap-1 px-4 pt-3 pb-1 shrink-0">
        {NAMED_STEPS.map((s, i) => (
          <div
            key={s}
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 3, backgroundColor: "rgb(var(--color-border))" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: i <= stepIndex ? "100%" : "0%",
                backgroundColor: i <= stepIndex ? "rgb(var(--brand-primary))" : "transparent",
              }}
            />
          </div>
        ))}
      </div> */}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        {step === "edit" && <StepEdit onBack={handleBack} />}
        {step === "options" && <StepOptions />}
        {step === "ready" && <StepReady lang={lang} />}
      </div>
    </div>
  );
}
