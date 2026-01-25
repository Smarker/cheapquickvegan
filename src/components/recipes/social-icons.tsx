import { Instagram, Facebook } from 'lucide-react';
import { SOCIAL_LINKS } from '@/config/social';

/**
 * Small social media icons component for recipe pages
 * Displays Instagram and Facebook icons that link to profile pages
 * Designed to be unobtrusive and match the site's aesthetic
 */
export function SocialIcons() {
  return (
    <div className="flex items-center gap-2">
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-[#E4405F] hover:text-white transition-colors duration-200"
        aria-label="Follow us on Instagram"
        title="Follow us on Instagram"
      >
        <Instagram className="w-4 h-4" />
      </a>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-[#1877F2] hover:text-white transition-colors duration-200"
        aria-label="Follow us on Facebook"
        title="Follow us on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
    </div>
  );
}
