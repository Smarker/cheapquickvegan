"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ContentSection } from "@/types/content";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List, Instagram, Facebook, Heart, Printer } from "lucide-react";
import { ShareButtons } from "@/components/recipes/share-buttons";
import { RatingWidget } from "@/components/recipes/rating-widget";
import { useFavorites } from "@/contexts/favorites-context";
import { SOCIAL_LINKS } from "@/config/social";

interface TableOfContentsProps {
  sections: ContentSection[];
  shareData?: {
    recipeId: string;
    recipeTitle: string;
    recipeDescription: string;
    recipeUrl: string;
  };
  ratingData?: {
    averageRating: number;
    reviewCount: number;
  };
}

interface TOCContentProps {
  sections: ContentSection[];
  activeId: string;
  onSectionClick: (id: string) => void;
  shareData?: TableOfContentsProps["shareData"];
  ratingData?: TableOfContentsProps["ratingData"];
  favorited: boolean;
  onToggleFavorite: (id: string) => void;
  onPrint: () => void;
}

function TOCContent({ sections, activeId, onSectionClick, shareData, ratingData, favorited, onToggleFavorite, onPrint }: TOCContentProps) {
  return (
    <div className="space-y-4">
      {sections.length > 0 && (
        <nav className="space-y-1">
          {sections.map((section) => {
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
                  section.level === 3 && "pl-6",
                  activeId === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {section.icon && <span className="text-base flex-shrink-0">{section.icon}</span>}
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Compact Actions Section */}
      {shareData && (
        <section
          role="region"
          aria-label="Recipe actions"
          className="pt-4 border-t px-4 space-y-3"
        >
          {/* Save & Print */}
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold text-muted-foreground">SAVE & PRINT</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(shareData.recipeId)}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 hover:scale-110 transition-transform"
                aria-label={favorited ? "Remove recipe from favorites" : "Save recipe to favorites"}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 md:w-5 md:h-5 fill-current transition-colors",
                    favorited ? "text-rose-600" : "text-muted-foreground/80"
                  )}
                  strokeWidth={2}
                  style={{
                    filter: favorited
                      ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                    stroke: 'white',
                    strokeWidth: '1.5px'
                  }}
                />
              </button>
              <button
                onClick={onPrint}
                className="inline-flex items-center justify-center w-8 h-8 md:w-7 md:h-7 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Print recipe"
                title="Print recipe"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rate */}
          {ratingData && (
            <div className="flex items-center justify-between min-h-[28px]">
              <span className="text-xs font-semibold text-muted-foreground">RATE RECIPE</span>
              <RatingWidget
                recipeId={shareData.recipeId}
                averageRating={ratingData.averageRating}
                reviewCount={ratingData.reviewCount}
              />
            </div>
          )}

          {/* Share */}
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold text-muted-foreground">SHARE</span>
            <ShareButtons
              recipeId={shareData.recipeId}
              recipeTitle={shareData.recipeTitle}
              recipeDescription={shareData.recipeDescription}
              recipeUrl={shareData.recipeUrl}
              variant="inline"
              showLabel={false}
              compact={true}
            />
          </div>

          {/* Follow */}
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold text-muted-foreground">FOLLOW FOR MORE</span>
            <div className="flex items-center gap-1.5">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 md:w-7 md:h-7 rounded-full bg-muted hover:bg-[#E4405F] hover:text-white transition-colors duration-200"
                aria-label="Follow us on Instagram"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 md:w-7 md:h-7 rounded-full bg-muted hover:bg-[#1877F2] hover:text-white transition-colors duration-200"
                aria-label="Follow us on Facebook"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export function TableOfContents({ sections, shareData, ratingData }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const favorited = shareData ? isFavorite(shareData.recipeId) : false;

  useEffect(() => {
    // Track scroll position and highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
      }
    );

    // Observe all headings
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sections]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsOpen(false);
    }
  };

  const handlePrint = () => {
    setIsOpen(false);
    // Delay to allow TOC drawer to close before print dialog
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Show TOC if there are sections to navigate OR if there are actions (shareData)
  if (sections.length === 0 && !shareData) {
    return null;
  }

  return (
    <>
      {/* Mobile: Sheet/Drawer */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 w-14 p-0"
              aria-label="Table of Contents"
            >
              <List className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] px-6">
            <SheetHeader className="pb-2">
              <SheetTitle>Table of Contents</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate through the recipe and interact with actions
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
              <TOCContent
                sections={sections}
                activeId={activeId}
                onSectionClick={handleClick}
                shareData={shareData}
                ratingData={ratingData}
                favorited={favorited}
                onToggleFavorite={toggleFavorite}
                onPrint={handlePrint}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sticky Sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-4 text-foreground">
            Table of Contents
          </h3>
          <TOCContent
            sections={sections}
            activeId={activeId}
            onSectionClick={handleClick}
            shareData={shareData}
            ratingData={ratingData}
            favorited={favorited}
            onToggleFavorite={toggleFavorite}
            onPrint={handlePrint}
          />
        </div>
      </aside>
    </>
  );
}
