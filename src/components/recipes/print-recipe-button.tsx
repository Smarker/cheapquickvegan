"use client";

import { Printer } from "lucide-react";

export function PrintRecipeButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg transition-all duration-200 shadow-lg bg-background/95 hover:bg-muted border text-foreground backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label="Print recipe"
    >
      <Printer className="w-6 h-6" />
      <span className="text-[10px] font-medium leading-tight text-center max-w-[50px]">
        Print Recipe
      </span>
    </button>
  );
}
