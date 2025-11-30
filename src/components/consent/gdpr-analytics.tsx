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
  const isDev = process.env.NODE_ENV === "development";

  const showAnalytics = consent["vercel-analytics"] ?? false;
  const showSpeed = consent["vercel-speed"] ?? false;

  useEffect(() => {
    if (isDev) {
      console.log("[GDPRAnalytics] Current consent:", consent);
      console.log("[GDPRAnalytics] showAnalytics:", showAnalytics, "showSpeed:", showSpeed);
    }
  }, [consent, showAnalytics, showSpeed, isDev]);

  return (
    <>
      {showAnalytics && (
        <>
          {isDev && console.log("[GDPRAnalytics] Rendering Analytics: true")}
          <Analytics />
        </>
      )}
      {!showAnalytics && isDev && console.log("[GDPRAnalytics] Rendering Analytics: false")}

      {showSpeed && (
        <>
          {isDev && console.log("[GDPRAnalytics] Rendering SpeedInsights: true")}
          <SpeedInsights />
        </>
      )}
      {!showSpeed && isDev && console.log("[GDPRAnalytics] Rendering SpeedInsights: false")}
    </>
  );
}
