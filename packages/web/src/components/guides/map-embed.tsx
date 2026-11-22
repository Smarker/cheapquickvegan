"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface MapEmbedProps {
  url: string;
  title?: string;
}

export function MapEmbed({ url, title = "Map" }: MapEmbedProps) {
  const [isActive, setIsActive] = useState(false);
  const mapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mapRef.current && !mapRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    // Use passive: true for touch events to avoid scroll-blocking warnings
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isActive]);

  return (
    <span
      ref={mapRef}
      className="block not-prose my-8 rounded-lg overflow-hidden border relative"
    >
      <iframe
        src={url}
        width="100%"
        height="450"
        style={{
          border: 0,
          pointerEvents: isActive ? "auto" : "none", // disable iframe interaction until activated
        }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
      {!isActive && (
        <span
          className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center"
          onClick={() => setIsActive(true)}
        >
          <span className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Click to interact with map
          </span>
        </span>
      )}
    </span>
  );
}
