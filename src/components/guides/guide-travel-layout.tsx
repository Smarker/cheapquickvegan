import { Guide } from "@/types/guide";
import { Recipe } from "@/types/recipe";
import { ContentSection } from "@/types/content";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { NotionImage } from "@/components/notion-image";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { MapEmbed } from "@/components/guides/map-embed";

export interface GuideLayoutProps {
  guide: Guide;
  sections: ContentSection[];
  allGuides: Guide[];
  allRecipes?: Recipe[];
}

export function GuideTravelLayout({ guide, sections, allGuides }: GuideLayoutProps) {
  // Inject map link after Quick Picks section if a map URL is present
  let processedContent = guide.content;
  if (guide.mapEmbedUrl) {
    const mapLink = `\n[Map](${guide.mapEmbedUrl})\n`;
    processedContent = guide.content.replace(
      /(## Quick Picks[\s\S]*?)(\n## )/,
      `$1${mapLink}$2`
    );
  }

  // Related guides: explicit relations first, then same-category fallback
  let relatedGuides: Guide[] = [];
  if (guide.relatedGuides?.length) {
    relatedGuides = guide.relatedGuides
      .map((id) => allGuides.find((g) => g.id === id))
      .filter((g): g is Guide => Boolean(g))
      .slice(0, 3);
  } else {
    relatedGuides = allGuides
      .filter((g) => g.categories[0] === guide.categories[0] && g.id !== guide.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <div className="max-w-3xl">
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
              {guide.city && <Badge variant="default">{guide.city}</Badge>}
              {guide.country && <Badge variant="outline">{guide.country}</Badge>}
            </div>
          </header>

          <ReactMarkdown
            components={{
              img: ({ src, alt }) => {
                if (!src || typeof src !== "string") return null;
                return <NotionImage src={src} alt={alt ?? guide.title} inline />;
              },
              a: ({ href, children, ...props }) => {
                if (href && /instagram\.com\/(?:p|reel)\//.test(href)) {
                  return <InstagramEmbed url={href} />;
                }
                if (href && /google\.com\/maps\/d\/.*embed/.test(href)) {
                  return <MapEmbed url={href} title={`Map for ${guide.title}`} />;
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
              h2: ({ children, ...props }) => {
                const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                return <h2 id={id} {...props}>{children}</h2>;
              },
              h3: ({ children, ...props }) => {
                const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                return <h3 id={id} {...props}>{children}</h3>;
              },
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {processedContent}
          </ReactMarkdown>

          {relatedGuides.length > 0 && (
            <section className="mt-12 not-prose">
              <h2 className="text-2xl font-semibold mb-4">Related Guides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedGuides.map((g) => (
                  <a
                    key={g.id}
                    href={`/guides/${g.slug}`}
                    className="relative block rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative w-full h-56 sm:h-60 md:h-64 overflow-hidden">
                      <NotionImage
                        src={g.coverImage}
                        alt={g.alt || g.title}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-white font-semibold text-base line-clamp-2">{g.title}</h3>
                        <p className="text-white/80 text-sm">{g.readingTime}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      <TableOfContents sections={sections} />
    </div>
  );
}
