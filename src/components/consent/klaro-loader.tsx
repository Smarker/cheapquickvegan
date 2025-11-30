"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import klaroConfig from "../../../klaro-config";

export default function KlaroLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Attach config
    window.klaroConfig = klaroConfig;

    const loadKlaro = () => {
      if (!window.klaro) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
        script.async = true;

        script.onload = () => {
          const cookieName = klaroConfig.cookieName || "klaro";
          const hasConsent = document.cookie.includes(cookieName);

          if (!hasConsent) window.klaro?.show?.();
        };

        document.body.appendChild(script);
      } else {
        const cookieName = klaroConfig.cookieName || "klaro";
        const hasConsent = document.cookie.includes(cookieName);

        if (!hasConsent) window.klaro?.show?.();
      }
    };

    loadKlaro();
  }, [pathname]);

  return null;
}
