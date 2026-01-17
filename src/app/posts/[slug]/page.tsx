// app/posts/[slug]/page.tsx
import { redirect } from "next/navigation";

export default async function LegacyPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  if (!slug) {
    // If for some reason slug is missing, send home instead of undefined
    redirect("/");
  }

  // Optional: mapping old slug -> new slug if they changed
  const slugMap: Record<string, string> = {
    "vegan-baklava": "crispy-vegan-maple-baklava",
    "crispy-vegan-agedashi-tofu-air-fryer-coconut-oil-fry-method": "crispy-vegan-agedashi-tofu",
    "quick-vegan-peanut-butter-ramen-savory-sauce-with-gochujang-lime": "quick-vegan-peanut-butter-ramen",
    "easy-crispy-roasted-artichoke-hearts-sheet-pan-side-dish": "crispy-roasted-artichoke-hearts",
    "creamy-vegan-cauliflower-pesto-soup-dairy-free-fall-comfort-meal": "creamy-vegan-cauliflower-basil-soup",
    "best-vegan-s-mores-cookies-with-flax-egg-chewy-centers-easy-prep": "vegan-smores-cookies-marshmallow",
    "one-bowl-vegan-sourdough-discard-blueberry-pancakes-no-eggs-dairy-free": "vegan-sourdough-blueberry-pancakes",
    "quick-vegan-breakfast-tacos-for-dinner-30-minute-leftover-recipe": "vegan-breakfast-tacos-dinner",
    "quick-vegan-air-fryer-calzones-with-premade-pizza-dough-no-oven-needed": "quick-vegan-air-fryer-calzone",
    "quick-vegan-tofu-stir-fry-with-sesame-spinach-air-fryer-tofu-prep": "quick-tofu-sesame-stir-fry",
    "5-minute-vegan-microwave-fudge-squares-no-bake-oat-milk-chocolate": "vegan-5-minute-fudge-squares"
  };

  const newSlug = slugMap[slug] || slug;

  // Permanent redirect to the new recipe URL
  redirect(`/recipes/${newSlug}`);
}
