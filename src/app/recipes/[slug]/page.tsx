import { getRecipesFromCache } from "@/lib/notion";
import { Recipe } from "@/types/recipe";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { ResolvingMetadata } from "next";
import { Badge } from "@/components/ui/badge";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { NotionImage } from "@/components/notion-image";
import { SITE_URL } from "@/config/constants";
import { parseRecipeContent } from "@/lib/recipe-parser";
import { FavoriteButton } from "@/components/recipes/favorite-button";
import { CommentSection } from "@/components/comments/comment-section";
import { Separator } from "@/components/ui/separator";
import { getAggregateRating } from "@/lib/db/comments";
import { SocialIcons } from "@/components/recipes/social-icons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Clock } from "lucide-react";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: RecipePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const recipes = getRecipesFromCache();
  const recipe = recipes.find((r) => r.slug === slug);

  if (!recipe) {
    return {
      title: "Recipe Not Found",
    };
  }

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: { canonical: `${SITE_URL}/recipes/${recipe.slug}` },
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: "article",
      url: `${SITE_URL}/recipes/${recipe.slug}`,
      publishedTime: new Date(recipe.date).toISOString(),
      modifiedTime: new Date(recipe.lastUpdated || recipe.date).toISOString(),
      authors: ["Stephanie Marker"],
      tags: recipe.tags,
      images: [
        {
          url: recipe.coverImage || `${SITE_URL}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: recipe.alt || recipe.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description,
      images: [{ url: recipe.coverImage || `${SITE_URL}/opengraph-image.png`, alt: recipe.alt || recipe.title }],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipes = getRecipesFromCache();
  const recipe = recipes.find((r) => r.slug === slug);

  if (!recipe) notFound();

  const { ingredients, instructions, prepTime, cookTime, totalTime, recipeYield } = recipe.content
    ? parseRecipeContent(recipe.content)
    : { ingredients: [], instructions: [] };

  // --- AGGREGATE RATING FOR SEO ---
  let aggregateRating = { average: 0, count: 0, total: 0 };
  try {
    aggregateRating = await getAggregateRating(recipe.id);
  } catch (error) {
    // Database not available (e.g., in development)
    console.warn('Could not fetch aggregate rating:', error);
  }

  // --- RELATED RECIPES LOGIC ---
  let relatedRecipes: Recipe[] = [];

  if (recipe.relatedRecipes?.length) {
    relatedRecipes = recipe.relatedRecipes
      .map((id: string) => recipes.find((r: Recipe) => r.id === id))
      .filter((r: Recipe | undefined): r is Recipe => Boolean(r))
      .slice(0, 3);
  } else if (recipe.categories) {
    const sameCategory = recipes.filter(
      (r) => r.categories[0] === recipe.categories[0] && r.id !== recipe.id
    );
    relatedRecipes = sameCategory.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: recipe.coverImage
      ? recipe.coverImage.startsWith("http")
        ? recipe.coverImage
        : `${SITE_URL}${recipe.coverImage}`
      : `${SITE_URL}/opengraph-image.png`,
    author: { "@type": "Person", name: "Stephanie Marker" },
    datePublished: new Date(recipe.date).toISOString(),
    dateModified: new Date(recipe.lastUpdated || recipe.date).toISOString(),
    recipeCategory: recipe.categories?.[0] || undefined,
    recipeCuisine: recipe.recipeCuisine || undefined,
    keywords: recipe.tags?.join(", ") || undefined,
    recipeIngredient: ingredients.map((ing) => ing.replace(/^-+\s*/, "")),
    recipeInstructions: instructions
      .filter((step) => step.text.trim() && step.text.trim() !== "---")
      .map((step) => {
        const howToStep: any = {
          "@type": "HowToStep",
          text: step.text,
          name: step.name,
          url: `${SITE_URL}/recipes/${recipe.slug}${step.url}`,
        };

        if (step.image) {
          howToStep.image = step.image.startsWith('http')
            ? step.image
            : `${SITE_URL}${step.image}`;
        }

        return howToStep;
      }),
    prepTime,
    cookTime,
    totalTime,
    recipeYield,
    ...(aggregateRating.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.average.toFixed(1),
        reviewCount: aggregateRating.count,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/recipes/${recipe.slug}` },
  };

  // Use the recipe's primary category (first category) for breadcrumbs
  const category = recipe.categories[0];

  // Build breadcrumb items with each category as a separate item
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Recipes",
      item: `${SITE_URL}/recipes`,
    },
    ...recipe.categories.map((cat, index) => ({
      "@type": "ListItem",
      position: 3 + index,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      item: `${SITE_URL}/recipes/category/${cat.toLowerCase()}`,
    })),
    {
      "@type": "ListItem",
      position: 3 + recipe.categories.length,
      name: recipe.title,
      item: `${SITE_URL}/recipes/${recipe.slug}`,
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* --- Main Recipe Image --- */}
        {recipe.coverImage && (
          <div className="relative w-full aspect-[4/3] max-h-[250px] sm:max-h-[280px] md:max-h-[320px] overflow-hidden rounded-lg mb-4 sm:mb-2">
            <NotionImage
              src={recipe.coverImage}
              alt={recipe.alt || recipe.title}
              className="object-cover w-full h-full"
            />
            <FavoriteButton recipeId={recipe.id} />
          </div>
        )}

        {/* --- Prose Content --- */}
        <article className="prose dark:prose-invert">
          <header className="mb-2">
            {/* --- Meta Info Bar: Date, Social Icons, and Breadcrumbs --- */}
            {/* When both Published and Updated dates exist, dates take full width and socials/breadcrumbs wrap to new line */}
            {/* When only Published date exists, everything stays on one line */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-1.5 text-muted-foreground sm:mb-1.5 text-sm leading-tight">
              {/* Date info - takes full width when both dates exist */}
              <div className={`flex flex-wrap gap-x-4 gap-y-1 leading-tight ${recipe.lastUpdated && recipe.lastUpdated !== recipe.date ? 'sm:w-full' : ''}`}>
                <span className="flex items-center gap-1.5 leading-tight">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">Published:</span> <time dateTime={new Date(recipe.date).toISOString()}>{format(new Date(recipe.date), "MMMM d, yyyy")}</time>
                </span>
                {recipe.lastUpdated && recipe.lastUpdated !== recipe.date && (
                  <span className="flex items-center gap-1.5 leading-tight">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">Updated:</span> <time dateTime={new Date(recipe.lastUpdated).toISOString()}>{format(new Date(recipe.lastUpdated), "MMMM d, yyyy")}</time>
                  </span>
                )}
              </div>

              {/* Social Icons and Breadcrumbs - wrap to new line when both dates exist */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
                {/* Social Icons */}
                <div className="sm:ml-2">
                  <SocialIcons />
                </div>

                {/* Breadcrumbs - categories grouped with / separator */}
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Recipes", href: "/recipes" },
                    {
                      items: recipe.categories.map((cat) => ({
                        label: cat.charAt(0).toUpperCase() + cat.slice(1),
                        href: `/recipes/category/${cat.toLowerCase()}`,
                      })),
                    },
                  ]}
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              {recipe.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.categories && <Badge variant="secondary">{recipe.categories[0]}</Badge>}
              {recipe.recipeCuisine && <Badge variant="default">{recipe.recipeCuisine}</Badge>}
              {recipe.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </header>

          <ReactMarkdown
            components={{
              img: ({ src, alt, ...props }) => {
                if (!src || typeof src !== "string") return null;
                return (
                  <NotionImage
                    src={src}
                    alt={alt ?? recipe.title}
                    className="mt-0 mb-4"
                    inline={true}
                    {...props}
                  />
                );
              },
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {recipe.content}
          </ReactMarkdown>

          {/* --- Comment Section --- */}
          <div className="not-prose my-8 sm:my-12">
            <Separator className="mb-8" />
            <CommentSection recipeId={recipe.id} />
          </div>

          {/* --- Related Recipes --- */}
          {relatedRecipes.length > 0 && (
  <section className="mt-6 sm:mt-12">
    <h2 className="text-2xl font-semibold mb-2 sm:mb-4">Try these similar recipes</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      {relatedRecipes.map((r) => (
        <a
          key={r.id}
          href={`/recipes/${r.slug}`}
          className="relative block rounded overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          {/* Set fixed height on mobile/tablet, larger on desktop */}
          <div className="relative w-full h-56 sm:h-60 md:h-64 lg:h-72 overflow-hidden">
            <NotionImage
              src={r.coverImage}
              alt={r.alt || r.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-1 sm:bottom-2 left-2 sm:left-3 right-2 sm:right-3">
              <h3 className="text-white font-semibold text-lg line-clamp-2">{r.title}</h3>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
)}

        </article>
      </div>
    </>
  );
}
