"use client";

import GuideCard from "./guide-card";
import GuideCardCompact from "./guide-card-compact";
import { SearchBar } from "@/components/common/search-bar";
import { Guide } from "@/types/guide";
import { filterGuides } from "@/lib/utils";
import GenericListPage from "@/components/common/generic-list-page";

type CardVariant = "detailed" | "compact";

interface GuideListPageProps {
  guides: Guide[];
  title: string;
  cardVariant?: CardVariant;
}

export default function GuideListPage({
  guides,
  title,
  cardVariant = "detailed",
}: GuideListPageProps) {
  return (
    <GenericListPage
      items={guides}
      title={title}
      cardVariant={cardVariant}
      searchBar={(props) => <SearchBar {...props} placeholder="Search guides..." />}
      filterFn={filterGuides}
      renderDetailedCard={(guide) => <GuideCard guide={guide} />}
      renderCompactCard={(guide) => <GuideCardCompact guide={guide} />}
      getItemKey={(guide) => guide.id}
      itemTypeName="guides"
    />
  );
}
