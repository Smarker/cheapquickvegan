"use client";

import React from "react";
import { useConsent } from "./consent-context";

interface CookieSettingsButtonProps {
  className?: string;
}

export default function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const { consent, showConsentSettings } = useConsent();

  const handleClick = () => {
    console.log("[CookieSettingsButton] Opening Klaro settings...");
    showConsentSettings();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      Cookie settings
    </button>
  );
}
