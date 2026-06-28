"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import {
  MY_WEB_PUSH_STATUS,
  REMOVE_WEB_PUSH_SUBSCRIPTION,
  SAVE_WEB_PUSH_SUBSCRIPTION,
} from "../graphql/operations";

type PermissionState = NotificationPermission | "unsupported";

function browserSupportsPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function base64ToUint8Array(value: string): Uint8Array {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const decoded = atob(padded);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/shopi-push-sw.js");
}

function uint8ToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * A subscription is bound to the VAPID key it was created with. If the server's
 * current public key differs (e.g. keys were rotated/regenerated), pushes 403.
 * Returns true when the existing subscription was made with `serverKey`.
 */
function subscriptionMatchesKey(
  subscription: PushSubscription,
  serverKey: string,
): boolean {
  const appKey = subscription.options?.applicationServerKey;
  if (!appKey) return false;
  return uint8ToBase64Url(appKey) === serverKey.replace(/=+$/, "");
}

export function usePushNotifications(lang: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  // Start as "unsupported" so the first client render matches the server (which
  // has no `window`/`Notification`) — otherwise the push button would render on
  // the client but not the server and trip a hydration mismatch. The real
  // permission is resolved right after mount, in the effect below.
  const [permission, setPermission] = useState<PermissionState>("unsupported");
  const [isUpdating, setIsUpdating] = useState(false);
  const autoSyncRef = useRef(false);

  useEffect(() => {
    if (browserSupportsPush()) setPermission(Notification.permission);
  }, []);

  const { data, refetch } = useQuery(MY_WEB_PUSH_STATUS, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [saveSubscription] = useMutation(SAVE_WEB_PUSH_SUBSCRIPTION);
  const [removeSubscription] = useMutation(REMOVE_WEB_PUSH_SUBSCRIPTION);

  const status = (
    data as
      | {
          myWebPushStatus?: {
            isAvailable?: boolean;
            isEnabled?: boolean;
            activeSubscriptionCount?: number;
            publicKey?: string | null;
          };
        }
      | undefined
  )?.myWebPushStatus;

  const isSupported = permission !== "unsupported";
  const isAvailable = Boolean(status?.isAvailable);
  const isEnabled = Boolean(status?.isEnabled);
  const publicKey = status?.publicKey ?? null;

  const syncExistingSubscription = useCallback(async () => {
    if (!browserSupportsPush() || !publicKey) return false;

    const registration = await getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // A subscription made with an older/different VAPID key can never be
    // delivered to (push service returns 403). Discard it so the user re-enables
    // with the current key instead of silently staying broken.
    if (!subscriptionMatchesKey(subscription, publicKey)) {
      await subscription.unsubscribe().catch(() => {});
      return false;
    }

    const json = subscription.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!p256dh || !auth) return false;

    await saveSubscription({
      variables: {
        input: {
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          locale: lang,
          userAgent: navigator.userAgent,
        },
      },
    });
    await refetch();
    return true;
  }, [lang, publicKey, refetch, saveSubscription]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !isSupported ||
      permission !== "granted" ||
      !isAvailable ||
      isEnabled ||
      autoSyncRef.current
    ) {
      return;
    }

    autoSyncRef.current = true;
    void syncExistingSubscription().catch(() => {
      autoSyncRef.current = false;
    });
  }, [
    isAuthenticated,
    isAvailable,
    isEnabled,
    isSupported,
    permission,
    syncExistingSubscription,
  ]);

  const enable = useCallback(async () => {
    if (!browserSupportsPush()) {
      toast.error("This browser does not support push notifications");
      return false;
    }
    if (!status?.isAvailable || !status.publicKey) {
      toast.error("Push notifications are not configured on the server yet");
      return false;
    }

    setIsUpdating(true);
    try {
      let nextPermission = Notification.permission;
      if (nextPermission !== "granted") {
          nextPermission = await Notification.requestPermission();
          setPermission(nextPermission);
      }

      if (nextPermission !== "granted") {
        toast.error(
          nextPermission === "denied"
            ? "Notifications are blocked in your browser settings"
            : "Notification permission was not granted",
        );
        return false;
      }

      const registration = await getRegistration();
      let subscription = await registration.pushManager.getSubscription();
      // If an existing subscription was created with a different VAPID key, drop
      // it first — otherwise we'd re-save a subscription that 403s on send.
      if (subscription && !subscriptionMatchesKey(subscription, status.publicKey)) {
        await subscription.unsubscribe().catch(() => {});
        subscription = null;
      }
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(
            status.publicKey,
          ) as unknown as BufferSource,
        });
      }

      const json = subscription.toJSON();
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!p256dh || !auth) {
        throw new Error("Could not read the browser push keys");
      }

      await saveSubscription({
        variables: {
          input: {
            endpoint: subscription.endpoint,
            p256dh,
            auth,
            locale: lang,
            userAgent: navigator.userAgent,
          },
        },
      });
      await refetch();
      toast.success("Message alerts enabled");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not enable push notifications",
      );
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [lang, refetch, saveSubscription, status]);

  const disable = useCallback(async () => {
    if (!browserSupportsPush()) return false;

    setIsUpdating(true);
    try {
      const registration = await getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription?.endpoint) {
        await removeSubscription({
          variables: { endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }
      await refetch();
      toast.success("Message alerts disabled");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not disable push notifications",
      );
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [refetch, removeSubscription]);

  const toggle = useCallback(async () => {
    if (isEnabled) return disable();
    return enable();
  }, [disable, enable, isEnabled]);

  return useMemo(
    () => ({
      isSupported,
      isAvailable,
      isEnabled,
      isUpdating,
      permission,
      toggle,
    }),
    [isAvailable, isEnabled, isSupported, isUpdating, permission, toggle],
  );
}
