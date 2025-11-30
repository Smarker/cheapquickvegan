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

  console.log(process.env.NEXT_PUBLIC_ENV)
  const isPreview = process.env.NEXT_PUBLIC_ENV === "preview";

  const showAnalytics = consent["vercel-analytics"] ?? false;
  const showSpeed = consent["vercel-speed"] ?? false;

  useEffect(() => {
    if (isPreview) {
      console.log("[GDPRAnalytics] Current consent:", consent);
      console.log("[GDPRAnalytics] showAnalytics:", showAnalytics, "showSpeed:", showSpeed);
    }
  }, [consent, showAnalytics, showSpeed, isPreview]);

  return (
    <>
      {showAnalytics && (
        <>
          {isPreview && console.log("[GDPRAnalytics] Rendering Analytics: true")}
          <Analytics />
        </>
      )}
      {!showAnalytics && isPreview && console.log("[GDPRAnalytics] Rendering Analytics: false")}

      {showSpeed && (
        <>
          {isPreview && console.log("[GDPRAnalytics] Rendering SpeedInsights: true")}
          <SpeedInsights />
        </>
      )}
      {!showSpeed && isPreview && console.log("[GDPRAnalytics] Rendering SpeedInsights: false")}
    </>
  );
}
