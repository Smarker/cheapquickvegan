import { Leaf, Instagram, Facebook, Mail } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getRecipesFromCache } from "@/lib/notion";
import { ContactRecipesCarousel } from "@/components/contact-recipes-carousel";
import { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

export const metadata: Metadata = {
  title: "Contact Me",
  description: "Get in touch with Cheap Quick Vegan for recipe questions, collaborations, or just to say hi. I'd love to hear from you!",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Me | Cheap Quick Vegan",
    description: "Get in touch with Cheap Quick Vegan for recipe questions, collaborations, or just to say hi. I'd love to hear from you!",
    type: "website",
    url: `${SITE_URL}/contact`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Contact Cheap Quick Vegan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Me | Cheap Quick Vegan",
    description: "Get in touch with Cheap Quick Vegan for recipe questions, collaborations, or just to say hi.",
    images: [`${SITE_URL}/opengraph-image.png`],
  },
};

export default function ContactPage() {
  // Get a few popular/featured recipes
  const allRecipes = getRecipesFromCache();
  const featuredRecipes = allRecipes.slice(0, 3);

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -my-5 sm:-my-12 min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-background">
      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-12">

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">

          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Header Box */}
            <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 dark:bg-card/50 p-2 rounded-full">
                  <Leaf className="text-orange-600 dark:text-secondary" style={{ width: 28, height: 28 }} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  <span className="relative inline-block">
                    <span className="relative z-10">Let's Connect</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-400/30 -rotate-1"></span>
                  </span>
                </h1>
              </div>
              <p className="text-foreground/70 text-sm sm:text-base">
                Whether you have questions about a recipe, ideas for new content, or just want to say hi, I'd love to hear from you.
              </p>
            </div>

            {/* Popular Recipes Section */}
            {featuredRecipes.length > 0 && (
              <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase tracking-wider">
                  <span className="relative inline-block">
                    <span className="relative z-10">While You're Here...</span>
                    <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
                  </span>
                </h2>
                <p className="text-foreground/70 mb-4 sm:mb-6 text-sm sm:text-base">Check out some popular recipes:</p>
                <ContactRecipesCarousel recipes={featuredRecipes} />
              </div>
            )}
          </div>

          {/* Right Column - Contact Form (full height) */}
          <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border flex flex-col">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                <span className="relative inline-block">
                  <span className="relative z-10">Send a Message</span>
                  <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/cheapquickvegan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-400/60 dark:bg-orange-500/60 hover:bg-[#BC6C25] hover:text-white transition-colors duration-200 shadow-sm"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61584092626079"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-400/60 dark:bg-orange-500/60 hover:bg-[#BC6C25] hover:text-white transition-colors duration-200 shadow-sm"
                  aria-label="Follow us on Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <ContactForm />
            <p className="text-xs text-foreground/60 mt-4">
              I typically respond within 2-3 days. Thanks for your patience!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
