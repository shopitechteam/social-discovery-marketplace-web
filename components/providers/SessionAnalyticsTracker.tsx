"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

const SESSION_ID_KEY = "shopi-session-id";
const SESSION_SENT_PREFIX = "shopi-session-analytics-sent";

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const next = makeSessionId();
  sessionStorage.setItem(SESSION_ID_KEY, next);
  return next;
}

function detectDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "mobile";
  return window.innerWidth <= 820 ? "mobile" : window.innerWidth <= 1180 ? "tablet" : "desktop";
}

function detectOperatingSystem() {
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (platform.includes("mac")) return "macOS";
  if (platform.includes("win")) return "Windows";
  if (platform.includes("linux")) return "Linux";
  return navigator.platform || "Other";
}

function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("samsungbrowser")) return "Samsung Internet";
  if (ua.includes("opr") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome") || ua.includes("crios")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  return "Other";
}

const CAPTURE_SESSION_ANALYTICS_MUTATION = `
  mutation CaptureSessionAnalytics($input: CaptureSessionAnalyticsInput!) {
    captureSessionAnalytics(input: $input)
  }
`;

export function SessionAnalyticsTracker() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!accessToken || !userId) return;

    const sessionId = getSessionId();
    const sentKey = `${SESSION_SENT_PREFIX}:${userId}:${sessionId}`;
    if (sessionStorage.getItem(sentKey) === "1") return;

    const uaData = (
      navigator as Navigator & {
        userAgentData?: {
          mobile?: boolean;
          platform?: string;
          brands?: Array<{ brand: string; version: string }>;
        };
      }
    ).userAgentData;

    const browserHint =
      uaData?.brands?.find((brand) => !/not/i.test(brand.brand))?.brand ?? detectBrowser();

    void fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: CAPTURE_SESSION_ANALYTICS_MUTATION,
        variables: {
          input: {
            sessionId,
            userAgent: navigator.userAgent,
            platform: uaData?.platform || navigator.platform || undefined,
            language: navigator.language || undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
            deviceTypeHint: uaData?.mobile ? "mobile" : detectDeviceType(),
            operatingSystemHint: detectOperatingSystem(),
            browserHint,
            screenWidth: window.screen?.width || undefined,
            screenHeight: window.screen?.height || undefined,
            viewportWidth: window.innerWidth || undefined,
            viewportHeight: window.innerHeight || undefined,
          },
        },
      }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          errors?: Array<{ message?: string }>;
          data?: { captureSessionAnalytics?: boolean };
        };
        if (!response.ok || payload.errors?.length || !payload.data?.captureSessionAnalytics) {
          return;
        }
        sessionStorage.setItem(sentKey, "1");
      })
      .catch(() => {
        // Non-blocking analytics capture — ignore failures quietly.
      });
  }, [accessToken, userId]);

  return null;
}
