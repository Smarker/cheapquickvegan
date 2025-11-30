// components/consent/consent-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import klaroConfig from "../../../klaro-config";

interface ConsentContextValue {
  consent: Record<string, boolean>; // per-service consent
  showConsentSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [klaroReady, setKlaroReady] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  const showConsentSettings = () => {
    if (typeof window !== "undefined" && window.klaro?.show) {
      window.klaro.show();
    } else {
      console.warn("[GDPR] Klaro not loaded yet.");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) return;

      setKlaroReady(true);

      // Initialize consent for all services with explicit booleans
      const initialConsent: Record<string, boolean> = {};
      klaroConfig.services.forEach((service) => {
        initialConsent[service.name] = !!manager.getConsent(service.name);
      });
      setConsent(initialConsent);
      console.log("[ConsentProvider] Initial consent:", initialConsent);

      // Listen for consent changes per service
      window.klaro?.on?.("consentChanged", (newConsent, service) => {
        console.log("[ConsentProvider] consentChanged:", service.name, newConsent);
        setConsent((prev) => ({ ...prev, [service.name]: !!newConsent }));
      });

      // Show banner if no cookie yet
      if (!document.cookie.includes(klaroConfig.cookieName)) {
        console.log("[ConsentProvider] No Klaro cookie, showing banner...");
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
    <ConsentContext.Provider value={{ consent, showConsentSettings }}>
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used within a ConsentProvider");
  return context;
};
