import { getGuidesFromCache } from "@/lib/notion";
import { Guide } from "@/types/guide";
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
import { generateTOC } from "@/lib/guide-parser";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { MapEmbed } from "@/components/guides/map-embed";
import { Clock } from "lucide-react";
import { BreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: GuidePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const guides = getGuidesFromCache();
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: `${SITE_URL}/guides/${guide.slug}`,
      publishedTime: new Date(guide.date).toISOString(),
      modifiedTime: new Date(guide.lastUpdated || guide.date).toISOString(),
      authors: ["Stephanie Marker"],
      images: [
        {
          url: guide.coverImage || `${SITE_URL}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: guide.alt || guide.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [{ url: guide.coverImage || `${SITE_URL}/opengraph-image.png`, alt: guide.alt || guide.title }],
    },
  };
}

// Function to generate FAQ JSON-LD from Notion-rendered markdown/content
function generateFaqJsonLd(faqContent: string) {
  const lines = faqContent
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string }
  }> = [];

  let currentQuestion: string | null = null;

  lines.forEach(line => {
    if (line.startsWith("**Q:")) {
      currentQuestion = line.replace("**Q:", "").replace("**", "").trim();
    } else if (currentQuestion && (line.startsWith("**A:") || line.startsWith("A:"))) {
      // Handle both **A:** and A: formats
      let answerText = line;
      if (line.startsWith("**A:")) {
        answerText = line.replace("**A:", "").replace("**", "").trim();
      } else {
        answerText = line.replace("A:", "").trim();
      }
      mainEntity.push({
        "@type": "Question",
        name: currentQuestion,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
      });
      currentQuestion = null;
    }
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}


export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guides = getGuidesFromCache();
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) notFound();

  const sections = generateTOC(guide.content);

  // Inject map link after Quick Picks if mapEmbedUrl exists (will be rendered by ReactMarkdown handler)
  let processedContent = guide.content;
  if (guide.mapEmbedUrl) {
    const mapLink = `\n[Map](${guide.mapEmbedUrl})\n`;
    processedContent = guide.content.replace(
      /(## Quick Picks[\s\S]*?)(\n## )/,
      `$1${mapLink}$2`
    );
  }

  // --- RELATED GUIDES LOGIC ---
  let relatedGuides: Guide[] = [];

  if (guide.relatedGuides?.length) {
    relatedGuides = guide.relatedGuides
      .map((id: string) => guides.find((g: Guide) => g.id === id))
      .filter((g: Guide | undefined): g is Guide => Boolean(g))
      .slice(0, 3);
  } else if (guide.categories) {
    const sameCategory = guides.filter(
      (g) => g.categories[0] === guide.categories[0] && g.id !== guide.id
    );
    relatedGuides = sameCategory.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  const category = guide.categories[0];

  // Article Schema for SEO
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: guide.coverImage
      ? guide.coverImage.startsWith("http")
        ? guide.coverImage
        : `${SITE_URL}${guide.coverImage}`
      : `${SITE_URL}/opengraph-image.png`,
    author: { "@type": "Person", name: "Stephanie Marker" },
    publisher: {
      "@type": "Organization",
      name: "CheapQuickVegan",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: new Date(guide.date).toISOString(),
    dateModified: new Date(guide.lastUpdated || guide.date).toISOString(),
    articleSection: category,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/${guide.slug}` },
  };

  const faqJsonLd = processedContent ? generateFaqJsonLd(processedContent) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "" },
        { name: "Guides", path: "/guides" },
        { name: category.charAt(0).toUpperCase() + category.slice(1), path: `/guides/category/${category.toLowerCase()}` },
        { name: guide.title, path: `/guides/${guide.slug}` },
      ]} />
      {faqJsonLd && faqJsonLd.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* Main Content */}
          <div className="max-w-3xl">
            {/* Hero Image */}
            {guide.coverImage && (
              <div className="relative w-full aspect-[16/9] max-h-[400px] overflow-hidden rounded-lg mb-4 sm:mb-6 md:mb-8">
                <NotionImage
                  src={guide.coverImage}
                  alt={guide.alt || guide.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Article Content */}
            <article className="prose dark:prose-invert prose-lg max-w-none">
              <header className="mb-8">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground mb-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.readingTime}
                  </span>
                  <span><span className="font-medium">Published:</span> <time dateTime={new Date(guide.date).toISOString()}>{format(new Date(guide.date), "MMMM d, yyyy")}</time></span>
                  {guide.lastUpdated && guide.lastUpdated !== guide.date && (
                    <span><span className="font-medium">Updated:</span> <time dateTime={new Date(guide.lastUpdated).toISOString()}>{format(new Date(guide.lastUpdated), "MMMM d, yyyy")}</time></span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                  {guide.title}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {guide.categories && <Badge variant="secondary">{guide.categories[0]}</Badge>}
                  <Badge variant="default">{guide.city}</Badge>
                  <Badge variant="outline">{guide.country}</Badge>
                </div>
              </header>

              <ReactMarkdown
                components={{
                  img: ({ src, alt }) => {
                    if (!src || typeof src !== "string") return null;
                    return (
                      <NotionImage
                        src={src}
                        alt={alt ?? guide.title}
                        inline
                      />
                    );
                  },
                  a: ({ href, children, ...props }) => {
                    // Check if it's an Instagram URL
                    if (href && /instagram\.com\/(?:p|reel)\//.test(href)) {
                      return <InstagramEmbed url={href} />;
                    }
                    // Check if it's a Google Maps embed URL
                    if (href && /google\.com\/maps\/d\/.*embed/.test(href)) {
                      return <MapEmbed url={href} title={`Map for ${guide.title}`} />;
                    }
                    return (
                      <a href={href} {...props} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                        {children}
                      </a>
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
                {processedContent}
              </ReactMarkdown>

              {/* Related Guides */}
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

          {/* Table of Contents - Desktop Sidebar */}
          <TableOfContents sections={sections} />
        </div>
      </div>
    </>
  );
}
