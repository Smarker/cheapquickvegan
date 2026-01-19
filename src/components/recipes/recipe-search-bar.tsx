"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecipeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipeSearchBar({ value, onChange, onExpandChange }: RecipeSearchBarProps & { onExpandChange?: (expanded: boolean) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    onChange("");
    onExpandChange?.(false);
  };

  return (
    <>
      {/* Mobile: Icon button that expands inline */}
      <div className="md:hidden flex-1">
        {!isExpanded ? (
          <div className="flex justify-end">
            <button
              onClick={handleExpand}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="recipe-search-mobile"
                name="recipe-search"
                type="text"
                placeholder="Search recipes..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop: Always visible search bar */}
      <div className="hidden md:block relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="recipe-search-desktop"
          name="recipe-search"
          type="text"
          placeholder="Search recipes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </>
  );
}
