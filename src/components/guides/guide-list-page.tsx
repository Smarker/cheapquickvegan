"use client";

import { useState } from "react";
import GuideCard from "./guide-card";
import GuideCardCompact from "./guide-card-compact";
import { GuideSearchBar } from "./guide-search-bar";
import { Guide } from "@/types/guide";
import { filterGuides } from "@/lib/utils";

type CardVariant = "detailed" | "compact";

interface GuideListPageProps {
  guides: Guide[];
  title: string;
  cardVariant?: CardVariant;
}

const gridClasses: Record<CardVariant, string> = {
  detailed: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
  compact: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6",
};

export default function GuideListPage({
  guides,
  title,
  cardVariant = "detailed",
}: GuideListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const filteredGuides = filterGuides(guides, searchQuery);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight text-foreground ${isSearchExpanded ? "hidden md:block" : ""}`}
        >
          {title}
        </h1>
        <GuideSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onExpandChange={setIsSearchExpanded}
        />
      </div>

      {filteredGuides.length === 0 ? (
        <p className="text-muted-foreground">
          No guides found{searchQuery && ` for "${searchQuery}"`}.
        </p>
      ) : (
        <div className={`grid ${gridClasses[cardVariant]} w-full`}>
          {filteredGuides.map((guide) =>
            cardVariant === "detailed" ? (
              <GuideCard key={guide.id} guide={guide} />
            ) : (
              <GuideCardCompact key={guide.id} guide={guide} />
            )
          )}
        </div>
      )}
    </div>
  );
}
