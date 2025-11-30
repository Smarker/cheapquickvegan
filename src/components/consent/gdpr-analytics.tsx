// components/consent/GDPRAnalytics.tsx
"use client";

import dynamic from "next/dynamic";
import { useConsent } from "./consent-context";

const Analytics = dynamic(() => import("@vercel/analytics/next").then(mod => mod.Analytics), {
  ssr: false,
});
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(mod => mod.SpeedInsights), {
  ssr: false,
});

export default function GDPRAnalytics() {
  const { hasAnalyticsConsent } = useConsent();

  if (!hasAnalyticsConsent) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
