"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecipeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipeSearchBar({ value, onChange }: RecipeSearchBarProps) {
  return (
    <div className="relative max-w-md">
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
