"use client";

import { Star, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface RatingWidgetProps {
  recipeId: string;
  averageRating: number;
  reviewCount: number;
  onRateClick?: (rating: number) => void;
}

export function RatingWidget({
  recipeId,
  averageRating,
  reviewCount,
  onRateClick,
}: RatingWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to reset pending rating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPendingRating(null);
      }
    };

    if (pendingRating !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [pendingRating]);

  // Check if user has already rated this recipe
  useEffect(() => {
    const ratingToken = localStorage.getItem(`rating_${recipeId}`);

    fetch(`/api/ratings/quick?recipeId=${recipeId}${ratingToken ? `&ratingToken=${ratingToken}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.hasRated) {
          setUserRating(data.rating);
        }
      })
      .catch(err => console.error('Error checking user rating:', err));
  }, [recipeId]);

  const handleStarClick = (rating: number) => {
    // Show confirmation
    setPendingRating(rating);
  };

  const confirmRating = async () => {
    if (!pendingRating) return;

    setIsSubmitting(true);
    try {
      const ratingToken = localStorage.getItem(`rating_${recipeId}`);

      const response = await fetch('/api/ratings/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          rating: pendingRating,
          ratingToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem(`rating_${recipeId}`, data.ratingToken);

        // Update UI
        setUserRating(pendingRating);
        setPendingRating(null);
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);

        // Trigger callback if provided
        if (onRateClick) {
          onRateClick(pendingRating);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelRating = () => {
    setPendingRating(null);
  };

  const displayRating = hoveredRating ?? averageRating;

  // Show success message briefly after submitting
  if (showSuccess) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-[10px] font-medium">
          {userRating ? 'Rating updated!' : 'Rating saved!'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1"
      onMouseLeave={() => setHoveredRating(null)}
    >
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            className="focus:outline-none"
            aria-label={`Rate ${star} stars`}
            title={userRating ? "Update your rating" : "Rate this recipe"}
            disabled={isSubmitting}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all cursor-pointer hover:scale-110",
                // Show pending rating
                pendingRating !== null
                  ? star <= pendingRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                  : // Show user's rating if they've rated
                  userRating && hoveredRating === null
                  ? star <= userRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/50"
                  : hoveredRating !== null
                  ? star <= hoveredRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/50"
                  : "fill-muted text-muted-foreground hover:text-amber-400",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            />
          </button>
        ))}
      </div>

      {/* Confirm and Cancel buttons */}
      {pendingRating !== null && (
        <>
          <button
            onClick={confirmRating}
            disabled={isSubmitting}
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Confirm rating"
            title="Confirm rating"
          >
            <Check className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={cancelRating}
            disabled={isSubmitting}
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Cancel rating"
            title="Cancel"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </>
      )}
    </div>
  );
}
