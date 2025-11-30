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

      // Fetch the full consent state after any change, instead of only updating the single service:
      window.klaro?.on?.("consentChanged", () => {
        const manager = window.klaro?.getManager?.();
        if (!manager) return;

        const updatedConsent: Record<string, boolean> = {};
        klaroConfig.services.forEach((s) => {
            updatedConsent[s.name] = manager.getConsent(s.name);
        });

        setConsent(updatedConsent);
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
