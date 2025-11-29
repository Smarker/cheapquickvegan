"use client";

import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function VercelConsentGate() {
  const [ready, setReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const serviceName = "analytics";

  useEffect(() => {
    if (typeof window === "undefined") return;

    let interval: NodeJS.Timeout;

    function tryInitialize() {
      const klaro = window.klaro;
      if (!klaro) return; // Not loaded yet

      const manager = klaro.getManager?.();
      if (!manager) return;

      // Klaro is ready
      clearInterval(interval);
      setReady(true);

      // Initial consent
      const initialConsent = manager.getConsent(serviceName);
      setHasConsent(initialConsent);

      // Listen for live changes
      klaro.on?.("consentChanged", (consent, service) => {
        if (service?.name === serviceName) {
          setHasConsent(consent);
        }
      });
    }

    // Poll every 100ms until Klaro exists and is initialized
    interval = setInterval(tryInitialize, 100);

    return () => clearInterval(interval);
  }, []);

  // Don’t render analytics until consent + klaro manager exists
  if (!ready || !hasConsent) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
