// components/consent/CookieSettingsButton.tsx
"use client";

import { useConsent } from "./consent-context";

interface CookieSettingsButtonProps {
  className?: string;
}

export default function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const { showConsentSettings, consent } = useConsent();

  const handleClick = () => {
    console.log("[CookieSettingsButton] Opening Klaro consent settings...");
    showConsentSettings();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      Cookie Settings
    </button>
  );
}
