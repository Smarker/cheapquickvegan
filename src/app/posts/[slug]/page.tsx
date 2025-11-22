import { getPostsFromCache, getWordCount } from "@/lib/notion";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { ResolvingMetadata } from "next";
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime } from "@/lib/utils";
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
  const posts = getPostsFromCache();
  const post = posts.find((p) => p.slug === slug);

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
      canonical: `${siteUrl}/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteUrl}/posts/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      images: [
        {
          url: post.coverImage || `${siteUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
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
          alt: post.title,
        },
      ],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const posts = getPostsFromCache();
  const post = posts.find((p) => p.slug === slug);
  const wordCount = post?.content ? getWordCount(post.content) : 0;

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

  const { ingredients, instructions } = post.content
  ? parseRecipeContent(post.content)
  : { ingredients: [], instructions: [] };

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
      "@id": `${siteUrl}/posts/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        {post.coverImage && <NotionImage src={post.coverImage} alt={post.title} />}

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 text-muted-foreground mb-4 text-sm">
            <time>{format(new Date(post.date), "MMMM d, yyyy")}</time>
            {post.author && <span>By {post.author}</span>}
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
