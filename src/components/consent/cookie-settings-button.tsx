import { useConsent } from "./consent-context";

export default function CookieSettingsButton({ className }: { className?: string }) {
  const { showConsentSettings } = useConsent();

  return (
    <button onClick={showConsentSettings} className={className}>
      Cookie settings
    </button>
  );
}
