import Image from "next/image";
import { Metadata } from "next";
import { Instagram, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About | CheapQuickVegan",
  description:
    "Learn more about CheapQuickVegan — simple, affordable vegan recipes and Notion bundles for easy plant-based living.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">About CheapQuickVegan</h1>

      {/* 🥑 Image or logo */}
      <div className="flex justify-center mb-10">
        <Image
          src="/images/stephanie.jpg"
          alt="CheapQuickVegan creator"
          width={160}
          height={160}
          className="rounded-full shadow-md object-cover"
        />
      </div>

      <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>
          CheapQuickVegan is all about making plant-based eating <em>simple, affordable, and
          delicious</em>. Whether you’re new to vegan cooking or just want easy weeknight meals,
          you’ll find recipes that use everyday ingredients and take minimal time to prepare.
        </p>

        <p>
          I started this blog to prove that you don’t need expensive ingredients or hours in the
          kitchen to enjoy great vegan food. Each recipe is tested and paired with a clean layout
          that’s easy to follow, whether you’re cooking for one or feeding a family.
        </p>

        <p>
          If you want to take your meal planning a step further, check out the{" "}
          <a
            href="/shop"
            className="text-[#606C38] hover:underline font-medium"
          >
            Shop
          </a>{" "}
          for Notion recipe bundles and planners — perfect for organizing your favorite meals and
          grocery lists.
        </p>
      </div>

      {/* 🌿 Social / Contact section */}
      <div className="mt-12 border-t border-border pt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Let’s Connect</h2>
        <p className="text-muted-foreground mb-6">
          Follow for new recipes, vegan tips, and Notion tools.
        </p>

        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/cheapquickvegan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-[#BC6C25] transition"
          >
            <Instagram size={28} />
          </a>
          <a
                href="mailto:cheapquickvegan@gmail.com"
                className="inline-flex items-center justify-center text-foreground/80 hover:text-[#BC6C25] transition cursor-pointer"
            >
                <Mail size={28} />
            </a>
        </div>
      </div>
    </main>
  );
}
