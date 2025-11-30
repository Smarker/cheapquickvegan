// components/consent/GDPRShell.tsx
"use client";

import { ConsentProvider } from "./consent-context";
import GDPRAnalytics from "./gdpr-analytics";
import CookieSettingsButton from "./cookie-settings-button";

export default function GDPRShell({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <GDPRAnalytics />
      <CookieSettingsButton />
    </ConsentProvider>
  );
}
