"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import klaroConfig from "../../../klaro-config";

export default function KlaroLoader() {
  const pathname = usePathname();
  const bannerShown = useRef(false); // track if banner was already shown

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.klaroConfig = klaroConfig;

    const initKlaro = () => {
      if (!window.klaro) {
        // Only load script once
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
        script.async = true;

        script.onload = () => {
          const manager = window.klaro?.getManager?.();
          if (manager && !document.cookie.includes(klaroConfig.cookieName)) {
            window.klaro?.show?.();
            bannerShown.current = true;
          }
        };

        document.body.appendChild(script);
      } else if (!bannerShown.current && !document.cookie.includes(klaroConfig.cookieName)) {
        // Klaro already loaded, show banner only if cookie missing and not shown yet
        window.klaro.show?.();
        bannerShown.current = true;
      }
    };

    initKlaro();
  }, [pathname]);

  return <div id="klaro" />;
}
