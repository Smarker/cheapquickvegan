import { getRecipesFromCache } from "@/lib/notion";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { NotionImage } from "@/components/notion-image";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { RoundupRecipeCard } from "@/components/guides/roundup-recipe-card";
import { GuideLayoutProps } from "@/components/guides/guide-travel-layout";

type ContentPart =
  | { type: "content"; text: string }
  | { type: "recipes"; tag: string };

// Split content on [recipes:Tag Name] placeholders, e.g. [recipes:Air Fryer]
function parseRoundupContent(content: string): ContentPart[] {
  const placeholderRegex = /\[recipes:([^\]]+)\]/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "content", text: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "recipes", tag: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}

export function GuideRoundup({ guide, sections }: GuideLayoutProps) {
  const allRecipes = getRecipesFromCache();
  const parts = parseRoundupContent(guide.content);

  const markdownComponents = {
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      if (!src || typeof src !== "string") return null;
      return <NotionImage src={src} alt={alt ?? guide.title} inline />;
    },
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      if (href && /instagram\.com\/(?:p|reel)\//.test(href)) {
        return <InstagramEmbed url={href} />;
      }
      return (
        <a
          href={href}
          {...props}
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return (
        <h2 id={id} {...props}>
          <span className="relative inline">
            <span className="relative z-10">{children}</span>
            <span
              className="absolute bottom-0.5 left-0 right-0 h-3 -rotate-1 -z-0 pointer-events-none"
              style={{ backgroundColor: "#735d7830" }}
            />
          </span>
        </h2>
      );
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return (
        <h3 id={id} {...props} className="not-italic font-bold uppercase tracking-widest text-base" style={{ color: "#735d78" }}>
          <span className="relative inline-block">
            <span className="relative z-10">{children}</span>
            <span
              className="absolute bottom-0 left-0 right-0 h-2 -rotate-1 -z-0 pointer-events-none"
              style={{ backgroundColor: "#735d7825" }}
            />
          </span>
        </h3>
      );
    },
  };

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <article className="prose dark:prose-invert prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground mb-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {guide.readingTime}
            </span>
            <span>
              <span className="font-medium">Published:</span>{" "}
              <time dateTime={new Date(guide.date).toISOString()}>
                {format(new Date(guide.date), "MMMM d, yyyy")}
              </time>
            </span>
            {guide.lastUpdated && guide.lastUpdated !== guide.date && (
              <span>
                <span className="font-medium">Updated:</span>{" "}
                <time dateTime={new Date(guide.lastUpdated).toISOString()}>
                  {format(new Date(guide.lastUpdated), "MMMM d, yyyy")}
                </time>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            {guide.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {guide.categories[0] && <Badge variant="secondary">{guide.categories[0]}</Badge>}
          </div>
        </header>

        {parts.map((part, i) => {
          if (part.type === "content") {
            return (
              <ReactMarkdown
                key={i}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                components={markdownComponents as any}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {part.text}
              </ReactMarkdown>
            );
          }

          const taggedRecipes = allRecipes.filter((r) =>
            r.tags?.some((t) => t.toLowerCase() === part.tag.toLowerCase())
          );

          if (taggedRecipes.length === 0) return null;

          return (
            <div key={i} className="not-prose my-8 space-y-5">
              {taggedRecipes.map((recipe, recipeIndex) => (
                <RoundupRecipeCard key={recipe.id} recipe={recipe} index={recipeIndex} />
              ))}
            </div>
          );
        })}
      </article>

      <TableOfContents sections={sections} />
    </div>
  );
}
