"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface NotionImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function NotionImage({ src, alt, className }: NotionImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
    }
  }, [src]);

  if (!imgSrc) return null;

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
