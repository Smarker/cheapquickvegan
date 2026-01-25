import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { FavoriteButton } from "./favorite-button";

interface RecipeCardProps {
  recipe: Recipe;
  fromCategory?: string;
}

export default function RecipeCard({ recipe, fromCategory }: RecipeCardProps) {
  const href = fromCategory
    ? `/recipes/${recipe.slug}?from=${fromCategory.toLowerCase()}`
    : `/recipes/${recipe.slug}`;

  return (
    <Card className="group relative pt-0 overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <Link
        href={href}
        className="absolute inset-0 z-10"
        aria-label={recipe.title}
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
        {recipe.coverImage ? (
          <Image
            src={recipe.coverImage}
            alt={recipe.alt || recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/80" />
        )}
        {recipe.categories && recipe.categories[0] && (
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 shadow-sm"
            >
              {recipe.categories[0]}
            </Badge>
          </div>
        )}
        <FavoriteButton recipeId={recipe.id} />
      </div>
      <CardHeader className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Updated:</span> {format(new Date(recipe.lastUpdated || recipe.date), "MMM d, yyyy")}
        </div>
        <div className="group-hover:pr-8 transition-all duration-300">
          <h1 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {recipe.title}
          </h1>
          <ArrowUpRight className="absolute top-[7.5rem] right-6 h-6 w-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
        </div>
        <p className="text-muted-foreground line-clamp-2">{recipe.description}</p>
      </CardHeader>
      {(recipe.recipeCuisine || (recipe.tags && recipe.tags.length > 0)) && (
        <CardFooter>
          <div className="flex gap-2 flex-wrap">
            {recipe.recipeCuisine && (
              <Badge variant="default">
                {recipe.recipeCuisine}
              </Badge>
            )}
            {recipe.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background/80">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
