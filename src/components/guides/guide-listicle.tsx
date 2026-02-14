"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { NotionImage } from "@/components/notion-image";
import { TableOfContents } from "@/components/guides/table-of-contents";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { GuideLayoutProps } from "@/components/guides/guide-travel-layout";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: "content"; text: string }
  | { type: "listicle"; name: string; emoji: string; tagline: string; image: string };

// ─── Parsing ─────────────────────────────────────────────────────────────────

/**
 * Split guide content on [listicle:Name|emoji|tagline|image] placeholders.
 * The image field is optional — items without one render content-only.
 */
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
    parts.push({
      type: "listicle",
      name: rawName,
      emoji: rawEmoji,
      tagline: rawTagline,
      image: rawImage,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Accent palette ──────────────────────────────────────────────────────────

const ACCENT_COLORS = ["#735d78", "#a3b18a", "#c4a882"] as const;

// ─── Shared markdown component overrides ─────────────────────────────────────

function makeMarkdownComponents(guideTitle: string) {
  return {
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      if (!src || typeof src !== "string") return null;
      return <NotionImage src={src} alt={alt ?? guideTitle} inline />;
    },
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
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
    h2: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = slugify(String(children));
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
    h3: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => {
      const id = slugify(String(children));
      return (
        <h3
          id={id}
          {...props}
          className="not-italic font-bold uppercase tracking-widest text-base"
          style={{ color: "#735d78" }}
        >
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
}

// ─── Parallax image panel ─────────────────────────────────────────────────────

function ParallaxImagePanel({
  src,
  alt,
  accent,
}: {
  src: string;
  alt: string;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      // Move inner image at 30% of scroll speed for parallax
      setOffset(center * 0.18);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isExternal = src.startsWith("http");

  return (
    <div
      ref={ref}
      className="relative w-full lg:w-[340px] shrink-0 overflow-hidden"
      style={{ minHeight: "300px" }}
    >
      {/* Parallax image */}
      <div
        className="absolute inset-0 scale-110"
        style={{ transform: `translateY(${offset}px) scale(1.12)` }}
      >
        {isExternal ? (
          <NotionImage
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="340px"
          />
        )}
      </div>

      {/* Accent color overlay — Cambridge-style tint */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: accent, opacity: 0.28 }}
        aria-hidden
      />

      {/* Gradient fade toward content side */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, transparent 60%, var(--background) 100%)`,
        }}
        aria-hidden
      />
    </div>
  );
}

// ─── Listicle Item Card ───────────────────────────────────────────────────────

interface ListicleItemProps {
  name: string;
  emoji: string;
  tagline: string;
  image: string;
  index: number;
  body: string;
  guideTitle: string;
  isLast: boolean;
}

function ListicleItem({
  name,
  emoji,
  tagline,
  image,
  index,
  body,
  guideTitle,
  isLast,
}: ListicleItemProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const number = String(index + 1).padStart(2, "0");
  const id = slugify(name);
  const isEven = index % 2 === 0;

  const markdownComponents = makeMarkdownComponents(guideTitle);
  const hasImage = Boolean(image);

  return (
    <section className="not-prose">
      {/* ── Divider ── */}
      {index > 0 && (
        <div className="relative my-10 flex items-center" aria-hidden>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(to right, ${accent}55, transparent)` }}
          />
          <span
            className="mx-4 text-xs tracking-[0.3em] uppercase font-semibold select-none"
            style={{ color: `${accent}99` }}
          >
            ✦
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(to left, ${accent}55, transparent)` }}
          />
        </div>
      )}

      {/* ── Card ── */}
      <div
        className={`relative flex flex-col overflow-hidden rounded-lg ${
          hasImage
            ? isEven
              ? "lg:flex-row"
              : "lg:flex-row-reverse"
            : ""
        }`}
      >
        {/* Oversized decorative number */}
        <div
          className="absolute -top-4 select-none pointer-events-none z-0"
          style={{
            [isEven ? "left" : "right"]: "0.5rem",
            fontSize: "6rem",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: `${accent}15`,
          }}
          aria-hidden
        >
          {number}
        </div>

        {/* ── Image panel ── */}
        {hasImage && (
          <ParallaxImagePanel
            src={image}
            alt={name}
            accent={accent}
          />
        )}

        {/* ── Content column ── */}
        <div
          className="relative z-10 flex-1 flex flex-col justify-center py-8 px-6 lg:px-10"
          style={{ backgroundColor: `${accent}09` }}
        >
          {/* Accent bar — side depends on layout direction */}
          <div
            className="absolute inset-y-0 w-1"
            style={{
              backgroundColor: accent,
              [hasImage ? (isEven ? "right" : "left") : "left"]: 0,
            }}
            aria-hidden
          />

          {/* Kicker */}
          {tagline && (
            <p
              className="text-xs font-bold tracking-[0.22em] uppercase mb-3"
              style={{ color: accent }}
            >
              {tagline}
            </p>
          )}

          {/* Emoji + heading */}
          <div className="flex items-start gap-3 mb-4">
            <span
              className="flex-shrink-0 leading-none"
              style={{ fontSize: "2rem" }}
              role="img"
              aria-label={name}
            >
              {emoji}
            </span>
            <h2
              id={id}
              className="text-2xl sm:text-3xl font-bold leading-tight text-foreground m-0"
            >
              {name}
            </h2>
          </div>

          {/* Body prose */}
          {body.trim() && (
            <div className="prose dark:prose-invert prose-base max-w-none">
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
      </div>

      {!isLast && <div className="h-4" />}
    </section>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function GuideListicle({ guide, sections }: GuideLayoutProps) {
  const parts = parseListicleContent(guide.content);
  const markdownComponents = makeMarkdownComponents(guide.title);

  const totalListicleItems = parts.filter((p) => p.type === "listicle").length;
  const renderedParts: React.ReactNode[] = [];
  let listicleCount = 0;
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];

    if (part.type === "content") {
      renderedParts.push(
        <div key={`content-${i}`} className="prose dark:prose-invert prose-lg max-w-none">
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
      const isLast = listicleCount === totalListicleItems - 1;

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
          isLast={isLast}
        />
      );

      listicleCount++;
      i += nextPart?.type === "content" ? 2 : 1;
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <article>
        <header className="mb-10 not-prose">
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

        <div className="space-y-2">{renderedParts}</div>
      </article>

      <TableOfContents sections={sections} />
    </div>
  );
}
