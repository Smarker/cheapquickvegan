import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 scroll-smooth overflow-x-hidden">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>

      {/* Table of Contents */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <nav>
          <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
          <ul className="list-none ml-0 space-y-1 break-words">
            <li><a href="#information-we-collect" className="text-primary hover:underline break-words">1. Information We Collect</a></li>
            <li><a href="#how-we-use-your-information" className="text-primary hover:underline break-words">2. How We Use Your Information</a></li>
            <li><a href="#user-generated-content" className="text-primary hover:underline break-words">3. User-Generated Content (Comments & Ratings)</a></li>
            <li><a href="#local-storage" className="text-primary hover:underline break-words">4. Local Storage</a></li>
            <li><a href="#cookies-and-tracking-technologies" className="text-primary hover:underline break-words">5. Cookies and Tracking Technologies</a></li>
            <li><a href="#third-party-services" className="text-primary hover:underline break-words">6. Third-Party Services</a></li>
            <li><a href="#data-retention" className="text-primary hover:underline break-words">7. Data Retention</a></li>
            <li><a href="#data-security" className="text-primary hover:underline break-words">8. Data Security</a></li>
            <li><a href="#your-rights" className="text-primary hover:underline break-words">9. Your Rights</a></li>
            <li><a href="#childrens-privacy" className="text-primary hover:underline break-words">10. Children's Privacy</a></li>
            <li><a href="#changes-to-this-privacy-policy" className="text-primary hover:underline break-words">11. Changes to This Privacy Policy</a></li>
            <li><a href="#gdpr-compliance" className="text-primary hover:underline break-words">12. GDPR Compliance</a></li>
            <li><a href="#contact-us" className="text-primary hover:underline break-words">13. Contact Us</a></li>
          </ul>
        </nav>
      </div>

      {/* Section Blocks */}
      <section className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <p><strong>Effective date:</strong> January 31, 2026</p>
        <p className="mt-2 break-words">
          CheapQuickVegan (“we”, “our”, or “us”) respects your privacy and is
          committed to protecting it. This Privacy Policy explains how we collect,
          use, and share information when you visit our website{" "}
          <Link href="https://www.cheapquickvegan.com" className="text-primary hover:underline break-all">
            https://www.cheapquickvegan.com
          </Link>.
        </p>
      </section>

      <section id="information-we-collect" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
        <p>When you use our website, we may collect the following types of information:</p>
        <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1 break-words">
          <li>
            <strong>Personal information you provide:</strong> When you leave comments or contact us via a form, you may provide your name, email address, or other contact details. Name and email are optional for comments.
          </li>
          <li>
            <strong>Automatically collected information:</strong> We collect information about your device, browser, IP address, pages you visit, and how you interact with our site using cookies, analytics tools, or similar technologies.
          </li>
          <li>
            <strong>IP addresses:</strong> We collect and store IP addresses when you submit comments, ratings, or share recipes. This information is used solely for spam prevention and abuse detection.
          </li>
          <li>
            <strong>User interactions:</strong> We collect data about your interactions with recipes, including ratings, comments, shares, and favorites to improve our service and prevent abuse.
          </li>
        </ul>
      </section>

      <section id="how-we-use-your-information" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc ml-4 sm:ml-6 space-y-1 break-words">
          <li>Provide and improve our website and services.</li>
          <li>Communicate with you, including responding to inquiries or sending updates.</li>
          <li>Display and moderate user-generated content (comments and ratings).</li>
          <li>Prevent spam, abuse, and duplicate submissions.</li>
          <li>Personalize content and ads in compliance with applicable laws.</li>
          <li>Monitor and analyze site usage and trends.</li>
        </ul>
      </section>

      <section id="user-generated-content" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">3. User-Generated Content (Comments & Ratings)</h2>
        <p className="break-words">When you leave a comment or rating on our recipes, we collect:</p>
        <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1 break-words">
          <li><strong>Name</strong> (optional): Displayed publicly with your comment.</li>
          <li><strong>Email address</strong> (optional): Not displayed publicly. Used only for moderation purposes.</li>
          <li><strong>Comment text and rating:</strong> Displayed publicly on the recipe page.</li>
          <li><strong>IP address:</strong> Stored for spam prevention and abuse detection. Not displayed publicly.</li>
          <li><strong>Ownership token:</strong> A random identifier stored in your browser's localStorage to allow you to edit or update your own comments/ratings.</li>
        </ul>
        <p className="mt-3 break-words">
          <strong>Moderation:</strong> All comments are subject to moderation before being published. We reserve the right to remove comments that violate our community guidelines.
        </p>
        <p className="mt-2 break-words">
          <strong>Your control:</strong> You can delete your own comments/ratings using the delete function on the comment, or request deletion by contacting us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>{" "}
          or using our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact form
          </Link>{" "}(select "Data Deletion Request").
        </p>
      </section>

      <section id="local-storage" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">4. Local Storage</h2>
        <p className="break-words">
          We use your browser's local storage (a type of web storage) to store certain preferences and data locally on your device. This data never leaves your device unless you explicitly sync it:
        </p>
        <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1 break-words">
          <li><strong>Favorite recipes:</strong> Recipe IDs of recipes you've marked as favorites.</li>
          <li><strong>Rating tokens:</strong> Random identifiers that allow you to update your ratings on recipes.</li>
          <li><strong>Comment ownership tokens:</strong> Random identifiers that allow you to edit or delete your own comments.</li>
        </ul>
        <p className="mt-3 break-words">
          You can clear this data at any time by clearing your browser's local storage or site data for our website.
        </p>
      </section>

      <section id="cookies-and-tracking-technologies" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">5. Cookies and Tracking Technologies</h2>
        <p className="break-words">
          We use cookies and similar technologies to enhance your experience on our site and analyze site traffic. You can manage or disable cookies in your browser settings, but some features of the site may not function properly if cookies are disabled.
        </p>
      </section>

      <section id="third-party-services" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">6. Third-Party Services</h2>
        <p className="break-words">
          Our site may use third-party services such as Google AdSense, analytics tools, or social media widgets. These services may collect information about your use of the site to provide personalized ads, measure performance, or improve their services.
        </p>
        <p className="mt-2 break-words">
          We do not share your personal information with third parties for their independent marketing purposes without your consent.
        </p>
      </section>

      <section id="data-retention" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
        <p className="break-words">We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy:</p>
        <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1 break-words">
          <li><strong>Comments and ratings:</strong> Retained indefinitely unless you request deletion or we remove them for violating our guidelines.</li>
          <li><strong>IP addresses:</strong> Retained for up to 2 years for spam prevention purposes.</li>
          <li><strong>Contact form submissions:</strong> Retained as long as necessary to respond to your inquiry.</li>
          <li><strong>Analytics data:</strong> Aggregated and anonymized data may be retained indefinitely for statistical purposes.</li>
        </ul>
        <p className="mt-3 break-words">
          You may request deletion of your personal data at any time by contacting us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>{" "}
          or using our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact form
          </Link>{" "}(select "Data Deletion Request").
        </p>
      </section>

      <section id="data-security" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">8. Data Security</h2>
        <p className="break-words">
          We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section id="your-rights" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">9. Your Rights</h2>
        <p className="break-words">You have the right to:</p>
        <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1 break-words">
          <li>Access or request a copy of the personal data we hold about you.</li>
          <li>Request corrections or deletions of your personal data.</li>
          <li>Withdraw consent for data processing where consent is the legal basis.</li>
          <li>Opt-out of certain tracking or marketing communications.</li>
          <li>Object to processing of your personal data for direct marketing purposes.</li>
        </ul>
        <p className="mt-3 break-words">
          To exercise these rights, please contact us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact form
          </Link>{" "}(select "Data Deletion Request").
        </p>
      </section>

      <section id="childrens-privacy" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
        <p className="break-words">
          Our website is not directed to children under 13, and we do not knowingly collect personal information from children. If we learn that we have inadvertently collected information from a child under 13, we will take steps to delete it.
        </p>
      </section>

      <section id="changes-to-this-privacy-policy" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
        <p className="break-words">
          We may update this Privacy Policy from time to time. The "Effective Date" at the top will indicate the latest version. We encourage you to review this page periodically for any changes.
        </p>
      </section>

      <section id="gdpr-compliance" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">12. GDPR Compliance</h2>
        <p className="break-words">
          If you are visiting from the European Union, we comply with the General Data Protection Regulation (GDPR). This means:
        </p>
        <ul className="list-disc ml-4 sm:ml-6 space-y-1 break-words">
          <li>We obtain your consent before using non-essential cookies and tracking technologies.</li>
          <li>You have the right to access, correct, or delete your personal data.</li>
          <li>You can withdraw consent for tracking cookies at any time through our cookie settings in the site's footer or browser settings.</li>
          <li>We do not share your personal data with third parties for their independent marketing purposes without your consent.</li>
        </ul>
        <p className="mt-2 break-words">
          To exercise your GDPR rights, please contact us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact form
          </Link>{" "}(select "Data Deletion Request").
        </p>
      </section>

      <section id="contact-us" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
        <ul className="list-disc ml-4 sm:ml-6 space-y-1 break-words">
          <li>
            Email:{" "}
            <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
              cheapquickvegan@gmail.com
            </a>
          </li>
          <li>
            Website:{" "}
            <Link href="https://www.cheapquickvegan.com" className="text-primary hover:underline break-all">
              https://www.cheapquickvegan.com
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
