"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "./search-dialog";

export function SearchButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors"
        aria-label="Search recipes and guides"
        title="Search"
      >
        <Search className="w-5 h-5" />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
