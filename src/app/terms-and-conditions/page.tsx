import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 scroll-smooth overflow-x-hidden">
      <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>

      {/* Table of Contents */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <nav>
          <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
          <ul className="list-none ml-0 space-y-1 break-words">
            <li><a href="#eligibility" className="text-primary hover:underline break-words">1. Eligibility</a></li>
            <li><a href="#free-recipes" className="text-primary hover:underline break-words">2. Use of Free Recipes</a></li>
            <li><a href="#notion-bundles" className="text-primary hover:underline break-words">3. Notion Recipe Bundles</a></li>
            <li><a href="#intellectual-property" className="text-primary hover:underline break-words">4. Intellectual Property</a></li>
            <li><a href="#disclaimer" className="text-primary hover:underline break-words">5. Disclaimer of Liability</a></li>
            <li><a href="#limitation" className="text-primary hover:underline break-words">6. Limitation of Liability</a></li>
            <li><a href="#governing-law" className="text-primary hover:underline break-words">7. Governing Law</a></li>
            <li><a href="#changes" className="text-primary hover:underline break-words">8. Changes to Terms</a></li>
            <li><a href="#contact" className="text-primary hover:underline break-words">9. Contact Us</a></li>
          </ul>
        </nav>
      </div>

      {/* Section Blocks */}
      <section className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <p><strong>Effective date:</strong> November 15, 2025</p>
        <p className="mt-2 break-words">
          Welcome to CheapQuickVegan! By accessing or using our website{" "}
          <Link href="https://www.cheapquickvegan.com" className="text-primary hover:underline break-all">
            https://www.cheapquickvegan.com
          </Link>, you agree to comply with and be bound by these Terms and Conditions.
          Please read them carefully before using the site or purchasing our Notion recipe bundles.
        </p>
      </section>

      <section id="eligibility" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">1. Eligibility</h2>
        <p>
          By using this website, you agree to comply with these Terms and Conditions.
          There are no age restrictions for accessing free recipes or viewing the site.
          Purchases of Notion recipe bundles should be made by individuals capable of
          understanding and agreeing to these terms.
        </p>
      </section>

      <section id="free-recipes" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">2. Use of Free Recipes</h2>
        <p>
          All free recipes provided on this site are for personal, non-commercial use
          only. You may not redistribute, sell, or claim the content as your own
          without explicit permission.
        </p>
      </section>

      <section id="notion-bundles" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">3. Notion Recipe Bundles</h2>
        <p>
          Our Notion recipe bundles are digital products. Once purchased, you will
          receive access to download or copy the bundle. These bundles are for
          personal use only and cannot be resold, redistributed, or shared publicly
          without permission.
        </p>
        <p className="mt-2 break-words">
          All sales of digital products are final. We do not offer refunds, but if you
          encounter technical issues accessing a bundle, please contact us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>.
        </p>
      </section>

      <section id="intellectual-property" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
        <p>
          All content on this site, including recipes, images, and Notion bundles, is
          the property of CheapQuickVegan or its licensors and is protected by
          copyright and intellectual property laws. You may not copy, modify,
          distribute, or create derivative works without permission.
        </p>
      </section>

      <section id="disclaimer" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">5. Disclaimer of Liability</h2>
        <p>
          All recipes are provided for informational purposes only. We are not
          responsible for any allergic reactions, health issues, or other consequences
          that may occur from using the recipes. Use at your own discretion.
        </p>
      </section>

      <section id="limitation" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, CheapQuickVegan will not be liable
          for any damages arising from the use or inability to use this website or any
          purchased products.
        </p>
      </section>

      <section id="governing-law" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">7. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United States. Any disputes will
          be resolved under applicable laws in your jurisdiction.
        </p>
      </section>

      <section id="changes" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. The “Effective Date” at the
          top reflects the latest version. Your continued use of the site constitutes
          acceptance of any changes.
        </p>
      </section>

      <section id="contact" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
        <p className="break-words">
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>.
        </p>
      </section>
    </main>
  );
}
