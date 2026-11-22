import { Metadata } from "next";

// --- METADATA ---
export const metadata: Metadata = {
  title: "Disclaimer | Cheap, Quick, and Simple Vegan Recipes",
  description:
    "Review the disclaimer for CheapQuickVegan regarding health advice, recipe safety, and affiliate disclosures.",
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Disclaimer</h1>

      {/* Table of Contents */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <nav>
          <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
          <ul className="list-none ml-0 space-y-1">
            <li><a href="#general-information" className="text-primary hover:underline">1. General Information</a></li>
            <li><a href="#health-dietary-advice" className="text-primary hover:underline">2. Health and Dietary Advice</a></li>
            <li><a href="#recipe-safety" className="text-primary hover:underline">3. Recipe Safety and Allergens</a></li>
            <li><a href="#affiliate-links" className="text-primary hover:underline">4. Affiliate & External Links Disclosure</a></li>
            <li><a href="#user-generated-content" className="text-primary hover:underline">5. User-Generated Content</a></li>
            <li><a href="#copyright" className="text-primary hover:underline">6. Copyright and Reproduction</a></li>
          </ul>
        </nav>
      </div>

      <div className="space-y-6">

        {/* --- 1. General Information and Liability --- */}
        <section id="general-information" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">1. General Information</h2>
          <p className="mb-3">
            The content on CheapQuickVegan.com, including all recipes, articles, and meal plans, is provided for general informational and entertainment purposes only. While I strive to provide accurate and up-to-date information, I make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, or services contained on this website for any purpose.
          </p>
          <p>
            Any reliance you place on such information is therefore strictly at your own risk.
          </p>
        </section>

        {/* --- 2. Health and Nutritional Advice Disclaimer --- */}
        <section id="health-dietary-advice" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">2. Health and Dietary Advice</h2>
          <p className="mb-3">
            I am not a doctor, registered dietitian, nutritionist, or medical professional. The information and recipes provided on CheapQuickVegan.com are based on my personal experience, research, and culinary interest as a home cook.
          </p>
          <p>
            The recipes and information here are <strong className="font-medium">not intended</strong> to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition or dietary change. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
          </p>
        </section>

        {/* --- 3. Recipe Safety and Preparation --- */}
        <section id="recipe-safety" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">3. Recipe Safety and Allergens</h2>
          <p className="mb-3">
            All users assume full responsibility for any and all risks associated with the handling, preparation, and consumption of food in recipes from this site. This includes, but is not limited to, proper food hygiene, safe food storage, and avoiding potential allergens.
          </p>
          <p>
            CheapQuickVegan provides <strong className="font-medium">vegan recipes</strong> (free of meat, dairy, eggs, and animal-derived ingredients like honey). However, it is the user's responsibility to check all packaged food labels for hidden animal products, allergens, and cross-contamination warnings, as product ingredients can change without notice.
          </p>
        </section>

        {/* --- 4. Affiliate and External Links Disclosure (Crucial for monetized blogs) --- */}
        <section id="affiliate-links" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">4. Affiliate & External Links Disclosure</h2>
          <p className="mb-3">
            CheapQuickVegan may contain links to external websites that are not provided or maintained by me, including affiliate links. I do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>
          <p>
            <strong className="font-medium">Affiliate Disclosure:</strong> Some links on this site are <strong className="font-medium">affiliate links</strong>. This means that at no additional cost to you, I will earn a small commission if you click through and make a purchase. I only recommend products or services I genuinely believe will add value to my readers. This income helps keep the website running and allows me to create more free recipes.
          </p>
        </section>

        {/* --- 5. User-Generated Content --- */}
        <section id="user-generated-content" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">5. User-Generated Content</h2>
          <p className="mb-3">
            CheapQuickVegan allows users to post comments, ratings, and reviews on recipes. All user-generated content represents the opinions and experiences of individual users and does not reflect the views or opinions of CheapQuickVegan or its owner.
          </p>
          <p className="mb-3">
            <strong className="font-medium">We do not verify or endorse user comments and ratings.</strong> Users are solely responsible for the content they submit. We reserve the right to moderate, edit, or remove any user-generated content that violates our community guidelines, contains inappropriate material, or infringes on third-party rights.
          </p>
          <p>
            By submitting comments or ratings, you grant CheapQuickVegan a non-exclusive, royalty-free, perpetual license to use, display, and distribute your content on this website.
          </p>
        </section>

        {/* --- 6. Copyright and Use --- */}
        <section id="copyright" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">6. Copyright and Reproduction</h2>
          <p>
            All recipes, text, photos, and materials on this website are the property of CheapQuickVegan and are protected by copyright law. Recipes may be printed for personal home use only. Commercial use or redistribution of any content without prior written permission is strictly prohibited.
          </p>
        </section>
      </div>
    </main>
  );
}
