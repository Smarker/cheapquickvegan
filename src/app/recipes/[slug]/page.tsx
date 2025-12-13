import { getPostsFromCache } from "@/lib/notion";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { ResolvingMetadata } from "next";
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime, getWordCount } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { NotionImage } from "@/components/notion-image";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: PostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const recipes = getPostsFromCache();
  const post = recipes.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/recipes/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteUrl}/recipes/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Stephanie Marker"],
      tags: post.tags,
      images: [
        {
          url: post.coverImage || `${siteUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: post.alt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [{ url: post.coverImage || `${siteUrl}/opengraph-image.png`, alt: post.alt || post.title }],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const recipes = getPostsFromCache();
  const post = recipes.find((p) => p.slug === slug);
  const wordCount = post?.content ? getWordCount(post.content) : 0;

  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  const { ingredients, instructions, prepTime, cookTime, totalTime, recipeYield } = post.content
    ? parseRecipeContent(post.content)
    : { ingredients: [], instructions: [] };

  // --- RELATED RECIPES LOGIC ---
  let relatedRecipes: any[] = [];

  if (post.relatedRecipes?.length) {
    relatedRecipes = post.relatedRecipes
      .map((id) => recipes.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 3);
  } else if (post.categories) {
    const sameCategory = recipes.filter(
      (p) => p.categories[0] === post.categories[0] && p.id !== post.id
    );
    relatedRecipes = sameCategory.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: post.title,
    description: post.description,
    image: post.coverImage
      ? post.coverImage.startsWith("http")
        ? post.coverImage
        : `${siteUrl}${post.coverImage}`
      : `${siteUrl}/opengraph-image.png`,
    author: { "@type": "Person", name: "Stephanie Marker" },
    datePublished: new Date(post.date).toISOString(),
    recipeCategory: post.categories?.[0] || undefined,
    recipeCuisine: post.recipeCuisine || undefined,
    keywords: post.tags?.join(", ") || undefined,
    recipeIngredient: ingredients.map((ing) => ing.replace(/^-+\s*/, "")),
    recipeInstructions: instructions
      .filter((step) => step.trim() && step.trim() !== "---")
      .map((step) => ({ "@type": "HowToStep", text: step.replace(/^-+\s*/, "").trim() })),
    prepTime,
    cookTime,
    totalTime,
    recipeYield,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/recipes/${post.slug}` },
  };

  const category = post.categories[0];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recipes",
        item: `${siteUrl}/recipes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${siteUrl}/recipes/category/${category.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `${siteUrl}/recipes/${post.slug}`,
      },
    ],
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
        {post.coverImage && (
          <div className="relative w-full aspect-[4/3] max-h-[250px] sm:max-h-[280px] md:max-h-[320px] overflow-hidden rounded-lg mb-4 sm:mb-6 md:mb-8">
            <NotionImage
              src={post.coverImage}
              alt={post.alt || post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* --- Prose Content --- */}
        <article className="prose dark:prose-invert">
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 text-muted-foreground mb-2 sm:mb-4 text-sm">
              <time>{format(new Date(post.date), "MMMM d, yyyy")}</time>
              <span>{calculateReadingTime(wordCount)}</span>
              <span>{wordCount} words</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories && <Badge variant="secondary">{post.categories[0]}</Badge>}
              {post.recipeCuisine && <Badge variant="default">{post.recipeCuisine}</Badge>}
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </header>

          <ReactMarkdown
            components={{
              img: ({ src, alt, ...props }) => {
                if (!src || typeof src !== "string") return null;
                return (
                  <div className="relative w-full aspect-[16/9] sm:aspect-[3/2] md:aspect-[4/3] mb-4">
                    <NotionImage
                      src={src}
                      alt={alt ?? post.title}
                      className="object-cover w-full h-full"
                      {...props}
                    />
                  </div>
                );
              },
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>

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

// ---- Recipe Parsing Utilities ----
interface RecipeContent {
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
}

function parseRecipeContent(markdown: string): RecipeContent {
  const lines = markdown.split("\n").map((l) => l.trim());
  let section: "ingredients" | "instructions" | "details" | null = null;
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let prepTime: string | undefined;
  let cookTime: string | undefined;
  let totalTime: string | undefined;
  let recipeYield: string | undefined;

  for (const line of lines) {
    if (/^##\s*Recipe Details/i.test(line)) {
      section = "details";
    }
    else if (/^##\s*Ingredients/i.test(line)) section = "ingredients";
    else if (/^##\s*Instructions/i.test(line)) section = "instructions";
    else if (/^##\s*/.test(line)) section = null;
    else if (section === "ingredients" && line) ingredients.push(line);
    else if (section === "instructions" && line) instructions.push(line);
    else if (section === "details" && line) {
      const prepMatch = line.match(/\*\*?Prep Time:\*\*?\s*(.*)/i);
      const cookMatch  = line.match(/\*\*?Cook Time:\*\*?\s*(.*)/i);
      const totalMatch = line.match(/\*\*?Total Time:\*\*?\s*(.*)/i);
      const yieldMatch = line.match(/\*\*?Yield:\*\*?\s*(.*)/i);

      if (prepMatch) prepTime = convertToISO8601(prepMatch[1]);
      if (cookMatch) cookTime = convertToISO8601(cookMatch[1]);
      if (totalMatch) totalTime = convertToISO8601(totalMatch[1]);
      if (yieldMatch) recipeYield = yieldMatch[1];
    }
  }

  if (!totalTime && prepTime && cookTime) totalTime = sumDurations(prepTime, cookTime);

  return { ingredients, instructions, prepTime, cookTime, totalTime, recipeYield };
}

function convertToISO8601(timeStr: string): string {
  const hrMatch = timeStr.match(/(\d+)\s*hr/);
  const minMatch = timeStr.match(/(\d+)\s*min/);
  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  return `PT${hours > 0 ? hours + "H" : ""}${minutes > 0 ? minutes + "M" : ""}`;
}

function sumDurations(prep: string, cook: string): string {
  const prepMatch = prep.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const cookMatch = cook.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const prepH = prepMatch?.[1] ? parseInt(prepMatch[1], 10) : 0;
  const prepM = prepMatch?.[2] ? parseInt(prepMatch[2], 10) : 0;
  const cookH = cookMatch?.[1] ? parseInt(cookMatch[1], 10) : 0;
  const cookM = cookMatch?.[2] ? parseInt(cookMatch[2], 10) : 0;
  const totalMinutes = prepM + cookM;
  const totalHours = prepH + cookH + Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return `PT${totalHours > 0 ? totalHours + "H" : ""}${remainingMinutes > 0 ? remainingMinutes + "M" : ""}`;
}
