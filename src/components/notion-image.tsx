"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface NotionImageProps {
  src: string;
  alt?: string;
  className?: string;
  inline?: boolean; // Use natural dimensions, safe for inline rendering
}

export function NotionImage({ src, alt, className, inline }: NotionImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
    }
  }, [src]);

  if (!imgSrc) return null;

  // Inline mode: natural dimensions, no stretching, safe inside <p> tags
  if (inline) {
    return (
      <span className={`block ${className || ""}`}>
        <Image
          src={imgSrc}
          alt={alt || ""}
          width={800}
          height={800}
          className="rounded-lg w-full h-auto object-cover max-h-[50vh]"
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

  // Default: fill container mode
  return (
    <div
      className={`relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden ${className || ""}`}
    >
      <Image
        src={imgSrc}
        alt={alt || ""}
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />
    </div>
  );
}
