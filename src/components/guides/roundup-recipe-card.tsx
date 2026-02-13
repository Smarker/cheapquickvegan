import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@/types/recipe";

interface RoundupRecipeCardProps {
  recipe: Recipe;
  index: number;
}

const ACCENT_COLORS = ["#735d78", "#a3b18a", "#c4a882"];

export function RoundupRecipeCard({ recipe, index }: RoundupRecipeCardProps) {
  const href = `/recipes/${recipe.slug}`;
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const number = String(index + 1).padStart(2, "0");

  const displayTags = recipe.tags?.filter(
    (t) => t.toLowerCase() !== "air fryer"
  ) ?? [];

  return (
    // Grid on sm so image cell stretches to explicit sm:h-64 container height
    <article className="not-prose group relative flex flex-col sm:grid sm:grid-cols-[260px_1fr] sm:h-64 rounded-xl sm:rounded-tl-none sm:rounded-bl-none overflow-hidden bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">

      {/* Rotated number badge pinned to the top-left corner of the card */}
      <div
        className="hidden sm:flex absolute z-10 items-center justify-center w-11 h-11 rounded-lg shadow-md text-white font-black text-base select-none pointer-events-none"
        style={{
          backgroundColor: accentColor,
          top: "8px",
          left: "8px",
          transform: "rotate(-10deg)",
        }}
        aria-hidden
      >
        {number}
      </div>

      {/* Image — overflow-hidden + rounded left corners clipped here */}
      <Link
        href={href}
        className="relative block h-56 sm:h-64 overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        {recipe.coverImage ? (
          <Image
            src={recipe.coverImage}
            alt={recipe.alt || recipe.title}
            fill
            className="m-0 object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 260px"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </Link>

      {/* Content */}
      <div className="relative flex flex-col justify-between px-5 py-5 flex-1 min-w-0">
        {/* Left accent bar: 2px on mobile, 4px on desktop */}
        <div
          className="absolute left-0 inset-y-0 w-0.5 sm:w-1"
          style={{ backgroundColor: accentColor }}
        />
        <div className="space-y-1.5">
          {/* Mobile number pill + cuisine */}
          <div className="flex items-center gap-2.5">
            <span
              className="sm:hidden text-xs font-bold px-2 py-0.5 rounded text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {number}
            </span>
            {recipe.recipeCuisine && (
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: accentColor }}
              >
                {recipe.recipeCuisine}
              </p>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold leading-snug text-foreground line-clamp-3 sm:line-clamp-2">
            <Link href={href} className="hover:underline">
              {recipe.title}
            </Link>
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-4 sm:line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-2">
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Link
            href={href}
            className="flex justify-center sm:inline-flex items-center gap-1.5 w-full sm:w-auto shrink-0 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            Make this recipe
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
