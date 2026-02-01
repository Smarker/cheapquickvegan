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
import { parseRecipeContent, generateRecipeTOC } from "@/lib/recipe-parser";
import { CommentSection } from "@/components/comments/comment-section";
import { Separator } from "@/components/ui/separator";
import { getAggregateRating } from "@/lib/db/comments";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Clock } from "lucide-react";
import { RecipeInfo } from "@/components/recipes/recipe-info";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { generateFaqJsonLd } from "@/lib/seo/faq-schema";
import { ContentCarousel } from "@/components/common/content-carousel";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { CookModeToggle } from "@/components/recipes/cook-mode-toggle";

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

  const { ingredients, instructions, prepTime, cookTime, chillTime, totalTime, recipeYield } = recipe.content
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
      .filter((r: Recipe | undefined): r is Recipe => Boolean(r));
  } else if (recipe.categories) {
    const sameCategory = recipes.filter(
      (r) => r.categories[0] === recipe.categories[0] && r.id !== recipe.id
    );
    relatedRecipes = sameCategory.sort(() => 0.5 - Math.random());
  }

  const { sections } = generateRecipeTOC(recipe.content, relatedRecipes.length > 0);

  // Remove Recipe Details section from markdown since we display it in the visual card
  const cleanedContent = recipe.content.replace(
    /#{1,3}\s*Recipe Details?\s*\n[\s\S]*?(?=\n#{1,3}\s|\n\n[A-Z]|\Z)/i,
    ''
  ).trim();

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
    chillTime,
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

  // Generate FAQ schema if content contains FAQs
  const faqJsonLd = recipe.content ? generateFaqJsonLd(recipe.content) : null;

  // Use the recipe's primary category (first category) for breadcrumbs
  const category = recipe.categories[0];

  // Build breadcrumb items with each category as a separate item
  const breadcrumbItems = [
    { name: "Home", path: "" },
    { name: "Recipes", path: "/recipes" },
    ...recipe.categories.map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      path: `/recipes/category/${cat.toLowerCase()}`,
    })),
    { name: recipe.title, path: `/recipes/${recipe.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {faqJsonLd && faqJsonLd.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-4">
          {/* Main Content */}
          <div className="max-w-3xl">
            {/* --- Main Recipe Image --- */}
            {recipe.coverImage && (
              <div className="relative w-full aspect-[4/3] max-h-[250px] sm:max-h-[280px] md:max-h-[320px] overflow-hidden rounded-lg mb-4 sm:mb-2">
                <NotionImage
                  src={recipe.coverImage}
                  alt={recipe.alt || recipe.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* --- Prose Content --- */}
            <article className="prose dark:prose-invert max-w-none">
          <header className="mb-2">
            {/* --- Meta Info Bar: Date, Breadcrumbs, and Cook Mode --- */}
            {/* When both Published and Updated dates exist, dates take full width and breadcrumbs wrap to new line */}
            {/* When only Published date exists, everything stays on one line */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-0.5 sm:gap-1.5 text-muted-foreground sm:mb-1.5 leading-tight">
              {/* Date info - takes full width when both dates exist */}
              <div className={`flex flex-wrap gap-x-4 gap-y-1 leading-tight text-sm ${recipe.lastUpdated && recipe.lastUpdated !== recipe.date ? 'sm:w-full' : ''}`}>
                <span className="flex items-baseline gap-1.5 leading-tight">
                  <Clock className="w-3.5 h-3.5 translate-y-0.5" />
                  <span className="font-medium text-sm">Published:</span> <time dateTime={new Date(recipe.date).toISOString()}>{format(new Date(recipe.date), "MMMM d, yyyy")}</time>
                </span>
                {recipe.lastUpdated && recipe.lastUpdated !== recipe.date && (
                  <span className="flex items-baseline gap-1.5 leading-tight">
                    <Clock className="w-3.5 h-3.5 translate-y-0.5" />
                    <span className="font-medium text-sm">Updated:</span> <time dateTime={new Date(recipe.lastUpdated).toISOString()}>{format(new Date(recipe.lastUpdated), "MMMM d, yyyy")}</time>
                  </span>
                )}
              </div>

              {/* Breadcrumbs & Cook Mode - wrap to new line when both dates exist */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 leading-tight w-full sm:w-auto -translate-y-0.5 mb-3 sm:mb-0">
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
                {/* Cook Mode - Mobile inline, compact variant */}
                <div className="lg:hidden">
                  <CookModeToggle variant="compact" />
                </div>
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

            {/* Recipe Information Section */}
            <RecipeInfo
              prepTime={prepTime}
              cookTime={cookTime}
              chillTime={chillTime}
              totalTime={totalTime}
              recipeYield={recipeYield}
            />
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
              h2: ({ children, ...props }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                return <h2 id={id} {...props}>{children}</h2>;
              },
              h3: ({ children, ...props }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                return <h3 id={id} {...props}>{children}</h3>;
              },
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {cleanedContent}
          </ReactMarkdown>

          {/* --- Comment Section --- */}
          <div id="reviews" className="not-prose my-8 sm:my-12 print:hidden">
            <Separator className="mb-8" />
            <CommentSection recipeId={recipe.id} />
          </div>

            </article>
          </div>

          {/* Table of Contents - Desktop Sidebar */}
          <div className="print:hidden">
            <TableOfContents
              sections={sections}
              shareData={{
                recipeId: recipe.id,
                recipeTitle: recipe.title,
                recipeDescription: recipe.description,
                recipeUrl: `${SITE_URL}/recipes/${recipe.slug}`,
              }}
              ratingData={{
                averageRating: aggregateRating.average,
                reviewCount: aggregateRating.count,
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Related Recipes --- Full Width */}
      {relatedRecipes.length > 0 && (
        <section id="related-recipes" className="max-w-6xl mx-auto px-4 mt-12 mb-12 print:hidden">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Try these similar recipes</h2>
          <ContentCarousel items={relatedRecipes} basePath="/recipes" itemsPerPage={3} />
        </section>
      )}

      {/* Cook Mode - Floating Button (Desktop only) */}
      <div className="hidden lg:block fixed top-32 right-6 z-40 print:hidden">
        <CookModeToggle />
      </div>
    </>
  );
}
