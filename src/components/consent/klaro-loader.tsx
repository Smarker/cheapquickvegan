"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import klaroConfig from "../../../klaro-config";

declare global {
  interface Window {
    klaro?: any;
    klaroConfig?: typeof klaroConfig;
  }
}

export default function KlaroLoader() {
  const pathname = usePathname(); // detects route changes

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Assign global config
    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      // Check if Klaro script is already loaded
      if (!window.klaro) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
        script.async = true;

        script.onload = () => {
          const manager = window.klaro?.getManager?.();
          if (manager && !document.cookie.includes(klaroConfig.cookieName)) {
            window.klaro.show?.(); // only show if cookie missing
          }
        };

        document.body.appendChild(script);
      } else {
        // Klaro already loaded, check cookie on route change
        const manager = window.klaro?.getManager?.();
        if (manager && !document.cookie.includes(klaroConfig.cookieName)) {
          window.klaro.show?.();
        }
      }
    };

    initKlaro();
  }, [pathname]); // re-run on route changes

  return <div id="klaro" />;
}
