import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitBannerProps {
  message: string;
  className?: string;
}

export function RateLimitBanner({ message, className }: RateLimitBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Rate Limit Exceeded
        </p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {message}
        </p>
      </div>
    </div>
  );
}
