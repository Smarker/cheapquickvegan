"use client";

import { useState } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-secondary-foreground shadow-md">
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
              <div className="hidden md:flex space-x-6 text-foreground/80">
                <Link
                  href="/shop"
                  className="hover:text-foreground transition-colors"
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </div>

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
              mobileMenuOpen ? "max-h-60 mt-2" : "max-h-0"
            }`}
          >
            <div className="flex flex-col">
              <Link
                href="/shop"
                className="block px-3 py-2 rounded hover:bg-secondary-foreground/10 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded hover:bg-secondary-foreground/10 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded hover:bg-secondary-foreground/10 transition mb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-secondary-foreground">
            © {new Date().getFullYear()} CheapQuickVegan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
