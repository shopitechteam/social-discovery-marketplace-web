"use client";

import { CombinedGraphQLErrors } from "@apollo/client/errors";

export const SUSPENDED_ACCOUNT_EVENT = "shopi:suspended-account";

export function getSuspendedAccountMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown[] }).errors)
  ) {
    const match = (error as { errors: Array<{ message?: string }> }).errors.find(
      (entry) =>
        entry.message?.toLowerCase().includes("this account has been suspended"),
    );
    return match?.message ?? null;
  }

  if (CombinedGraphQLErrors.is(error)) {
    const match = error.errors.find((entry) =>
      entry.message?.toLowerCase().includes("this account has been suspended"),
    );
    return match?.message ?? null;
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes("this account has been suspended")
      ? error.message
      : null;
  }

  return null;
}

export function emitSuspendedAccountEvent(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SUSPENDED_ACCOUNT_EVENT, {
      detail: { message },
    }),
  );
}
