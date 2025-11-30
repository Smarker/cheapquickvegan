// components/consent/GDPRAnalytics.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useConsent } from "./consent-context";

// Dynamically import analytics modules
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export default function GDPRAnalytics() {
  const { consent } = useConsent();

  const showAnalytics = consent["vercel-analytics"] ?? false;
  const showSpeed = consent["vercel-speed"] ?? false;

  useEffect(() => {
    console.log("[GDPRAnalytics] Current consent:", consent);
  }, [consent]);

  return (
    <>
      {showAnalytics && (
        <>
          {console.log("[GDPRAnalytics] Rendering Analytics: true")}
          <Analytics />
        </>
      )}
      {!showAnalytics && console.log("[GDPRAnalytics] Rendering Analytics: false")}

      {showSpeed && (
        <>
          {console.log("[GDPRAnalytics] Rendering SpeedInsights: true")}
          <SpeedInsights />
        </>
      )}
      {!showSpeed && console.log("[GDPRAnalytics] Rendering SpeedInsights: false")}
    </>
  );
}
