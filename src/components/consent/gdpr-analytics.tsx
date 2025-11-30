"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useConsent } from "./consent-context";

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then(mod => mod.Analytics),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => mod.SpeedInsights),
  { ssr: false }
);

export default function GDPRAnalytics() {
  const { consent } = useConsent();

  useEffect(() => {
    console.log("[GDPRAnalytics] consent object changed:", consent);
  }, [consent]);

  const showAnalytics = consent["vercel-analytics"];
  const showSpeed = consent["vercel-speed"];

  console.log("[GDPRAnalytics] Rendering Analytics:", showAnalytics);
  console.log("[GDPRAnalytics] Rendering SpeedInsights:", showSpeed);

  return (
    <>
      {showAnalytics && <Analytics />}
      {showSpeed && <SpeedInsights />}
    </>
  );
}
