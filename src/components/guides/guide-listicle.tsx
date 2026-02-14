"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { NotionImage } from "@/components/notion-image";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { GuideLayoutProps } from "@/components/guides/guide-travel-layout";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: "content"; text: string }
  | { type: "listicle"; name: string; emoji: string; tagline: string; image: string };

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseListicleContent(content: string): ContentPart[] {
  const placeholderRegex = /\[listicle:([^\]]+)\]/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "content", text: content.slice(lastIndex, match.index) });
    }
    const [rawName, rawEmoji = "🌱", rawTagline = "", rawImage = ""] = match[1]
      .split("|")
      .map((s) => s.trim());
    parts.push({ type: "listicle", name: rawName, emoji: rawEmoji, tagline: rawTagline, image: rawImage });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const ACCENT_COLORS = ["#735d78", "#a3b18a", "#c4a882"] as const;

// ─── Markdown overrides ───────────────────────────────────────────────────────

function makeMarkdownComponents(guideTitle: string) {
  return {
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      if (!src || typeof src !== "string") return null;
      return <NotionImage src={src} alt={alt ?? guideTitle} inline />;
    },
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      if (href && /instagram\.com\/(?:p|reel)\//.test(href)) return <InstagramEmbed url={href} />;
      return (
        <a href={href} {...props} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    },
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = slugify(String(children));
      return (
        <h2 id={id} {...props}>
          <span className="relative inline">
            <span className="relative z-10">{children}</span>
            <span className="absolute bottom-0.5 left-0 right-0 h-3 -rotate-1 -z-0 pointer-events-none" style={{ backgroundColor: "#735d7830" }} />
          </span>
        </h2>
      );
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = slugify(String(children));
      return (
        <h3 id={id} {...props} className="not-italic font-bold uppercase tracking-widest text-base" style={{ color: "#735d78" }}>
          <span className="relative inline-block">
            <span className="relative z-10">{children}</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 -rotate-1 -z-0 pointer-events-none" style={{ backgroundColor: "#735d7825" }} />
          </span>
        </h3>
      );
    },
  };
}

// ─── Parallax image panel ─────────────────────────────────────────────────────

function ParallaxImagePanel({ src, alt, accent }: { src: string; alt: string; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      // Scale is 1.4, so we have 20% extra image on each side.
      // Max safe shift = containerHeight * (scale - 1) / 2 = height * 0.2
      // Clamp offset so the image never shows background.
      const maxShift = (el.offsetHeight * 0.2);
      const raw = center * 0.15;
      setOffset(Math.max(-maxShift, Math.min(maxShift, raw)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isExternal = src.startsWith("http");

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      {/* Parallax inner — scale 1.4 guarantees no gap at any scroll position */}
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px) scale(1.4)` }}>
        {isExternal ? (
          <NotionImage src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <Image src={src} alt={alt} fill className="object-cover" sizes="50vw" />
        )}
      </div>
      {/* Accent color overlay */}
      <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: accent, opacity: 0.32 }} aria-hidden />
    </div>
  );
}

// ─── Listicle Item ────────────────────────────────────────────────────────────

interface ListicleItemProps {
  name: string;
  emoji: string;
  tagline: string;
  image: string;
  index: number;
  body: string;
  guideTitle: string;
}

function ListicleItem({ name, emoji, tagline, image, index, body, guideTitle }: ListicleItemProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const number = String(index + 1).padStart(2, "0");
  const id = slugify(name);
  const isEven = index % 2 === 0;
  const hasImage = Boolean(image);
  const markdownComponents = makeMarkdownComponents(guideTitle);

  return (
    <section
      className="not-prose relative flex flex-col lg:flex-row lg:items-stretch overflow-hidden"
      style={{ minHeight: "calc(100svh - 4rem)" }}
    >
      {/* Image — left on even, right on odd (swap order via CSS order) */}
      {hasImage && (
        <div className={`flex-1 self-stretch ${!isEven ? "lg:order-2" : ""}`}>
          <ParallaxImagePanel src={image} alt={name} accent={accent} />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative flex-1 flex flex-col justify-center py-12 px-8 lg:px-12 ${!isEven && hasImage ? "lg:order-1" : ""}`}
        style={{ backgroundColor: `${accent}0d` }}
      >
        {/* Accent bar on the image-facing edge */}
        <div
          className="absolute inset-y-0 w-1"
          style={{
            backgroundColor: accent,
            [hasImage ? (isEven ? "left" : "right") : "left"]: 0,
          }}
          aria-hidden
        />

        {/* Decorative number — top corner on content side */}
        <div
          className="absolute top-2 select-none pointer-events-none"
          style={{
            [isEven ? "right" : "left"]: "1rem",
            fontSize: "7rem",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: `${accent}18`,
          }}
          aria-hidden
        >
          {number}
        </div>

        {/* Centered header block */}
        <div className="text-center mb-6">
          {tagline && (
            <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: accent }}>
              {tagline}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="leading-none" style={{ fontSize: "2.25rem" }} role="img" aria-label={name}>
              {emoji}
            </span>
            <h2 id={id} className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground m-0">
              {name}
            </h2>
          </div>
        </div>

        {/* Body prose — left-aligned for readability, prose-sm keeps it compact in card */}
        {body.trim() && (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              components={markdownComponents as any}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {body}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function GuideListicle({ guide, sections }: GuideLayoutProps) {
  const parts = parseListicleContent(guide.content);
  const markdownComponents = makeMarkdownComponents(guide.title);

  const renderedParts: React.ReactNode[] = [];
  let listicleCount = 0;
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];

    if (part.type === "content") {
      renderedParts.push(
        <div key={`content-${i}`} className="prose dark:prose-invert prose-lg max-w-none px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <ReactMarkdown
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            components={markdownComponents as any}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {part.text}
          </ReactMarkdown>
        </div>
      );
      i++;
    } else {
      const nextPart = parts[i + 1];
      const body = nextPart?.type === "content" ? nextPart.text : "";

      renderedParts.push(
        <ListicleItem
          key={`listicle-${i}`}
          name={part.name}
          emoji={part.emoji}
          tagline={part.tagline}
          image={part.image}
          index={listicleCount}
          body={body}
          guideTitle={guide.title}
        />
      );

      listicleCount++;
      i += nextPart?.type === "content" ? 2 : 1;
    }
  }

  // Escape main's px-4 sm:px-6 lg:px-8 and py-5 sm:py-12 entirely.
  // Negative x-margin cancels px, negative top-margin cancels pt, no bottom escape needed.
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-5 sm:-mt-12">
      {/* Header — padded to align with the page's own container */}
      <header className="mb-8 not-prose px-4 sm:px-6 lg:px-8 pt-5 sm:pt-12">
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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">
          {guide.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {guide.categories[0] && <Badge variant="secondary">{guide.categories[0]}</Badge>}
        </div>
      </header>

      {/* Full-bleed items */}
      <div>{renderedParts}</div>

      {/* Closing section */}
      <div
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center"
        style={{ backgroundColor: "#735d7808" }}
      >
        <p className="text-xs font-bold tracking-[0.22em] uppercase mb-4" style={{ color: "#735d78" }}>
          Your vegan pantry
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Stock these once. Cook endlessly.
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          These 10 ingredients are the foundation of almost every vegan recipe on this site. Get them in your kitchen and you&apos;ll always have something great to cook.
        </p>
      </div>
    </div>
  );
}
