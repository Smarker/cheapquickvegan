"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecipeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipeSearchBar({ value, onChange }: RecipeSearchBarProps) {
  return (
    <div className="hidden md:block relative w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search recipes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

export function MobileSearchBar({ value, onChange }: RecipeSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClose = () => {
    setIsExpanded(false);
    onChange("");
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
      {!isExpanded ? (
        <div className="flex justify-center py-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Open search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search recipes</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
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
  );
}
