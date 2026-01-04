"use client";

import { useEffect, useRef } from "react";

interface InstagramEmbedProps {
  url: string;
}

/**
 * Instagram Embed Component
 * Renders Instagram posts and reels using the Instagram embed API
 */
export function InstagramEmbed({ url }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Instagram embed script
    if (typeof window !== "undefined" && !(window as any).instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).instgrm) {
      // If script already loaded, process embeds
      (window as any).instgrm.Embeds.process();
    }
  }, []);

  // Extract post ID from URL
  const getEmbedUrl = (url: string): string => {
    const match = url.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (match) {
      return `https://www.instagram.com/p/${match[1]}/embed/`;
    }
    return url;
  };

  return (
    <div ref={containerRef} className="instagram-embed-wrapper my-6 flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: 0,
          width: "calc(100% - 2px)",
        }}
      >
        <div style={{ padding: "16px" }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#FFFFFF",
              lineHeight: 0,
              padding: "0 0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
            }}
          >
            View this post on Instagram
          </a>
        </div>
      </blockquote>
    </div>
  );
}
