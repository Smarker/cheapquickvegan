"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import klaroConfig from "../../../klaro-config";

interface ConsentContextValue {
  hasAnalyticsConsent: boolean;
  showConsentSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [klaroReady, setKlaroReady] = useState(false);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("[GDPR] Initializing Klaro...");
    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) {
        console.warn("[GDPR] Klaro manager not found yet.");
        return;
      }

      console.log("[GDPR] Klaro manager ready.");
      setKlaroReady(true);

      const consent = manager.getConsent("vercel-analytics");
      console.log("[GDPR] Initial analytics consent:", consent);
      setHasAnalyticsConsent(consent);

      window.klaro?.on?.("consentChanged", (consent, service) => {
        console.log("[GDPR] Consent changed:", service.name, consent);
        if (service.name === "vercel-analytics") {
          setHasAnalyticsConsent(consent);
        }
      });

      if (!document.cookie.includes(klaroConfig.cookieName)) {
        console.log("[GDPR] No consent cookie found, showing banner.");
        window.klaro?.show?.();
      }
    };

    if (!document.querySelector('script[src*="klaro-no-css"]')) {
      console.log("[GDPR] Adding Klaro script to DOM...");
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
      script.async = true;
      script.onload = () => {
        console.log("[GDPR] Klaro script loaded.");
        initKlaro();
      };
      document.body.appendChild(script);
    } else {
      console.log("[GDPR] Klaro script already exists, initializing.");
      initKlaro();
    }
  }, []);

  const showConsentSettings = () => {
    console.log("[GDPR] Opening consent settings...");
    if (typeof window !== "undefined" && window.klaro?.show) {
      window.klaro.show();
    } else {
      console.warn("[GDPR] Klaro not loaded yet.");
    }
  };

  // Only expose consent once Klaro is ready
  if (!klaroReady) {
    console.log("[GDPR] Klaro not ready yet, rendering children without analytics.");
    return <>{children}</>;
  }

  console.log("[GDPR] Klaro ready, rendering children with consent context.");
  return (
    <ConsentContext.Provider value={{ hasAnalyticsConsent, showConsentSettings }}>
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used within a ConsentProvider");
  return context;
};
