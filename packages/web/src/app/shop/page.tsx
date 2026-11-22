import React from 'react';
import StripeBuyButton from '@/components/stripe-buy-button';
import { ShoppingBag } from 'lucide-react';

const products = [
  {
    name: '15 Vegan Recipes Notion Bundle',
    description: 'The first 15 recipes on my site in Notion, ad-free.',
    buyButtonId: 'buy_btn_1SMfQCA32Su6hYKXu1SFKQZe',
  },
];

export default function ShopPage() {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -my-5 sm:-my-12 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-background">
      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">

        {/* Two-column layout: Shop Info & Product Details on left, Get Instant Access on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Shop Header + Product Details */}
          <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-orange-100 dark:border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 dark:bg-card/50 p-3 rounded-full">
                <ShoppingBag className="text-orange-600 dark:text-secondary" style={{ width: 36, height: 36 }} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">
                <span className="relative inline-block">
                  <span className="relative z-10">Shop</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-400/30 -rotate-1"></span>
                </span>
              </h1>
            </div>
            <p className="text-foreground/70 text-base sm:text-lg mb-6">
              Buy my Notion recipe bundles and get instant access after purchase!
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 uppercase tracking-wider text-[#606C38] dark:text-[#a3b18a]">
              <span className="relative inline-block">
                <span className="relative z-10">{products[0].name}</span>
                <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg mb-6">{products[0].description}</p>

            <div className="space-y-3 text-sm sm:text-base text-foreground/80">
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-primary">✓</span>
                <span>Ad-free Notion template</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-primary">✓</span>
                <span>15 delicious vegan recipes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-primary">✓</span>
                <span>Instant access after purchase</span>
              </div>
            </div>
          </div>

          {/* Right: Get Instant Access */}
          <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-orange-100 dark:border-border flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold mb-4 uppercase tracking-wider">
              <span className="relative inline-block">
                <span className="relative z-10">Get Instant Access</span>
                <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
              </span>
            </h3>
            {/* Reserve space for Stripe button to prevent CLS */}
            <div className="w-full flex justify-center items-start">
              <StripeBuyButton buyButtonId={products[0].buyButtonId} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
