"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUp } from "lucide-react";
import { NotionImage } from "@/components/notion-image";
import { InstagramEmbed } from "@/components/guides/instagram-embed";
import { GuideLayoutProps } from "@/components/guides/guide-travel-layout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Recipe } from "@/types/recipe";
import Image from "next/image";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: "content"; text: string }
  | { type: "listicle"; name: string; emoji: string; tagline: string; image: string; recipeTag: string };

// ─── Parsing ─────────────────────────────────────────────────────────────────

interface ClosingSection {
  eyebrow: string;
  heading: string;
  body: string;
}

function extractClosingSection(content: string): { content: string; closing: ClosingSection | null } {
  const match = content.match(/\[closing:([^\]]+)\]/);
  if (!match) return { content, closing: null };
  const [rawEyebrow = "", rawHeading = "", rawBody = ""] = match[1].split("|").map((s) => s.trim());
  return {
    content: content.replace(match[0], ""),
    closing: { eyebrow: rawEyebrow, heading: rawHeading, body: rawBody },
  };
}

function parseListicleContent(content: string): ContentPart[] {
  const placeholderRegex = /\[listicle:([^\]]+)\]/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "content", text: content.slice(lastIndex, match.index) });
    }
    const [rawName, rawEmoji = "🌱", rawTagline = "", rawImage = "", rawTag = ""] = match[1]
      .split("|")
      .map((s) => s.trim());
    parts.push({
      type: "listicle",
      name: rawName,
      emoji: rawEmoji,
      tagline: rawTagline,
      image: rawImage,
      recipeTag: rawTag || rawName,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "content", text: content.slice(lastIndex) });
  }

  return parts;
}

// ─── Recipe chips ─────────────────────────────────────────────────────────────

function RecipeChips({ recipes, accent }: { recipes: Recipe[]; accent: string }) {
  if (recipes.length === 0) return null;
  return (
    <div className="mt-6 pt-5 border-t" style={{ borderColor: `${accent}33` }}>
      <p className="text-xs font-bold tracking-[0.16em] uppercase mb-3" style={{ color: accent }}>
        Recipes using this
      </p>
      <ul className="flex flex-col gap-2">
        {recipes.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/recipes/${r.slug}`}
              className="group inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-2"
              style={{ color: accent }}
            >
              <span
                className="inline-block w-1 h-1 rounded-full flex-shrink-0 transition-transform group-hover:scale-150"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              {r.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const ACCENT_COLORS = ["#735d78", "#a3b18a", "#c4a882"] as const;

// ─── Jump TOC ─────────────────────────────────────────────────────────────────

function JumpTOC({ items, onJump }: { items: Array<{ name: string; index: number }>; onJump: (index: number) => void }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Jump to ingredient" className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 pt-4 sm:pt-6 pb-6 sm:pb-8">
      <p className="text-xs font-bold tracking-[0.16em] uppercase text-muted-foreground mb-3">Jump to</p>
      <ol className="flex flex-wrap gap-2">
        {items.map(({ name, index }) => {
          const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
          return (
            <li key={name}>
              <button
                onClick={() => onJump(index)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer"
                style={{ borderColor: accent, color: accent }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.backgroundColor = accent;
                  el.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.backgroundColor = "";
                  el.style.color = accent;
                }}
              >
                <span className="text-xs font-bold opacity-50">{String(index + 1).padStart(2, "0")}</span>
                {name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

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
      const maxShift = el.offsetHeight * 0.2;
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
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px) scale(1.4)` }}>
        {isExternal ? (
          <NotionImage src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        )}
      </div>
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
  recipeTag: string;
  index: number;
  body: string;
  guideTitle: string;
  linkedRecipes: Recipe[];
  sectionRef: React.RefCallback<HTMLElement>;
}

function ListicleItem({ name, tagline, image, index, body, guideTitle, linkedRecipes, sectionRef }: ListicleItemProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const number = String(index + 1).padStart(2, "0");
  const id = slugify(name);
  const isEven = index % 2 === 0;
  const hasImage = Boolean(image);
  const markdownComponents = makeMarkdownComponents(guideTitle);

  return (
    <section
      ref={sectionRef}
      className="not-prose relative flex flex-col lg:flex-row lg:items-stretch overflow-hidden"
      style={{ minHeight: "calc(100svh - 4rem)" }}
    >
      {/* Mobile image — full-bleed at top, only on small screens */}
      {hasImage && (
        <div className="lg:hidden relative w-full" style={{ height: "55vw", minHeight: "220px" }}>
          <ParallaxImagePanel src={image} alt={name} accent={accent} />
        </div>
      )}

      {/* Desktop image — left on even, right on odd */}
      {hasImage && (
        <div className={`hidden lg:block flex-1 self-stretch ${!isEven ? "lg:order-2" : ""}`}>
          <ParallaxImagePanel src={image} alt={name} accent={accent} />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative flex-1 flex flex-col justify-center py-12 px-8 lg:px-16 ${!isEven && hasImage ? "lg:order-1" : ""}`}
        style={{ backgroundColor: `${accent}22` }}
      >
        {/* Accent bar — both sides on mobile (thin), image-facing side only on desktop */}
        <div className="absolute inset-y-0 left-0 w-px lg:hidden" style={{ backgroundColor: accent }} aria-hidden />
        <div className="absolute inset-y-0 right-0 w-px lg:hidden" style={{ backgroundColor: accent }} aria-hidden />
        <div
          className="absolute inset-y-0 w-1 hidden lg:block"
          style={{
            backgroundColor: accent,
            [hasImage ? (isEven ? "left" : "right") : "left"]: 0,
          }}
          aria-hidden
        />

        {/* Decorative number */}
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
            <p className="text-sm font-bold tracking-[0.18em] uppercase mb-3" style={{ color: accent }}>
              {tagline}
            </p>
          )}
          <h2 id={id} className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground m-0">
            {name}
          </h2>
        </div>

        {/* Body prose */}
        {body.trim() && (
          <div className="prose dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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

        <RecipeChips recipes={linkedRecipes} accent={accent} />
      </div>
    </section>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function GuideListicle({ guide, allRecipes = [] }: GuideLayoutProps) {
  useEffect(() => {
    document.body.classList.add("listicle-page");
    return () => document.body.classList.remove("listicle-page");
  }, []);

  // Back-to-top visibility
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Refs for each listicle section so TOC can scroll to them without touching the URL
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const onJump = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (!el) return;
    const navHeight = 64; // h-16 = 4rem = 64px
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const { content: strippedContent, closing } = extractClosingSection(guide.content);
  const parts = parseListicleContent(strippedContent);
  const markdownComponents = makeMarkdownComponents(guide.title);

  const tocItems = parts
    .filter((p): p is Extract<ContentPart, { type: "listicle" }> => p.type === "listicle")
    .map((p, index) => ({ name: p.name, index }));

  const renderedParts: React.ReactNode[] = [];
  let listicleCount = 0;
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];

    if (part.type === "content") {
      renderedParts.push(
        <div key={`content-${i}`} className="pt-0 pb-6 sm:pb-10">
          <div className="prose dark:prose-invert prose-lg max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
            <ReactMarkdown
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              components={markdownComponents as any}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {part.text}
            </ReactMarkdown>
          </div>
        </div>
      );
      i++;
    } else {
      const nextPart = parts[i + 1];
      const body = nextPart?.type === "content" ? nextPart.text : "";

      const needle = part.recipeTag.toLowerCase();
      const linkedRecipes = allRecipes
        .filter((r) =>
          r.ingredients
            ? r.ingredients.some((ing) => ing.toLowerCase() === needle)
            : r.content.toLowerCase().includes(needle)
        )
        .slice(0, 3);

      const capturedIndex = listicleCount;
      const sectionRefCallback: React.RefCallback<HTMLElement> = (el) => {
        sectionRefs.current[capturedIndex] = el;
      };

      renderedParts.push(
        <ListicleItem
          key={`listicle-${i}`}
          name={part.name}
          emoji={part.emoji}
          tagline={part.tagline}
          image={part.image}
          recipeTag={part.recipeTag}
          index={listicleCount}
          body={body}
          guideTitle={guide.title}
          linkedRecipes={linkedRecipes}
          sectionRef={sectionRefCallback}
        />
      );

      listicleCount++;
      i += nextPart?.type === "content" ? 2 : 1;
    }
  }

  return (
    <div className="-mt-5 sm:-mt-12 -mb-5 sm:-mb-12" style={{ width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }}>
      {/* Header */}
      <header className="mb-3 not-prose pt-5 sm:pt-12">
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16">
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
        <Breadcrumbs
          className="mb-4 sm:-ml-2"
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides" },
            {
              items: guide.categories.map((cat) => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                href: `/guides/category/${cat.toLowerCase().replace(/\s+/g, "-")}`,
              })),
            },
          ]}
        />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">
          {guide.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {guide.categories[0] && <Badge variant="secondary">{guide.categories[0]}</Badge>}
        </div>
        </div>
      </header>

      {/* Jump TOC */}
      <JumpTOC items={tocItems} onJump={onJump} />

      {/* Full-bleed items */}
      <div>{renderedParts}</div>

      {/* Closing section */}
      {closing?.eyebrow && (
      <div
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center"
        style={{ backgroundColor: "#735d7808" }}
      >
        <p className="text-sm font-bold tracking-[0.18em] uppercase mb-4" style={{ color: "#735d78" }}>
          {closing?.eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          {closing?.heading}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {closing?.body}
        </p>
      </div>)}

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wide shadow-lg border transition-opacity"
          style={{ backgroundColor: "#735d78", color: "#fff", borderColor: "#735d78" }}
          aria-label="Back to top"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Top
        </button>
      )}
    </div>
  );
}
