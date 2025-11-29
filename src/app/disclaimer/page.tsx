import { Metadata } from "next";

// --- METADATA ---
export const metadata: Metadata = {
  title: "Disclaimer | Cheap, Quick, and Simple Vegan Recipes",
  description:
    "Review the disclaimer for CheapQuickVegan regarding health advice, recipe safety, and affiliate disclosures.",
};

export default function DisclaimerPage() {
  return (
    // Reusing the max-width and padding from your AboutPage component
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Disclaimer</h1>

      <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">

        {/* --- 1. General Information and Liability --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">General Information</h2>
          <p>
            The content on CheapQuickVegan.com, including all recipes, articles, and meal plans, is provided for general informational and entertainment purposes only. While I strive to provide accurate and up-to-date information, I make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, or services contained on this website for any purpose.
          </p>
          <p>
            Any reliance you place on such information is therefore strictly at your own risk.
          </p>
        </section>

        {/* --- 2. Health and Nutritional Advice Disclaimer --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Health and Dietary Advice</h2>
          <p>
            I am not a doctor, registered dietitian, nutritionist, or medical professional. The information and recipes provided on CheapQuickVegan.com are based on my personal experience, research, and culinary interest as a home cook.
          </p>
          <p>
            The recipes and information here are <strong className="font-medium">not intended</strong> to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition or dietary change. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
          </p>
        </section>

        {/* --- 3. Recipe Safety and Preparation --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Recipe Safety and Allergens</h2>
          <p>
            All users assume full responsibility for any and all risks associated with the handling, preparation, and consumption of food in recipes from this site. This includes, but is not limited to, proper food hygiene, safe food storage, and avoiding potential allergens.
          </p>
          <p>
            CheapQuickVegan provides <strong className="font-medium">vegan recipes</strong> (free of meat, dairy, eggs, and animal-derived ingredients like honey). However, it is the user's responsibility to check all packaged food labels for hidden animal products, allergens, and cross-contamination warnings, as product ingredients can change without notice.
          </p>
        </section>

        {/* --- 4. Affiliate and External Links Disclosure (Crucial for monetized blogs) --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Affiliate & External Links Disclosure</h2>
          <p>
            CheapQuickVegan may contain links to external websites that are not provided or maintained by me, including affiliate links. I do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>
          <p>
            <strong className="font-medium">Affiliate Disclosure:</strong> Some links on this site are <strong className="font-medium">affiliate links</strong>. This means that at no additional cost to you, I will earn a small commission if you click through and make a purchase. I only recommend products or services I genuinely believe will add value to my readers. This income helps keep the website running and allows me to create more free recipes.
          </p>
        </section>

        {/* --- 5. Copyright and Use --- */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Copyright and Reproduction</h2>
          <p>
            All recipes, text, photos, and materials on this website are the property of CheapQuickVegan and are protected by copyright law. Recipes may be printed for personal home use only. Commercial use or redistribution of any content without prior written permission is strictly prohibited.
          </p>
        </section>
      </div>

      {/* Optional: Add space below content if no footer padding is sufficient */}
      <div className="pt-12"></div>
    </main>
  );
}
