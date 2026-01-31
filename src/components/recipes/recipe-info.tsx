import { Clock, ChefHat, Timer, Users, Snowflake } from "lucide-react";

interface RecipeInfoProps {
  prepTime?: string;
  cookTime?: string;
  chillTime?: string;
  totalTime?: string;
  recipeYield?: string;
  layout?: "horizontal" | "vertical";
}

function formatDuration(duration: string): string {
  return duration
    .replace('PT', '')
    .replace('H', ' hr ')
    .replace('M', ' min')
    .trim();
}

export function RecipeInfo({
  prepTime,
  cookTime,
  chillTime,
  totalTime,
  recipeYield,
  layout = "horizontal",
}: RecipeInfoProps) {
  // Don't render if no data
  if (!prepTime && !cookTime && !chillTime && !totalTime && !recipeYield) {
    return null;
  }

  if (layout === "vertical") {
    return (
      <section
        aria-label="Recipe information"
        className="not-prose p-3 rounded-lg bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        <div className="flex flex-col gap-2 text-sm">
          {prepTime && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Prep Time</span>
              </div>
              <span className="font-medium pl-5">{formatDuration(prepTime)}</span>
            </div>
          )}

          {cookTime && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Cook Time</span>
              </div>
              <span className="font-medium pl-5">{formatDuration(cookTime)}</span>
            </div>
          )}

          {chillTime && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Chill Time</span>
              </div>
              <span className="font-medium pl-5">{formatDuration(chillTime)}</span>
            </div>
          )}

          {totalTime && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Total Time</span>
              </div>
              <span className="font-medium pl-5">{formatDuration(totalTime)}</span>
            </div>
          )}

          {recipeYield && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Servings</span>
              </div>
              <span className="font-medium pl-5">{recipeYield}</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Recipe information"
      className="not-prose mb-6 p-3 rounded-lg bg-muted/50 border"
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {prepTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Prep:</span>
            <span className="font-medium">{formatDuration(prepTime)}</span>
          </div>
        )}

        {cookTime && (
          <div className="flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Cook:</span>
            <span className="font-medium">{formatDuration(cookTime)}</span>
          </div>
        )}

        {chillTime && (
          <div className="flex items-center gap-1.5">
            <Snowflake className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Chill:</span>
            <span className="font-medium">{formatDuration(chillTime)}</span>
          </div>
        )}

        {totalTime && (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{formatDuration(totalTime)}</span>
          </div>
        )}

        {recipeYield && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Servings:</span>
            <span className="font-medium">{recipeYield}</span>
          </div>
        )}
      </div>
    </section>
  );
}
