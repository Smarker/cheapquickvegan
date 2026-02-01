"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle"; // Assuming this path is correct
import { Menu, X } from "lucide-react";
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

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [desktopMagicLine, setDesktopMagicLine] = useState({ left: 0, width: 0 });
  const [mobileMagicLine, setMobileMagicLine] = useState({ top: 0, height: 0 });

  const isActive = (href: string) => pathname === href;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Disable browser's native scroll restoration and handle it ourselves
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Desktop magic line
  useEffect(() => {
    if (!desktopNavRef.current) return;
    const activeLink = Array.from(desktopNavRef.current.children).find((child) => {
      const a = child.querySelector("a");
      return a?.getAttribute("href") === pathname;
    }) as HTMLDivElement | undefined;

    if (activeLink) {
      setDesktopMagicLine({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    }
  }, [pathname]);

  // Mobile magic line
  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeLink = Array.from(mobileNavRef.current.children).find((child) => {
      const a = child.querySelector("a");
      return a?.getAttribute("href") === pathname;
    }) as HTMLDivElement | undefined;

    if (activeLink) {
      setMobileMagicLine({
        top: activeLink.offsetTop,
        height: activeLink.offsetHeight,
      });
    }
  }, [pathname, mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-foreground"
              >
                CheapQuickVegan
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Desktop nav */}
              <div className="hidden md:flex space-x-6 relative text-foreground/80">
                <div ref={desktopNavRef} className="relative flex space-x-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative px-1 py-2 transition-colors"
                    >
                      <span
                        className={`relative z-10 ${
                          isActive(link.href) ? "font-semibold text-primary" : ""
                        }`}
                      >
                        {link.name}
                      </span>
                    </Link>
                  ))}
                  {/* Desktop magic line */}
                  <span
                    className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out"
                    style={{
                      left: desktopMagicLine.left,
                      width: desktopMagicLine.width,
                    }}
                  />
                </div>
              </div>

              {/* Search */}
              <SearchButton />

              {/* Mode toggle */}
              <ModeToggle />

              {/* Hamburger menu */}
              <button
                className="md:hidden p-2 rounded hover:bg-secondary-foreground/10 transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "max-h-96 mt-2" : "max-h-0"
            }`}
          >
            <div ref={mobileNavRef} className="relative flex flex-col">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-3 rounded transition ${
                    isActive(link.href)
                      ? "bg-primary/10 border-l-4 border-primary font-semibold"
                      : "hover:bg-secondary-foreground/10"
                  } ${idx === navLinks.length - 1 ? "mb-3" : ""}`} // extra spacing for last item
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Mobile magic line */}
              <span
                className="absolute left-0 w-1 bg-primary rounded transition-all duration-300 ease-in-out"
                style={{
                  top: mobileMagicLine.top,
                  height: mobileMagicLine.height,
                }}
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
          <p className="text-center text-secondary-foreground">
            © {new Date().getFullYear()} CheapQuickVegan. All rights reserved.
          </p>

          {/* Desktop links */}
          <div className="hidden md:flex gap-4">
            <a
              href="/contact"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm"
            >
              Contact
            </a>
            {/* Link to dedicated Privacy Policy page */}
            <a
              href="/privacy-policy"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm"
            >
              Privacy Policy
            </a>
            {/* Link to dedicated Disclaimer page */}
            <a
              href="/disclaimer"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm"
            >
              Disclaimer
            </a>
            <CookieSettingsButton className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm" />
          </div>

          {/* Mobile links */}
          <div className="flex md:hidden flex-col mt-2 space-y-1">
            <a
              href="/contact"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm text-center"
            >
              Contact
            </a>
            {/* Link to dedicated Privacy Policy page */}
            <a
              href="/privacy-policy"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm text-center"
            >
              Privacy Policy
            </a>
            {/* Link to dedicated Disclaimer page */}
            <a
              href="/disclaimer"
              className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm text-center"
            >
              Disclaimer
            </a>
            <CookieSettingsButton className="text-secondary-foreground/80 hover:text-secondary-foreground underline text-sm text-center" />
          </div>
        </div>
      </footer>
    </div>
  );
}