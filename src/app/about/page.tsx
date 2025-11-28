import Image from "next/image";
import { Metadata } from "next";
import { Instagram, Mail } from "lucide-react";

// --- OPTIMIZED METADATA ---
export const metadata: Metadata = {
  title: "About | Cheap, Quick, and Simple Vegan Recipes",
  description:
    "I'm Stephanie, the creator of CheapQuickVegan! My mission is to share the best affordable vegan recipes, quick weeknight dinners, and Notion meal planners for simple vegan living.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">About CheapQuickVegan</h1>

      {/* 🥑 Image or logo */}
      <div className="relative w-40 h-40 mx-auto mb-10">
        <Image
          src="/images/stephanie-about.jpg"
          alt="CheapQuickVegan creator"
          fill
          sizes="(max-width: 640px) 160px, 10vw"
          className="rounded-full shadow-md object-cover"
        />
      </div>

      <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
        
        {/* H2: Mission statement emphasizes 'quick' and 'affordable vegan' */}
        <h2 className="text-3xl font-semibold mb-4">My Mission: Providing the <strong className="font-medium">best quick and affordable vegan recipes</strong> for everyone.</h2>
        
        {/* --- PERSONAL STORY & INSPIRATION --- */}
        <p>
          Welcome to CheapQuickVegan! My <strong className="font-medium">journey with vegan cooking</strong> started when my boyfriend adopted a <strong className="font-medium">vegan diet</strong> for health reasons. What began as a challenge quickly turned into a passion. I discovered that <strong className="font-medium">vegan cooking</strong> is incredibly fun and a creative way to experiment with substitutions and unexpected ingredients.
        </p>

        {/* H3: Focusing on the specific culinary fun and influence */}
        <h3 className="text-2xl font-semibold mt-8 mb-4">Vegan Twists on Italian Family Classics 🇮🇹</h3>
        <p>
          My recipes are heavily influenced by the food I learned from my boyfriend's extended <strong className="font-medium">Italian family</strong>. I love demonstrating how small, simple edits can make a massive impact on classic dishes (like adding <strong className="font-medium">plant milk to focaccia</strong> for extra crispiness!). Every recipe shared here aims to be both delicious and extremely <strong className="font-medium">time-efficient</strong>.
        </p>

        <p>
          I want to make <strong className="font-medium">vegan eating</strong> <em className="font-semibold">simple, affordable, and delicious </em> 
          by providing the <strong className="font-medium">best cheap vegan recipes</strong> and resources, proving that you don't need expensive ingredients or hours in the kitchen to enjoy great food.
        </p>
        
        <p>
          Whether you're new to <strong className="font-medium">vegan cooking</strong> or just want <strong className="font-medium">easy weeknight meals</strong>, you'll find recipes here that use <strong className="font-medium">everyday ingredients</strong> and take minimal time to prepare. Every <strong className="font-medium">quick vegan meal</strong> on CheapQuickVegan is paired with a clean, mobile-first layout that's easy to follow. 
        </p>

        {/* Closing paragraph for call-to-action */}
        <p>
          If you want to take your <strong className="font-medium">meal planning</strong> further, check out the 
          {" "}
          <a
            href="/shop"
            className="text-[#606C38] hover:underline font-medium"
          >
            Shop
          </a>{" "}
          for my <strong className="font-medium">Notion recipe bundles</strong> and <strong className="font-medium">vegan meal planners</strong>, perfect for organizing your favorite
           vegan meals and grocery lists.
        </p>
      </div>

      {/* 🌿 Social / Contact section */}
      <div className="mt-12 border-t border-border pt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Let's Connect</h2> 
        <p className="text-muted-foreground mb-6">
          Follow for new recipes, vegan tips, and Notion recipe bundles.
        </p>

        <div className="flex justify-center gap-8">
          <a
            href="https://instagram.com/cheapquickvegan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-[#BC6C25] transition"
          >
            <Instagram size={32} />
          </a>
          <a
            href="mailto:cheapquickvegan@gmail.com"
            className="inline-flex items-center justify-center text-foreground/80 hover:text-[#BC6C25] transition cursor-pointer"
          >
            <Mail size={32} />
          </a>
        </div>
      </div>
    </main>
  );
}
