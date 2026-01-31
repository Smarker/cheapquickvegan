"use client";

import { useState, useEffect } from "react";
import { Share2, Facebook, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCounts, SharePlatform } from "@/types/share";
import { track } from "@vercel/analytics";

interface ShareButtonsProps {
  recipeId: string;
  recipeTitle: string;
  recipeDescription: string;
  recipeUrl: string;
  variant?: "inline" | "floating";
  showLabel?: boolean;
  className?: string;
  compact?: boolean;
}

export function ShareButtons({
  recipeId,
  recipeTitle,
  recipeDescription,
  recipeUrl,
  variant = "inline",
  showLabel = true,
  className,
  compact = false,
}: ShareButtonsProps) {
  const [shareCounts, setShareCounts] = useState<ShareCounts | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showNativeShare, setShowNativeShare] = useState(false);

  // Check for native share API on client only
  useEffect(() => {
    setShowNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Fetch share counts on mount
  useEffect(() => {
    fetch(`/api/shares/${recipeId}`)
      .then((res) => res.json())
      .then((data) => setShareCounts(data))
      .catch((error) => console.error("Error fetching share counts:", error));
  }, [recipeId]);

  // Generate share URLs with UTM parameters
  const generateShareUrl = (platform: SharePlatform): string => {
    const baseUrl = recipeUrl;
    const utmParams = new URLSearchParams({
      utm_source: platform,
      utm_medium: "social",
      utm_campaign: "recipe_share",
    });
    return `${baseUrl}?${utmParams.toString()}`;
  };

  // Track share event
  const trackShareEvent = async (platform: SharePlatform) => {
    try {
      // Track in Vercel Analytics
      track("recipe_shared", {
        recipeId,
        platform,
        recipeTitle,
      });

      // Track in database
      await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, platform }),
      });

      // Optimistically update count
      if (shareCounts) {
        setShareCounts({
          ...shareCounts,
          [platform]: shareCounts[platform] + 1,
          total: shareCounts.total + 1,
        });
      }
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  };

  // Handle native share
  const handleNativeShare = async () => {
    if (!navigator.share) return;

    setIsSharing(true);
    try {
      await navigator.share({
        title: recipeTitle,
        text: recipeDescription,
        url: generateShareUrl("native"),
      });
      await trackShareEvent("native");
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Facebook share
  const handleFacebookShare = () => {
    const url = generateShareUrl("facebook");
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    trackShareEvent("facebook");
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    const url = generateShareUrl("whatsapp");
    const text = `Check out this delicious vegan recipe: ${recipeTitle}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    trackShareEvent("whatsapp");
  };

  // Handle Email share
  const handleEmailShare = () => {
    const url = generateShareUrl("email");
    const subject = `Recipe: ${recipeTitle}`;
    const body = `I thought you might enjoy this vegan recipe!\n\n${recipeTitle}\n\n${recipeDescription}\n\nCheck it out here: ${url}\n\nFrom Cheap Quick Vegan`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    trackShareEvent("email");
  };

  // TODO: Pinterest share - implement when Pinterest integration is ready
  // const handlePinterestShare = () => {
  //   const url = generateShareUrl("pinterest");
  //   const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(recipeTitle)}`;
  //   window.open(pinterestUrl, "_blank", "width=600,height=400");
  //   trackShareEvent("pinterest");
  // };

  const shareButtons = [
    {
      id: "facebook",
      label: "Share on Facebook",
      icon: Facebook,
      onClick: handleFacebookShare,
      color: "hover:bg-[#1877F2] hover:text-white",
      count: shareCounts?.facebook || 0,
    },
    {
      id: "whatsapp",
      label: "Share on WhatsApp",
      icon: MessageCircle,
      onClick: handleWhatsAppShare,
      color: "hover:bg-[#25D366] hover:text-white",
      count: shareCounts?.whatsapp || 0,
    },
    {
      id: "email",
      label: "Share via Email",
      icon: Mail,
      onClick: handleEmailShare,
      color: "hover:bg-slate-600 hover:text-white",
      count: shareCounts?.email || 0,
    },
  ];

  const containerClasses = cn(
    "flex items-center",
    compact ? "gap-1.5" : "gap-2",
    variant === "floating" &&
      "fixed bottom-6 right-6 z-50 bg-background/95 backdrop-blur-sm border rounded-full shadow-lg p-2 md:flex-col md:bottom-1/2 md:translate-y-1/2 md:right-4",
    variant === "inline" && "flex-wrap",
    className
  );

  return (
    <div className={containerClasses}>
      {showLabel && variant === "inline" && (
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Share:
        </span>
      )}

      {/* Native Share Button (Mobile/Safari) */}
      {showNativeShare && (
        <button
          onClick={handleNativeShare}
          disabled={isSharing}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted transition-all duration-200",
            compact ? "w-8 h-8 md:w-7 md:h-7" : variant === "inline" ? "w-9 h-9" : "w-11 h-11",
            "hover:bg-primary hover:text-primary-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Share this recipe"
          title="Share this recipe"
        >
          <Share2 className={cn(compact ? "w-4 h-4" : variant === "inline" ? "w-4 h-4" : "w-5 h-5")} />
        </button>
      )}

      {/* Platform-specific Share Buttons */}
      {shareButtons.map((button) => (
        <div key={button.id} className="relative group">
          <button
            onClick={button.onClick}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-muted transition-all duration-200",
              compact ? "w-8 h-8 md:w-7 md:h-7" : variant === "inline" ? "w-9 h-9" : "w-11 h-11",
              button.color,
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={button.label}
            title={button.label}
          >
            <button.icon className={cn(compact ? "w-4 h-4" : variant === "inline" ? "w-4 h-4" : "w-5 h-5")} />
          </button>

          {/* Share Count Badge - notification style */}
          {button.count > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 bg-rose-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center font-semibold",
                compact ? "text-[8px]" : "text-[10px]",
                "leading-none px-0.5",
                "border-2 border-background",
                "group-hover:scale-110 transition-transform shadow-sm"
              )}
              aria-label={`${button.count} shares`}
            >
              {button.count > 99 ? "99+" : button.count}
            </span>
          )}

          {/* Tooltip for desktop floating variant */}
          {variant === "floating" && (
            <span className="hidden md:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {button.label}
            </span>
          )}
        </div>
      ))}

      {/* Total Share Count (inline variant only) */}
      {variant === "inline" && shareCounts && shareCounts.total > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          {shareCounts.total} {shareCounts.total === 1 ? "share" : "shares"}
        </span>
      )}
    </div>
  );
}
