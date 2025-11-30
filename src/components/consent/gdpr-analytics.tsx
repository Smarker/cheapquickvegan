// components/consent/GDPRAnalytics.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useConsent } from "./ConsentContext";

// Dynamically import analytics modules
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then(mod => mod.Analytics),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => mod.SpeedInsights),
  { ssr: false }
);

export default function GDPRAnalytics() {
  const { hasAnalyticsConsent } = useConsent();

  useEffect(() => {
    console.log("[GDPRAnalytics] Component mounted.");
  }, []);

  useEffect(() => {
    console.log("[GDPRAnalytics] hasAnalyticsConsent changed:", hasAnalyticsConsent);
  }, [hasAnalyticsConsent]);

  if (!hasAnalyticsConsent) {
    console.log("[GDPRAnalytics] No consent yet, not mounting analytics.");
    return null;
  }

  console.log("[GDPRAnalytics] Consent granted, mounting analytics components.");
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
