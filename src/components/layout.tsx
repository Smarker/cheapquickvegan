import Link from "next/link";
import { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary text-secondary-foreground shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: logo + nav links */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-foreground"
              >
                CheapQuickVegan
              </Link>

              {/* 🥦 Navigation links */}
              <div className="flex space-x-6 text-foreground/80">
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
            </div>

            {/* Right side: mode toggle */}
            <div className="flex items-center">
              <ModeToggle />
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
