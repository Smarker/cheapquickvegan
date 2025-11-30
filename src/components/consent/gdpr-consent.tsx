"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import klaroConfig from "../../../klaro-config";

// Dynamic imports of named exports
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then(mod => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => mod.SpeedInsights),
  { ssr: false }
);

export default function GDPRConsent() {
  const [klaroReady, setKlaroReady] = useState(false);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) return;

      setKlaroReady(true);

      // Set initial consent
      setHasAnalyticsConsent(manager.getConsent("vercel-analytics"));

      // Listen for live changes
      window.klaro?.on?.("consentChanged", (consent, service) => {
        if (service.name === "vercel-analytics") {
          setHasAnalyticsConsent(consent);
        }
      });

      // Show banner if no cookie yet
      if (!document.cookie.includes(klaroConfig.cookieName)) {
        window.klaro?.show?.();
      }
    };

    if (!document.querySelector('script[src*="klaro-no-css"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
      script.async = true;
      script.onload = initKlaro;
      document.body.appendChild(script);
    } else {
      initKlaro();
    }
  }, []);

  return (
    <>
      {/* Where Klaro injects UI */}
      <div id="klaro" suppressHydrationWarning />

      {/* Render analytics only if Klaro is ready and user consented */}
      {klaroReady && hasAnalyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
