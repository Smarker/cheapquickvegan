"use client";

import { useEffect } from "react";
import klaroConfig from "../../../klaro-config";

export default function KlaroLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip Klaro on localhost/dev
    if (window.location.hostname === "localhost") return;

    // Assign config globally
    window.klaroConfig = klaroConfig;

    // Dynamically load Klaro script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro-no-css.js";
    script.async = true;

    script.onload = () => {
      // Initialize Klaro once script is loaded
      if (window.klaro?.show) {
        window.klaro.show(); // forces banner
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Klaro will render UI inside this div
  return <div id="klaro" />;
}
