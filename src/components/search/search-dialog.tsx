"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotionImage } from "@/components/notion-image";
import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { Guide } from "@/types/guide";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recipes and guides when dialog opens
  useEffect(() => {
    if (open && recipes.length === 0 && guides.length === 0) {
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          setRecipes(data.recipes || []);
          setGuides(data.guides || []);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search data:", error);
          setIsLoading(false);
        });
    }
  }, [open, recipes.length, guides.length]);

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return { recipes: [], guides: [] };

    const query = searchQuery.toLowerCase();
    const filteredRecipes = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
    const filteredGuides = guides.filter((guide) =>
      guide.title.toLowerCase().includes(query)
    );

    return { recipes: filteredRecipes, guides: filteredGuides };
  }, [searchQuery, recipes, guides]);

  const handleClose = () => {
    setSearchQuery("");
    onOpenChange(false);
  };

  const totalResults = filteredResults.recipes.length + filteredResults.guides.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div ref={dropdownRef} className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 md:w-[500px] bg-background border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh] p-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-8 text-muted-foreground">
              Start typing to search recipes and guides
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recipes Results */}
              {filteredResults.recipes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    RECIPES ({filteredResults.recipes.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.recipes.map((recipe) => (
                      <Link
                        key={recipe.id}
                        href={`/recipes/${recipe.slug}`}
                        onClick={handleClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {recipe.coverImage && (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                            <NotionImage
                              src={recipe.coverImage}
                              alt={recipe.alt || recipe.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{recipe.title}</p>
                          {recipe.categories && recipe.categories.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              {recipe.categories[0]}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Guides Results */}
              {filteredResults.guides.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    GUIDES ({filteredResults.guides.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.guides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        onClick={handleClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {guide.coverImage && (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                            <NotionImage
                              src={guide.coverImage}
                              alt={guide.alt || guide.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{guide.title}</p>
                          {guide.category && (
                            <p className="text-xs text-muted-foreground truncate">
                              {guide.category}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
