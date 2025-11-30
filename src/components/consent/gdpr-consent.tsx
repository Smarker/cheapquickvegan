// src/components/consent/GDPRConsent.tsx
"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import klaroConfig from "../../../klaro-config";

export default function GDPRConsent() {
  const [klaroReady, setKlaroReady] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Assign Klaro config globally
    window.klaroConfig = klaroConfig;

    // Inject Klaro script if not already present
    if (!document.querySelector('script[src*="klaro-no-css"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
      script.async = true;
      script.onload = initializeKlaro;
      document.body.appendChild(script);
    } else {
      initializeKlaro();
    }

    function initializeKlaro() {
      const manager = window.klaro?.getManager?.();
      if (!manager) return;

      setKlaroReady(true);
      setAnalyticsConsent(manager.getConsent("vercel-analytics"));

      // Listen for live changes
      window.klaro?.on?.("consentChanged", (consent: boolean, service: { name: string }) => {
        if (service.name === "vercel-analytics") {
          setAnalyticsConsent(consent);
        }
      });

      // Show banner if no cookie yet
      if (!document.cookie.includes(klaroConfig.cookieName)) {
        window.klaro?.show?.();
      }
    }
  }, []);

  return (
    <>
      {/* Where Klaro injects the banner UI */}
      <div id="klaro" />

      {/* Render Vercel services only if consent granted */}
      {klaroReady && analyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
