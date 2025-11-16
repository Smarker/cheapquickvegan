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
            <li><a href="#cookies-and-tracking-technologies" className="text-primary hover:underline break-words">3. Cookies and Tracking Technologies</a></li>
            <li><a href="#third-party-services" className="text-primary hover:underline break-words">4. Third-Party Services</a></li>
            <li><a href="#data-security" className="text-primary hover:underline break-words">5. Data Security</a></li>
            <li><a href="#your-rights" className="text-primary hover:underline break-words">6. Your Rights</a></li>
            <li><a href="#childrens-privacy" className="text-primary hover:underline break-words">7. Children's Privacy</a></li>
            <li><a href="#changes-to-this-privacy-policy" className="text-primary hover:underline break-words">8. Changes to This Privacy Policy</a></li>
            <li><a href="#contact-us" className="text-primary hover:underline break-words">9. Contact Us</a></li>
          </ul>
        </nav>
      </div>

      {/* Section Blocks */}
      <section className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <p><strong>Effective date:</strong> November 15, 2025</p>
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
            <strong>Personal information you provide:</strong> For example, if you contact us via a form, subscribe to our newsletter, or make a purchase, you may provide your name, email address, or other contact details.
          </li>
          <li>
            <strong>Automatically collected information:</strong> We may collect information about your device, browser, IP address, pages you visit, and how you interact with our site using cookies, analytics tools, or similar technologies.
          </li>
        </ul>
      </section>

      <section id="how-we-use-your-information" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc ml-4 sm:ml-6 space-y-1 break-words">
          <li>Provide and improve our website and services.</li>
          <li>Communicate with you, including responding to inquiries or sending updates.</li>
          <li>Personalize content and ads in compliance with applicable laws.</li>
          <li>Monitor and analyze site usage and trends.</li>
        </ul>
      </section>

      <section id="cookies-and-tracking-technologies" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">3. Cookies and Tracking Technologies</h2>
        <p className="break-words">
          We use cookies and similar technologies to enhance your experience on our site and analyze site traffic. You can manage or disable cookies in your browser settings, but some features of the site may not function properly if cookies are disabled.
        </p>
      </section>

      <section id="third-party-services" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">4. Third-Party Services</h2>
        <p className="break-words">
          Our site may use third-party services such as Google AdSense, analytics tools, or social media widgets. These services may collect information about your use of the site to provide personalized ads, measure performance, or improve their services.
        </p>
        <p className="mt-2 break-words">
          We do not share your personal information with third parties for their independent marketing purposes without your consent.
        </p>
      </section>

      <section id="data-security" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
        <p className="break-words">
          We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section id="your-rights" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
        <ul className="list-disc ml-4 sm:ml-6 space-y-1 break-words">
          <li>Access or request a copy of the personal data we hold about you.</li>
          <li>Request corrections or deletions of your personal data.</li>
          <li>Opt-out of certain tracking or marketing communications.</li>
        </ul>
        <p className="mt-2 break-words">
          To exercise these rights, please contact us at{" "}
          <a href="mailto:cheapquickvegan@gmail.com" className="text-primary hover:underline break-words">
            cheapquickvegan@gmail.com
          </a>.
        </p>
      </section>

      <section id="childrens-privacy" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
        <p className="break-words">
          Our website is not directed to children under 13, and we do not knowingly collect personal information from children. If we learn that we have inadvertently collected information from a child under 13, we will take steps to delete it.
        </p>
      </section>

      <section id="changes-to-this-privacy-policy" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
        <p className="break-words">
          We may update this Privacy Policy from time to time. The “Effective Date” at the top will indicate the latest version. We encourage you to review this page periodically for any changes.
        </p>
      </section>

      <section id="contact-us" className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
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
