"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu, X, Instagram, Facebook, Mail } from "lucide-react";
import CookieSettingsButton from "./consent/cookie-settings-button";
import { SearchButton } from "@/components/search/search-button";

interface LayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { name: "Recipes", href: "/recipes" },
  { name: "Guides", href: "/guides" },
  { name: "Start Here", href: "/start-here" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Disable browser's native scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation - Clean food blog style */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 shadow-sm print:hidden">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* Logo - Food blog style with emphasis */}
            <Link
              href="/"
              className="text-2xl lg:text-3xl font-bold tracking-tight text-[#606C38] dark:text-[#a3b18a] hover:text-[#735d78] dark:hover:text-[#735d78] transition-colors duration-200"
              aria-label="CheapQuickVegan Home"
            >
              CheapQuickVegan
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-7" role="menubar">
                {navLinks.map((link) => (
                  <li key={link.href} role="none">
                    <Link
                      href={link.href}
                      role="menuitem"
                      className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                        isActive(link.href)
                          ? "text-[#BC6C25] dark:text-[#BC6C25]"
                          : "text-neutral-700 dark:text-neutral-300 hover:text-[#606C38] dark:hover:text-[#a3b18a]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Utility buttons */}
              <div className="flex items-center gap-3 pl-6 border-l border-neutral-200 dark:border-neutral-700">
                <SearchButton />
                <ModeToggle />
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <SearchButton />
              <ModeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Light and simple */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <ul className="flex flex-col gap-1" role="menu">
                {navLinks.map((link) => (
                  <li key={link.href} role="none">
                    <Link
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive(link.href)
                          ? "bg-[#606C38]/10 text-[#606C38] dark:bg-[#a3b18a]/10 dark:text-[#a3b18a]"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
        {children}
      </main>

      {/* Footer - SEO-optimized food blog style */}
      <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-16 print:hidden" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">

            {/* Brand & Description - SEO value */}
            <div className="md:col-span-5">
              <Link
                href="/"
                className="inline-block text-2xl font-bold text-[#606C38] dark:text-[#a3b18a] mb-4"
              >
                CheapQuickVegan
              </Link>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                Discover quick, affordable, and delicious vegan recipes. From weeknight dinners to special treats,
                find plant-based meals that are simple to make and budget-friendly.
              </p>

              {/* Social Media - Important for food blogs */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Follow:</span>
                <a
                  href="https://instagram.com/cheapquickvegan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#BC6C25]/10 text-[#BC6C25] hover:bg-[#BC6C25] hover:text-white transition-all duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61584092626079"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#606C38]/10 text-[#606C38] dark:text-[#a3b18a] hover:bg-[#606C38] dark:hover:bg-[#a3b18a] hover:text-white transition-all duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="mailto:cheapquickvegan@gmail.com"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#735d78]/10 text-[#735d78] hover:bg-[#735d78] hover:text-white transition-all duration-200"
                  aria-label="Email us"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
                Explore
              </h3>
              <ul className="space-y-2.5">
                {navLinks.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Info */}
            <div className="md:col-span-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
                Information
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors"
                  >
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <CookieSettingsButton className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#BC6C25] dark:hover:text-[#BC6C25] transition-colors" />
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              © {new Date().getFullYear()} CheapQuickVegan. All rights reserved. Made with 🌱 for plant-based food lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}