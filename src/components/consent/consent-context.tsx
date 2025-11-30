// components/consent/ConsentContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import klaroConfig from "../../../klaro-config";

interface ConsentContextValue {
  hasAnalyticsConsent: boolean;
  showConsentSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      const manager = window.klaro?.getManager?.();
      if (!manager) return;

      setHasAnalyticsConsent(manager.getConsent("vercel-analytics"));

      window.klaro?.on?.("consentChanged", (consent, service) => {
        if (service.name === "vercel-analytics") {
          setHasAnalyticsConsent(consent);
        }
      });

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

  const showConsentSettings = () => {
    if (typeof window !== "undefined" && window.klaro?.show) {
      window.klaro.show();
    }
  };

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
