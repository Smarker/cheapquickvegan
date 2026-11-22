// app/posts/[slug]/page.tsx
import { permanentRedirect, redirect } from "next/navigation";

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
    "5-minute-vegan-microwave-fudge-squares-no-bake-oat-milk-chocolate": "vegan-5-minute-fudge-squares",
    "vegan-bagel-burger": "quick-vegan-bagel-burger",
    "vegan-lemon-peel-granita": "vegan-no-churn-lemon-granita",
    "vegan-pistachio-halva": "vegan-tahini-maple-halva",
    "vegan-cauliflower-pesto-soup": "creamy-vegan-cauliflower-basil-soup",
    "vegan-agadashi-tofu": "crispy-vegan-agedashi-tofu",
    "crispy-roasted-artichokes": "crispy-roasted-artichoke-hearts",
    "vegan-tahini-date-balls": "tahini-date-energy-balls",
    "vegan-oat-carrot-cake-balls": "vegan-gf-carrot-cake-balls",
    "vegan-focaccia": "pillowy-vegan-focaccia-bread",
    "vegan-peanut-butter-ramen": "quick-vegan-peanut-butter-ramen",
    "vegan-pea-and-mushroom-risotto": "creamy-vegan-saffron-risotto",
    "easy-vegan-lemon-granita-sweet-tart-no-churn-italian-ice": "vegan-no-churn-lemon-granita",
    "quick-vegan-red-curry-with-air-fryer-tofu-maesri-paste-weeknight-meal": "maesri-paste-weeknight-curry",
    "crispy-vegan-baklava-with-maple-glaze-layered-nut-phyllo-dessert": "crispy-vegan-maple-baklava",
    "easy-creamy-vegan-potato-and-leek-soup-made-with-cashews-no-dairy": "creamy-vegan-potato-leek-soup",
    "creamy-vegan-elote-grilled-mexican-street-corn-with-taj-n-lime": "creamy-vegan-mexican-elote",
    "vegan-elote-mexican-street-corn": "creamy-vegan-mexican-elote",
    "vegan-s-mores-cookies": "vegan-smores-cookies-marshmallow",
    "pillowy-vegan-focaccia-same-day-or-cold-proof-option": "pillowy-vegan-focaccia-bread",
    "quick-vegan-bagel-burger-30-minute-beyond-patty-cream-cheese": "quick-vegan-bagel-burger",
    "vegan-breakfast-tacos-for-dinner": "vegan-breakfast-tacos-dinner",
    "vegan-5-minute-fudge-squares": "vegan-5-minute-fudge-squares",
    "high-protein-vegan-blueberry-maple-smoothie-pre-workout-or-meal-replacement": "high-protein-vegan-blueberry-smoothie",
    "vegan-potato-and-leek-soup": "creamy-vegan-potato-leek-soup",
    "vegan-blueberry-maple-smoothie": "high-protein-vegan-blueberry-smoothie",
    "creamy-vegan-saffron-risotto-milanese-style-with-vegan-butter-turmeric": "creamy-vegan-saffron-risotto",
    "high-protein-vegan-tahini-date-balls-no-bake-4-ingredient-energy-bites": "tahini-date-energy-balls",
    "vegan-gluten-free-carrot-cake-balls-oat-flour-maple-sweetened": "vegan-gf-carrot-cake-balls",
    "vegan-coconut-red-curry": "maesri-paste-weeknight-curry",
    "quick-vegan-halva-recipe-3-ingredient-tahini-maple-syrup-dessert": "vegan-tahini-maple-halva",
    "vegan-gazpacho": "fresh-vegan-no-cook-gazpacho",
    "vegan-calzone": "quick-vegan-air-fryer-calzone"
  };

  const newSlug = slugMap[slug] || slug;

  // Permanent redirect to the new recipe URL
  permanentRedirect(`/recipes/${newSlug}`);
}
