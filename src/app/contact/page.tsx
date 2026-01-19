import { Leaf, Instagram, Facebook, Mail } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getRecipesFromCache } from "@/lib/notion";
import { NotionImage } from "@/components/notion-image";
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

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-orange-100 dark:bg-card/50 p-3 rounded-full inline-block mb-4">
            <Leaf className="text-orange-600 dark:text-secondary" style={{ width: 36, height: 36 }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Let's Connect</h1>
          <p className="text-foreground/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Whether you have questions about a recipe, ideas for new content, or just want to say hi, I'd love to hear from you.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">

          {/* Contact Form */}
          <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Send a Message</h2>
            <ContactForm />
          </div>

          {/* Sidebar - Social & Info */}
          <div className="space-y-4 sm:space-y-6">

            {/* Social Media */}
            <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Connect on Social</h2>
              <div className="flex flex-col gap-3">
                <a
                  href="https://instagram.com/cheapquickvegan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Instagram size={24} />
                  <span className="text-base font-medium">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61584092626079"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 rounded-lg bg-blue-600 text-white hover:opacity-90 transition-opacity"
                >
                  <Facebook size={24} />
                  <span className="text-base font-medium">Facebook</span>
                </a>
              </div>
            </div>

            {/* Email Alternative */}
            <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Prefer Email?</h2>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Mail className="text-orange-600 dark:text-primary" size={20} />
                <a
                  href="mailto:cheapquickvegan@gmail.com"
                  className="text-orange-600 dark:text-primary hover:underline font-medium text-sm sm:text-base break-all"
                >
                  cheapquickvegan@gmail.com
                </a>
              </div>
              <p className="text-sm text-foreground/60">
                I typically respond within 2-3 days. Thanks for your patience!
              </p>
            </div>

          </div>
        </div>

        {/* Popular Recipes Section */}
        {featuredRecipes.length > 0 && (
          <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">While You're Here...</h2>
            <p className="text-foreground/70 mb-4 sm:mb-6 text-sm sm:text-base">Check out some popular recipes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {featuredRecipes.map((recipe) => (
                <a
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group relative block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <NotionImage
                      src={recipe.coverImage}
                      alt={recipe.alt || recipe.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2">
                        {recipe.title}
                      </h3>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
