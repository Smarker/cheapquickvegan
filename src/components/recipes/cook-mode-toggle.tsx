"use client";

import { useState, useEffect } from "react";
import { CookingPot } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookModeToggleProps {
  variant?: "full" | "compact";
}

export function CookModeToggle({ variant = "full" }: CookModeToggleProps) {
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Request wake lock
  const requestWakeLock = async () => {
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);

      // Handle wake lock release (e.g., when tab becomes inactive)
      lock.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });
    } catch (err) {
      console.error('Failed to activate cook mode:', err);
      setIsActive(false);
    }
  };

  // Release wake lock
  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
      } catch (err) {
        console.error('Failed to deactivate cook mode:', err);
      }
    }
  };

  const toggleCookMode = () => {
    if (isActive) {
      releaseWakeLock();
    } else {
      requestWakeLock();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  // Compact variant for mobile
  if (variant === "compact") {
    return (
      <button
        onClick={toggleCookMode}
        className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
        aria-label={isActive ? "Deactivate cook mode (screen will sleep normally)" : "Activate cook mode (keeps screen awake)"}
      >
        <span className="text-sm text-muted-foreground whitespace-nowrap leading-tight">Cook Mode</span>
        <div
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors translate-y-0.5",
            isActive ? "bg-orange-500" : "bg-muted border"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              isActive ? "translate-x-[18px]" : "translate-x-0.5"
            )}
          />
        </div>
      </button>
    );
  }

  // Full variant for desktop
  return (
    <div className="relative group">
      <button
        onClick={toggleCookMode}
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg transition-all duration-200 shadow-lg",
          isActive
            ? "bg-orange-500 hover:bg-orange-600 text-white"
            : "bg-background/95 hover:bg-muted border text-foreground backdrop-blur-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
        aria-label={isActive ? "Deactivate cook mode (screen will sleep normally)" : "Activate cook mode (keeps screen awake)"}
      >
        <CookingPot className="w-6 h-6" />
        <span className="text-[10px] font-medium leading-tight text-center max-w-[50px]">
          {isActive ? "Cook Mode On" : "Cook Mode"}
        </span>
      </button>

      {/* Tooltip - only show when inactive */}
      {!isActive && (
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-foreground text-background text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Keep your screen awake while cooking
        </span>
      )}
    </div>
  );
}
