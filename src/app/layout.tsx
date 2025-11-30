// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import GDPRConsent from "@/components/consent/gdpr-consent";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.cheapquickvegan.com";

// ------------------------------------------
// METADATA — clean, safe, no duplicates
// ------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CheapQuickVegan - Easy, Fast and Budget Friendly Vegan Recipes",
    template: `%s | CheapQuickVegan`,
  },
  description:
    "Cheap, quick, and delicious vegan recipes with minimal ingredients. Easy meals, budget-friendly cooking, and plant-based staples anyone can make.",
  alternates: {
    canonical: siteUrl
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.jpg",
  },
  openGraph: {
    title: "CheapQuickVegan - Easy, Fast and Budget Friendly Vegan Recipes",
    description: "Cheap, quick, and delicious vegan recipes with minimal ingredients",
    url: siteUrl,
    siteName: "CheapQuickVegan",
    images: [
      {
        url: `${siteUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "CheapQuickVegan cover image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CheapQuickVegan - Easy, Fast and Budget Friendly Vegan Recipes",
    description:
      "Cheap, quick, and delicious vegan recipes with minimal ingredients",
    images: [`${siteUrl}/opengraph-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Theme color based on dark/light mode
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// ------------------------------------------

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Klaro CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/klaro@0.7.18/dist/klaro.min.css"
        />
        {/* Essential manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body className={inter.className}>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <Layout>{children}</Layout>
        </ThemeProvider>

        {/* Single GDPR + Analytics system */}
  <GDPRConsent />

        {/* Where Klaro injects the banner UI */}
        <div id="klaro" suppressHydrationWarning />

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CheapQuickVegan",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
