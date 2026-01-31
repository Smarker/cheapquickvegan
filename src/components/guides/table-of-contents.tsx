"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ContentSection } from "@/types/content";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

interface TableOfContentsProps {
  sections: ContentSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

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

  if (sections.length === 0) {
    return null;
  }

  const TOCContent = () => (
    <nav className="space-y-1">
      {sections.map((section) => {
        return (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
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
  );

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
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Table of Contents</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <TOCContent />
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
          <TOCContent />
        </div>
      </aside>
    </>
  );
}
