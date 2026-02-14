import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { parseRecipeContent } from "@/lib/recipe-parser";
import { getAggregateRating } from "@/lib/db/comments";

interface RoundupRecipeCardProps {
  recipe: Recipe;
  index: number;
}

const ACCENT_COLORS  = ["#735d78", "#a3b18a", "#c4a882"];
// Darkened — badge, pills
const PILL_COLORS    = ["#5a4762", "#697a58", "#8a6a40"];
// Mid-point between pill and accent — button base (still passes white text contrast)
const BUTTON_COLORS  = ["#665470", "#708560", "#9e784e"];

/** Convert ISO 8601 duration to human-readable, e.g. "PT1H30M" → "1 hr 30 min" */
function formatDuration(iso?: string): string | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const mins  = match[2] ? parseInt(match[2]) : 0;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr`;
  if (mins  > 0) return `${mins} min`;
  return null;
}

export async function RoundupRecipeCard({ recipe, index }: RoundupRecipeCardProps) {
  const href        = `/recipes/${recipe.slug}`;
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const pillColor   = PILL_COLORS[index % PILL_COLORS.length];
  const buttonColor = BUTTON_COLORS[index % BUTTON_COLORS.length];
  const number      = String(index + 1).padStart(2, "0");

  // --- Cook time ---
  const { totalTime, cookTime, prepTime } = recipe.content
    ? parseRecipeContent(recipe.content)
    : { totalTime: undefined, cookTime: undefined, prepTime: undefined };
  const displayTime = formatDuration(totalTime ?? cookTime ?? prepTime);

  // --- Aggregate rating ---
  let rating = { average: 0, count: 0 };
  try {
    const r = await getAggregateRating(recipe.id);
    rating = { average: r.average, count: r.count };
  } catch {
    // DB not available in local dev
  }

  const displayTags = recipe.tags?.filter(
    (t) => t.toLowerCase() !== "air fryer"
  ) ?? [];

  return (
    <div className="relative sm:pt-4 sm:pl-4">

      {/* Number badge — overflows the wrapper, straddles card top-left corner */}
      <div
        className="hidden sm:flex absolute z-20 top-0 left-0 items-center justify-center w-14 h-14 rounded-xl text-white font-black text-xl select-none pointer-events-none"
        style={{
          backgroundColor: pillColor,
          transform: "rotate(-12deg)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
        aria-hidden
      >
        {number}
      </div>

      <article className="not-prose group relative flex flex-col sm:grid sm:grid-cols-[260px_1fr] sm:h-64 rounded-t-xl sm:rounded-none bg-card shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">

        {/* Overlay — entire card is clickable; CTA is z-20 to stay interactive */}
        <Link
          href={href}
          className="absolute inset-0 z-10"
          aria-label={recipe.title}
          tabIndex={-1}
        />

        {/* Image */}
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-xl sm:rounded-none">
          {recipe.coverImage ? (
            <Image
              src={recipe.coverImage}
              alt={recipe.alt || recipe.title}
              fill
              className="m-0 rounded-none object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 260px"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
        </div>

        {/* Content */}
        <div className="relative flex flex-col px-5 py-4 flex-1 min-w-0">
          {/* Left accent bar: desktop only */}
          <div
            className="hidden sm:block absolute left-0 inset-y-0 w-1"
            style={{ backgroundColor: accentColor }}
          />

          {/* Top: metadata + title + description */}
          <div>
            {/* Row 1: mobile number pill · cuisine · time (left)  stars (right) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 text-xs font-bold text-foreground/70">
                <span
                  className="sm:hidden font-black px-2.5 py-1 rounded text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: pillColor }}
                >
                  {number}
                </span>
                {recipe.recipeCuisine && (
                  <span className="tracking-wide uppercase truncate">
                    {recipe.recipeCuisine}
                  </span>
                )}
                {recipe.recipeCuisine && displayTime && (
                  <span className="text-foreground/30 shrink-0">·</span>
                )}
                {displayTime && (
                  <span className="flex items-center gap-1 shrink-0 font-medium text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {displayTime}
                  </span>
                )}
              </div>
              {rating.count > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-bold shrink-0 text-amber-500">
                  ★ {rating.average.toFixed(1)}
                  <span className="font-normal text-muted-foreground ml-0.5">
                    ({rating.count})
                  </span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold leading-snug text-foreground line-clamp-2">
              {recipe.title}
            </h3>

            {/* Description */}
            <p className="mt-1.5 sm:mt-2.5 text-muted-foreground text-sm line-clamp-3 sm:line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Footer: tags + CTA — mt-auto pins it to bottom without forced gap */}
          <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-2">
            {displayTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-white"
                    style={{ backgroundColor: pillColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Button — lighter shade, shine sweep on card hover, scale on click */}
            <Link
              href={href}
              className="relative z-20 overflow-hidden flex justify-center sm:inline-flex items-center gap-1.5 w-full sm:w-auto shrink-0 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: buttonColor }}
            >
              {/* Shine sweep triggered by hovering anywhere on the card */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                aria-hidden
              />
              Make this recipe
              <span className="relative inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
