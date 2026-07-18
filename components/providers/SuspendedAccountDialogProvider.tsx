"use client";

import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SUSPENDED_ACCOUNT_EVENT,
} from "@/lib/apollo/suspended-account";

function normalizeMessage(message: string) {
  return message.replace(/^(ApolloError|Error):\s*/, "");
}

export function SuspendedAccountDialogProvider() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleEvent(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!detail?.message) return;
      setMessage(normalizeMessage(detail.message));
    }

    window.addEventListener(SUSPENDED_ACCOUNT_EVENT, handleEvent);
    return () => window.removeEventListener(SUSPENDED_ACCOUNT_EVENT, handleEvent);
  }, []);

  if (!message) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && setMessage(null)}>
      <DialogContent className="w-[min(92vw,430px)] rounded-3xl border border-default bg-app p-6">
        <DialogHeader className="items-center text-center sm:text-center">
          <span
            className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgb(var(--color-error) / 0.1)",
              color: "rgb(var(--color-error))",
            }}
          >
            <CircleAlert size={24} />
          </span>
          <DialogTitle>Account suspended</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {message}
            {" "}
            You can still browse the app, but posting, saving, commenting, and
            messaging are currently disabled.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => setMessage(null)}
            className="h-11 w-full rounded-2xl font-semibold text-white sm:w-40"
            style={{ backgroundColor: "rgb(var(--brand-primary))" }}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
