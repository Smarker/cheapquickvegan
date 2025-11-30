"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import klaroConfig from "../../../klaro-config";

declare global {
  interface Window {
    klaro?: {
      getManager?: () => { getConsent: (serviceName: string) => boolean };
      on?: (event: string, callback: (consent: boolean, service: { name: string }) => void) => void;
      show?: (serviceName?: string) => void;
      setup?: (config?: any) => void;
    };
    klaroConfig?: typeof klaroConfig;
    __vercelAnalyticsLoaded?: boolean;
  }
}

export default function GDPRConsent() {
  const pathname = usePathname();
  const [klaroReady, setKlaroReady] = useState(false);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const serviceName = "vercel-analytics";

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) return false;

      // Force banner if cookie missing (useful for incognito/testing)
      const cookieMissing = !document.cookie.includes(klaroConfig.cookieName);
      if (cookieMissing) {
        window.klaro?.show?.();
      }

      // Initial consent
      setHasAnalyticsConsent(manager.getConsent(serviceName));
      setKlaroReady(true);

      // Listen for live changes
      window.klaro?.on?.("consentChanged", (consent: boolean, service: { name: string }) => {
        if (service.name === serviceName) setHasAnalyticsConsent(consent);
      });

      return true;
    };

    // Check if Klaro script already loaded
    const existingScript = document.querySelector(
      'script[src*="klaro-no-css"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      initKlaro();
      return;
    }

    // Inject Klaro script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
    script.async = true;
    script.onload = () => {
      initKlaro();
    };
    document.body.appendChild(script);
  }, [pathname]);

  // Only render Vercel Analytics if Klaro ready AND user consented
  if (!klaroReady || !hasAnalyticsConsent) return null;

  // Prevent double injection
  if (!window.__vercelAnalyticsLoaded) {
    window.__vercelAnalyticsLoaded = true;
    return (
      <>
        <Analytics />
        <SpeedInsights />
      </>
    );
  }

  return null;
}
