"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import klaroConfig from "../../../klaro-config";

// Dynamic imports
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then(mod => mod.Analytics),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => mod.SpeedInsights),
  { ssr: false }
);

interface CookieSettingsButtonProps {
  className?: string;
}

export default function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  // Initialize Klaro consent listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) return;

      // Set initial consent
      setHasAnalyticsConsent(manager.getConsent("vercel-analytics"));

      // Listen for live consent changes
      window.klaro?.on?.("consentChanged", (consent, service) => {
        if (service.name === "vercel-analytics") {
          setHasAnalyticsConsent(consent);
        }
      });
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

  function openSettings() {
    if (typeof window !== "undefined" && window.klaro?.show) {
      window.klaro.show();
    } else {
      console.warn("Klaro not loaded yet.");
    }
  }

  return (
    <>
      <button type="button" onClick={openSettings} className={className}>
        Cookie settings
      </button>

      {/* Render Analytics & SpeedInsights immediately if consent given */}
      {hasAnalyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
