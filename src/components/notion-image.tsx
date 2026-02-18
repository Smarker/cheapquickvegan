"use client";

import Image from "next/image";

interface NotionImageProps {
  src: string;
  alt?: string;
  className?: string;
  inline?: boolean; // Use natural dimensions, safe for inline rendering
  sizes?: string;
}

export function NotionImage({ src, alt, className, inline, sizes }: NotionImageProps) {
  if (!src) return null;

  // Inline mode: natural dimensions, no stretching, safe inside <p> tags
  if (inline) {
    return (
      <span className={`block ${className || ""}`}>
        <Image
          src={src}
          alt={alt || ""}
          width={800}
          height={800}
          className="rounded-lg w-full h-auto object-cover max-h-[600px]"
          sizes="(max-width: 768px) 100vw, 800px"
        />
        {alt && (
          <span className="block text-base text-muted-foreground mt-0 font-medium">
            {alt}
          </span>
        )}
      </span>
    );
  }

  // Default: fill container mode with max height constraint
  return (
    <div
      className={`relative w-full aspect-[16/9] max-h-[500px] mb-8 rounded-lg overflow-hidden ${className || ""}`}
    >
      <Image
        src={src}
        alt={alt || ""}
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+"
        sizes={sizes ?? "(max-width: 768px) 100vw, 800px"}
        priority
      />
    </div>
  );
}
