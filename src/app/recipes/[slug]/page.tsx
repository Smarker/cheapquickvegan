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
    alternates: {
      canonical: `${siteUrl}/recipes/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteUrl}/recipes/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: [],
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
      images: [
        {
          url: post.coverImage || `${siteUrl}/opengraph-image.png`,
          alt: post.alt || post.title,
        },
      ],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const recipes = getPostsFromCache();
  const post = recipes.find((p) => p.slug === slug);
  const wordCount = post?.content ? getWordCount(post.content) : 0;

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  const { ingredients, instructions } = post.content
  ? parseRecipeContent(post.content)
  : { ingredients: [], instructions: [] };

  // --- RELATED RECIPES LOGIC ---
  let relatedRecipes: any[] = [];

  // If Related Recipes relation exists and has entries
  if (post.relatedRecipes?.length) {
    relatedRecipes = post.relatedRecipes
      .map((id) => recipes.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 3); // limit to 3
  } else if (post.category) {
    // fallback: random 3 recipes from same category, excluding current post
    const sameCategory = recipes.filter(
      (p) => p.category === post.category && p.id !== post.id
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
    author: {
      "@type": "Person",
      name: post.author || "Guest Author",
    },
    datePublished: new Date(post.date).toISOString(),
    recipeCategory: post.category || undefined,
    keywords: post.tags?.join(", ") || undefined,
    recipeIngredient: ingredients.map((ing) => ing.replace(/^-+\s*/, "")), // remove leading dashes
    recipeInstructions: instructions
      .filter((step) => step.trim() && step.trim() !== "---")
      .map((step) => ({
        "@type": "HowToStep",
        text: step.replace(/^-+\s*/, "").trim(), // remove leading dashes and trim
      })),
    prepTime: undefined,    // ISO 8601 format e.g., "PT10M"
    cookTime: undefined,    // ISO 8601 format e.g., "PT20M"
    totalTime: undefined,  // ISO 8601 format e.g., "PT30M"
    recipeYield: undefined,    // post.yield e.g., "2 servings"
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/recipes/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        {post.coverImage && <NotionImage src={post.coverImage} alt={post.alt || post.title} />}

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 text-muted-foreground mb-4 text-sm">
            <time>{format(new Date(post.date), "MMMM d, yyyy")}</time>
            <span>{calculateReadingTime(wordCount)}</span>
            <span>{wordCount} words</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && <Badge variant="secondary">{post.category}</Badge>}
            {post.tags &&
              post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
          </div>
        </header>

        <div className="max-w-none">
          <ReactMarkdown
            components={{
              img: ({ src, alt, ...props }) => {
                if (!src || typeof src !== "string") return null;
                return <NotionImage src={src} alt={alt ?? post.title} {...props} />;
              },
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

{relatedRecipes.length > 0 && (
  <section className="mt-6 sm:mt-12">
    <h2 className="text-2xl font-semibold mb-2 sm:mb-4">
      Try these similar recipes
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      {relatedRecipes.map((r) => (
        <a
          key={r.id}
          href={`/recipes/${r.slug}`}
          className="relative block rounded overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative w-full h-72 sm:h-56 overflow-hidden">
            <NotionImage
              src={r.coverImage}
              alt={r.alt || r.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-1 sm:bottom-2 left-2 sm:left-3 right-2 sm:right-3">
              <h3 className="text-white font-semibold text-lg line-clamp-2">
                {r.title}
              </h3>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
)}


      </article>
    </>
  );
}

function parseRecipeContent(markdown: string) {
  const lines = markdown.split("\n").map((line) => line.trim());
  let section: "ingredients" | "instructions" | null = null;
  const ingredients: string[] = [];
  const instructions: string[] = [];

  for (const line of lines) {
    if (/^##\s*Ingredients/i.test(line)) {
      section = "ingredients";
      continue;
    }
    if (/^##\s*Instructions/i.test(line)) {
      section = "instructions";
      continue;
    }
    if (/^##\s*/.test(line)) {
      section = null; // skip other headings
      continue;
    }

    if (section === "ingredients" && line) {
      ingredients.push(line);
    } else if (section === "instructions" && line) {
      instructions.push(line);
    }
  }

  return { ingredients, instructions };
}
