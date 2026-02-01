"use client";

import { useState, useMemo, ReactNode } from "react";

type CardVariant = "detailed" | "compact";

interface GenericListPageProps<T> {
  items: T[];
  title: string;
  cardVariant?: CardVariant;
  searchBar: (props: {
    value: string;
    onChange: (value: string) => void;
    onExpandChange: (expanded: boolean) => void;
  }) => ReactNode;
  filterFn: (items: T[], query: string) => T[];
  sortFn?: (items: T[]) => T[];
  renderDetailedCard: (item: T) => ReactNode;
  renderCompactCard: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
  itemTypeName: string;
}

const gridClasses: Record<CardVariant, string> = {
  detailed: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
  compact: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6",
};

export default function GenericListPage<T>({
  items,
  title,
  cardVariant = "detailed",
  searchBar: SearchBar,
  filterFn,
  sortFn,
  renderDetailedCard,
  renderCompactCard,
  getItemKey,
  itemTypeName,
}: GenericListPageProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const filteredItems = useMemo(() => {
    const filtered = filterFn(items, searchQuery);
    return sortFn ? sortFn(filtered) : filtered;
  }, [items, searchQuery, filterFn, sortFn]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight text-foreground ${isSearchExpanded ? "hidden md:block" : ""}`}
        >
          <span className="relative inline-block">
            <span className="relative z-10">{title}</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-400/30 -rotate-1"></span>
          </span>
        </h1>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onExpandChange={setIsSearchExpanded}
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-muted-foreground">
          No {itemTypeName} found{searchQuery && ` for "${searchQuery}"`}.
        </p>
      ) : (
        <div className={`grid ${gridClasses[cardVariant]} w-full`}>
          {filteredItems.map((item) => (
            <div key={getItemKey(item)}>
              {cardVariant === "detailed"
                ? renderDetailedCard(item)
                : renderCompactCard(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
