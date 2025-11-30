"use client";

import { useEffect, useState } from "react";

export default function VercelConsentGate() {
  const [ready, setReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  // this MUST match the name you put in klaro-config.js
  const serviceName = "analytics";

  useEffect(() => {
    if (typeof window === "undefined") return;

    let interval: NodeJS.Timeout;

    function tryInitialize() {
      const klaro = window.klaro;
      if (!klaro) return;

      const manager = klaro.getManager?.();
      if (!manager) return;

      clearInterval(interval);
      setReady(true);

      // Initial Klaro consent state
      const initialConsent = manager.getConsent(serviceName);
      setHasConsent(initialConsent);

      klaro.on?.("consentChanged", (consent, service) => {
        if (service?.name === serviceName) {
          setHasConsent(consent);
        }
      });
    }

    interval = setInterval(tryInitialize, 100);
    return () => clearInterval(interval);
  }, []);

  // Load Vercel Analytics *only* when user opted in
  useEffect(() => {
    if (!ready || !hasConsent) return;

    // Prevent double-loading
    if (window.__vercelAnalyticsLoaded) return;

    const script = document.createElement("script");
    script.src = "/_vercel/insights/script.js"; // official endpoint
    script.defer = true;
    script.onload = () => {
      window.__vercelAnalyticsLoaded = true;
    };

    document.head.appendChild(script);
  }, [ready, hasConsent]);

  return null;
}
