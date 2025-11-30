// src/components/consent/GDPRConsent.tsx
"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import klaroConfig from "../../../klaro-config";

export default function GDPRConsent() {
  const [klaroReady, setKlaroReady] = useState(false);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Assign global config once
    window.klaroConfig = klaroConfig;

    // Only inject Klaro once
    if (!document.querySelector('script[src*="klaro-no-css"]')) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
      script.async = true;
      script.onload = () => {
        const manager = window.klaro?.getManager?.();
        if (manager) {
          setKlaroReady(true);

          // Check initial consent
          const consent = manager.getConsent("analytics");
          setHasAnalyticsConsent(consent);

          // Listen for live changes
          window.klaro?.on?.(
            "consentChanged",
            (consent: boolean, service: { name: string }) => {
              if (service.name === "analytics") setHasAnalyticsConsent(consent);
            }
          );

          // Show banner if no cookie
          if (!document.cookie.includes(klaroConfig.cookieName)) {
            window.klaro?.show?.();
          }
        }
      };
      document.body.appendChild(script);
    } else {
      // Klaro script already exists, check manager
      const manager = window.klaro?.getManager?.();
      if (manager) {
        setKlaroReady(true);
        const consent = manager.getConsent("analytics");
        setHasAnalyticsConsent(consent);
      }
    }
  }, []);

  // Render analytics only after Klaro is ready and user consented
  return (
    <>
      {/* Where Klaro injects UI */}
      <div id="klaro" />

      {klaroReady && hasAnalyticsConsent && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
