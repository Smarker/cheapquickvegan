'use client';

/**
 * StarRating Component
 *
 * Displays and allows selection of 1-5 star ratings.
 * Supports both interactive (input) and read-only (display) modes.
 */

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  (
    {
      value,
      onChange,
      readonly = false,
      size = 'md',
      showValue = false,
      className,
      ...props
    },
    ref
  ) => {
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      // If clicking the same rating, clear it (set to 0)
      if (rating === value) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (!readonly && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // If clicking the same rating, clear it (set to 0)
      if (rating === value) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      role="radiogroup"
      aria-label="Rating"
      className={cn('flex items-center gap-1', className)}
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= value;

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            onClick={() => handleClick(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            disabled={readonly}
            className={cn(
              'transition-colors',
              readonly
                ? 'cursor-default'
                : 'cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
            )}
            aria-label={`${rating} star${rating !== 1 ? 's' : ''}`}
            aria-checked={rating === value}
            tabIndex={readonly ? -1 : 0}
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
});

StarRating.displayName = 'StarRating';
