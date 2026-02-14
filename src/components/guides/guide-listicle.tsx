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

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: "content"; text: string }
  | { type: "listicle"; name: string; emoji: string; tagline: string };

// ─── Parsing ─────────────────────────────────────────────────────────────────

/**
 * Split guide content on [listicle:Name|emoji|tagline] placeholders.
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

    const [rawName, rawEmoji = "🌱", rawTagline = ""] = match[1].split("|").map((s) => s.trim());
    parts.push({ type: "listicle", name: rawName, emoji: rawEmoji, tagline: rawTagline });

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

// ─── Listicle Item Card ───────────────────────────────────────────────────────

interface ListicleItemProps {
  name: string;
  emoji: string;
  tagline: string;
  index: number;
  /** Markdown prose that follows this ingredient heading, rendered inline */
  body: string;
  guideTitle: string;
  isLast: boolean;
}

function ListicleItem({ name, emoji, tagline, index, body, guideTitle, isLast }: ListicleItemProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const number = String(index + 1).padStart(2, "0");
  const id = slugify(name);
  const isEven = index % 2 === 0;

  const markdownComponents = makeMarkdownComponents(guideTitle);

  return (
    <section className="not-prose">
      {/* ── Divider (skip before first item) ── */}
      {index > 0 && (
        <div className="relative my-12 flex items-center" aria-hidden>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to right, ${accent}55, transparent)`,
            }}
          />
          <span
            className="mx-4 text-xs tracking-[0.3em] uppercase font-semibold select-none"
            style={{ color: `${accent}99` }}
          >
            ✦
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to left, ${accent}55, transparent)`,
            }}
          />
        </div>
      )}

      {/* ── Card ── */}
      <div
        className={`relative flex flex-col ${
          isEven ? "lg:flex-row" : "lg:flex-row-reverse"
        } gap-0 lg:gap-8 items-stretch`}
      >
        {/* Oversized number — decorative, bleeds behind content */}
        <div
          className="absolute -top-6 select-none pointer-events-none z-0"
          style={{
            /* Shift number to the leading side of the layout */
            [isEven ? "left" : "right"]: "-0.25rem",
            fontVariantNumeric: "tabular-nums",
            fontSize: "7rem",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: `${accent}18`,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
          aria-hidden
        >
          {number}
        </div>

        {/* ── Content column ── */}
        <div
          className="relative z-10 flex-1 flex flex-col justify-center py-8 px-6 lg:px-8"
          style={{ backgroundColor: `${accent}08` }}
        >
          {/* Left accent bar */}
          <div
            className="absolute inset-y-0 w-1 rounded-full"
            style={{
              backgroundColor: accent,
              [isEven ? "left" : "right"]: 0,
            }}
            aria-hidden
          />

          {/* Kicker / tagline */}
          {tagline && (
            <p
              className="text-xs font-bold tracking-[0.22em] uppercase mb-3"
              style={{ color: accent }}
            >
              {tagline}
            </p>
          )}

          {/* Heading row: emoji + name */}
          <div className="flex items-start gap-3 mb-4">
            <span
              className="flex-shrink-0 leading-none"
              style={{ fontSize: "2.5rem" }}
              role="img"
              aria-label={name}
            >
              {emoji}
            </span>
            <h2
              id={id}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground m-0"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {name}
            </h2>
          </div>

          {/* Prose body for this ingredient */}
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

      {/* ── Trailing space ── */}
      {!isLast && <div className="h-4" />}
    </section>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function GuideListicle({ guide, sections }: GuideLayoutProps) {
  const parts = parseListicleContent(guide.content);
  const markdownComponents = makeMarkdownComponents(guide.title);

  // Build listicle items with their following prose body
  // Strategy: when we hit a listicle part, consume the very next "content" part
  // as the body for that ingredient card.
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
      // listicle item: peek ahead for the immediate prose body
      const nextPart = parts[i + 1];
      const body = nextPart?.type === "content" ? nextPart.text : "";
      const isLast = listicleCount === totalListicleItems - 1;

      renderedParts.push(
        <ListicleItem
          key={`listicle-${i}`}
          name={part.name}
          emoji={part.emoji}
          tagline={part.tagline}
          index={listicleCount}
          body={body}
          guideTitle={guide.title}
          isLast={isLast}
        />
      );

      listicleCount++;
      // Skip this listicle part + the consumed content part
      i += nextPart?.type === "content" ? 2 : 1;
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      {/* ── Main column ── */}
      <article>
        {/* Header */}
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

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {guide.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {guide.categories[0] && <Badge variant="secondary">{guide.categories[0]}</Badge>}
          </div>
        </header>

        {/* Content parts */}
        <div className="space-y-2">{renderedParts}</div>
      </article>

      {/* ── Sidebar TOC ── */}
      <TableOfContents sections={sections} />
    </div>
  );
}
