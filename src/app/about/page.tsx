import Image from "next/image";
import { Metadata } from "next";
import { Instagram, Facebook, Mail, Sparkles } from "lucide-react";
import { SITE_URL } from "@/config/constants";

// --- ENHANCED SEO METADATA ---
export const metadata: Metadata = {
  title: "About Stephanie | Cheap, Quick, and Simple Vegan Recipes",
  description:
    "Meet Stephanie, the creator of CheapQuickVegan. Discover my journey into affordable vegan cooking, Italian-inspired plant-based recipes, and my mission to make vegan eating simple, delicious, and budget-friendly for everyone.",
  keywords: [
    "vegan food blogger",
    "affordable vegan recipes",
    "plant-based cooking",
    "vegan meal planning",
    "Italian vegan recipes",
    "quick vegan meals",
    "budget vegan cooking",
  ],
  authors: [{ name: "Stephanie Marker" }],
  creator: "Stephanie Marker",
  openGraph: {
    title: "About Stephanie | CheapQuickVegan",
    description:
      "Meet Stephanie, vegan recipe creator sharing affordable, quick Italian-inspired plant-based recipes and meal planners.",
    url: `${SITE_URL}/about`,
    siteName: "CheapQuickVegan",
    images: [
      {
        url: `${SITE_URL}/images/stephanie-about.jpg`,
        width: 1200,
        height: 630,
        alt: "Stephanie Marker - CheapQuickVegan creator",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Stephanie | CheapQuickVegan",
    description:
      "Meet Stephanie, vegan recipe creator sharing affordable, quick Italian-inspired plant-based recipes.",
    images: [`${SITE_URL}/images/stephanie-about.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  // JSON-LD Structured Data for Person/Author
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Stephanie Marker",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/images/stephanie-about.jpg`,
    jobTitle: "Vegan Recipe Creator & Food Blogger",
    description:
      "Creator of CheapQuickVegan, sharing affordable, quick vegan recipes inspired by Italian family classics.",
    sameAs: [
      "https://instagram.com/cheapquickvegan",
      "https://www.facebook.com/profile.php?id=61584092626079",
    ],
    knowsAbout: [
      "Vegan Cooking",
      "Italian Cuisine",
      "Plant-Based Recipes",
      "Budget Cooking",
      "Meal Planning",
    ],
    email: "cheapquickvegan@gmail.com",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="relative min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-8 pb-2 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Flex container for all screen sizes */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start lg:items-center">
              <div className="relative shrink-0 mx-auto">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64">
                    {/* Decorative Frame */}
                    <div className="absolute -inset-2 lg:-inset-4 bg-[#BC6C25]/20 rounded-[2rem] blur-xl" />
                    <div className="hidden lg:block absolute -inset-2 border-2 border-[#606C38]/30 dark:border-[#a3b18a]/30 rounded-[1.5rem] rotate-3" />

                    {/* Main Image */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src="/images/stephanie-about.jpg"
                        alt="Stephanie Marker, creator of CheapQuickVegan, vegan recipe developer"
                        fill
                        sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 320px"
                        className="object-cover"
                        priority
                      />
                    </div>

                    {/* Decorative Label - Top Right */}
                    <div className="absolute -top-4 sm:-top-5 lg:-top-6 -right-4 sm:-right-5 lg:-right-6 inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2 bg-[#606C38] dark:bg-[#606C38] rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3 sm:w-3.5 lg:w-4 sm:h-3.5 lg:h-4 text-white" />
                      <span className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-white tracking-wide whitespace-nowrap">
                        CREATOR & RECIPE DEVELOPER
                      </span>
                    </div>
                  </div>
                </div>

              {/* Text Column */}
              <div className="space-y-3 lg:space-y-4 min-w-0 flex-1 text-center lg:text-left">

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight">
                  <span className="block text-foreground/90 text-3xl sm:text-4xl lg:text-5xl">Hi, I'm</span>
                  <span className="relative inline-block">
                    <span className="relative z-10 text-[#606C38] dark:text-white">Stephanie</span>
                    <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-[#BC6C25]/30 -rotate-1 -z-0"></span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl">
                  Welcome to CheapQuickVegan – where affordable meets delicious in the world of plant-based cooking.
                </p>

                {/* Mission Statement */}
                <div className="relative">
                  <div className="relative p-6 bg-[#606C38]/5 dark:bg-white/5 rounded-2xl">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 uppercase tracking-wider text-[#606C38] dark:text-[#a3b18a]">
                      <span className="relative inline-block">
                        <span className="relative z-10">MY MISSION</span>
                        <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
                      </span>
                    </h2>
                    <p className="text-base leading-relaxed text-foreground/80">
                      Providing the best quick and affordable vegan recipes for everyone because delicious plant-based meals shouldn't break the bank or take hours to prepare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4">
          <div className="max-w-4xl mx-auto">
            <article className="space-y-8">
              {/* Story Section - More Dynamic Layout */}
              <div className="space-y-6">
                <div className="border-l-4 border-[#BC6C25] pl-6 py-2 my-6">
                  <p className="text-lg text-foreground/70">
                    My journey with vegan cooking started when my boyfriend adopted a vegan diet for health reasons. What began as a challenge quickly turned into a passion.
                    I discovered that vegan cooking is incredibly fun and a creative way to experiment with substitutions and unexpected ingredients.
                  </p>
                </div>

                {/* Italian Section - Matching My Mission style */}
                <div className="relative p-6 bg-[#BC6C25]/10 dark:bg-white/5 rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 uppercase tracking-wider text-[#BC6C25] dark:text-[#BC6C25]">
                    <span className="relative inline-block">
                      <span className="relative z-10">VEGAN TWISTS ON ITALIAN FAMILY CLASSICS</span>
                      <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
                    </span>
                  </h3>
                  <p className="text-base leading-relaxed text-foreground/80">
                    My recipes are heavily influenced by the food I learned from my boyfriend's extended Italian family. I love demonstrating how small, simple edits can make a massive impact on classic dishes (like adding plant milk to focaccia for extra crispiness!).
                  </p>
                </div>

                <div className="border-l-4 border-[#735d78] pl-6 py-2 my-6">
                  <p className="text-lg text-foreground/70">
                    I want to make vegan eating simple, affordable, and delicious by providing the best cheap vegan recipes and resources.                     Whether you're new to vegan cooking or just want easy weeknight meals, you'll find recipes here that use everyday ingredients and take minimal time to prepare.
                  </p>
                </div>

                {/* Shop CTA - More prominent */}
                <div className="relative p-8 bg-gradient-to-r bg-[#BC6C25]/10 dark:bg-white/5 rounded-2xl my-8">
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    <span className="relative inline-block">
                      <span className="relative z-10">Ready to Level Up Your Meal Planning?</span>
                      <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#735d78]/30 -rotate-1"></span>
                    </span>
                  </h3>
                  <p className="text-base mb-4 text-foreground/80">
                    Check out my Notion recipe bundles and vegan meal planners. Perfect for organizing your favorite vegan meals and grocery lists.
                  </p>
                  <a
                    href="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#735d78] hover:bg-[#606C38] text-white transition-colors font-bold text-lg"
                  >
                    Visit Shop
                    <span className="text-xl">→</span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Connect Section */}
        <section className="py-8 px-4 bg-[#BC6C25]/10 dark:bg-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                <span className="relative inline-block">
                  <span className="relative z-10">Let's Connect</span>
                  <span className="absolute bottom-2 left-0 right-0 h-4 bg-[#BC6C25]/30 -rotate-1"></span>
                </span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow along for new recipes, vegan tips, and Italian-inspired plant-based cooking.
              </p>

              {/* Social Links - Box Style */}
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a
                  href="https://instagram.com/cheapquickvegan"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#606C38] hover:bg-[#735d78] text-white transition-colors font-medium"
                  aria-label="Follow CheapQuickVegan on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61584092626079"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#606C38] hover:bg-[#735d78] text-white transition-colors font-medium"
                  aria-label="Follow CheapQuickVegan on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>

                <a
                  href="mailto:cheapquickvegan@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#606C38] hover:bg-[#735d78] text-white transition-colors font-medium"
                  aria-label="Email CheapQuickVegan"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
