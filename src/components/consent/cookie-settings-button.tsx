"use client";

import React from "react";

interface CookieSettingsButtonProps {
  className?: string;
}

export default function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  function openSettings() {
    // Open Klaro preferences modal
    if (typeof window !== "undefined" && window.klaro?.show) {
      window.klaro.show(); // Opens the modal
    } else {
      console.warn("Klaro not loaded yet.");
    }
  }

  return (
    <button
      type="button"
      onClick={openSettings}
      className={className}
    >
      Cookie settings
    </button>
  );
}
