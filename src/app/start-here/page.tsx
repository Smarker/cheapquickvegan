"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

export default function StartHerePage() {
  const [mood, setMood] = useState<string | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipVisible, setTipVisible] = useState(false);

  const recipes = [
    {
      title: "Vegan Coconut Red Curry",
      link: "/recipes/maesri-paste-weeknight-curry",
      subtitle: "Creamy, fragrant, and easy for weeknights",
      mood: "adventurous",
    },
    {
      title: "Spinach, Tofu & Sesame Stir-Fry",
      link: "/recipes/quick-tofu-sesame-stir-fry",
      subtitle: "Quick, nutrient-packed, and full of flavor",
      mood: "quick",
    },
    {
      title: "Potato & Leek Soup",
      link: "/recipes/creamy-vegan-potato-leek-soup",
      subtitle: "Warm, comforting, and budget-friendly",
      mood: "cozy",
    },
    {
      title: "Vegan Agadashi Tofu",
      link: "/recipes/crispy-vegan-agedashi-tofu",
      subtitle: "Crispy tofu in a savory umami broth",
      mood: "adventurous",
    },
  ];

  const filteredRecipes = mood
    ? recipes.filter((r) => r.mood === mood)
    : recipes;

  // Fade-in for tip box
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setTipVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (tipRef.current) observer.observe(tipRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -my-5 sm:-my-12 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Hero Section with Image */}
        <section className="relative pt-8 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center mb-8">
              <div className="relative shrink-0 mx-auto">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-2 lg:-inset-4 bg-[#BC6C25]/20 rounded-[2rem] blur-xl" />
                  <div className="hidden lg:block absolute -inset-2 border-2 border-[#606C38]/30 dark:border-[#a3b18a]/30 rounded-[1.5rem] rotate-3" />

                  {/* Main Image */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/maesri-paste-weeknight-curry.jpg"
                      alt="Delicious vegan curry - beginner-friendly recipe"
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 256px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Decorative Label */}
                  <div className="absolute -top-4 sm:-top-5 lg:-top-6 -right-4 sm:-right-5 lg:-right-6 inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2 bg-[#606C38] dark:bg-[#606C38] rounded-full shadow-lg">
                    <Sparkles className="w-3 h-3 sm:w-3.5 lg:w-4 sm:h-3.5 lg:h-4 text-white" />
                    <span className="text-[9px] sm:text-[10px] lg:text-sm font-medium text-white tracking-wide whitespace-nowrap">
                      BEGINNER FRIENDLY
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div className="space-y-3 lg:space-y-4 min-w-0 flex-1 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.2] tracking-tight">
                  <span className="relative inline-block">
                    <span className="relative z-10">Start Here</span>
                    <span className="absolute bottom-2 left-0 right-0 h-4 bg-orange-400/30 -rotate-1"></span>
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl font-semibold text-[#BC6C25] dark:text-[#BC6C25] mb-3">
                  Let's Make Vegan Cooking Simple & Fun
                </p>

                <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl">
                  Budget-friendly, beginner-friendly vegan cooking awaits. Whether you're totally new to food or just want faster plant-based meals, you'll find simple recipes, grocery tips, and ideas to cook without stress.
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Callout Box */}
      <div className="relative p-6 bg-[#606C38]/5 dark:bg-white/5 rounded-2xl mb-12">
        <h2 className="text-lg sm:text-xl font-bold mb-2 uppercase tracking-wider text-[#606C38] dark:text-[#a3b18a]">
          <span className="relative inline-block">
            <span className="relative z-10">My Goal</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
          </span>
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Maximize flavor with as few steps as possible. Less chopping, fewer dishes, and meals that taste like you spent way more time than you actually did.
        </p>
      </div>

      {/* What You'll Find */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          <span className="relative inline-block">
            <span className="relative z-10">What You'll Find Here</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
          </span>
        </h2>
        <ul className="styled-list">
          <li>Cheap, quick, and simple vegan recipes 🌱</li>
          <li>Ingredients available at any grocery store 🛒</li>
          <li>Tips to help beginner cooks build confidence 💪</li>
          <li>Free guides to eat well on a budget 💰</li>
        </ul>
      </section>

      {/* Popular Recipes - Mood Buttons + Styled Cards */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          <span className="relative inline-block">
            <span className="relative z-10">Perfect First Recipes</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
          </span>
        </h2>

        {/* Mood Buttons right above recipes */}
        <div className="flex gap-3 mb-6">
          {["quick", "cozy", "adventurous"].map((m) => (
            <button
              key={m}
              onClick={() => setMood(m === mood ? null : m)}
              className={`px-4 py-2 rounded-full border transition transform hover:scale-105 hover:shadow-md ${
                mood === m
                  ? "bg-primary text-background animate-pulse"
                  : "bg-secondary/20 text-foreground/80 hover:bg-secondary/30"
              }`}
            >
              {m === "quick" ? "⚡ Quick" : m === "cozy" ? "🧣 Cozy" : "🌶️ Adventurous"}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.link}
              href={recipe.link}
              className="block p-4 bg-secondary/40 border border-secondary/50 rounded-xl hover:shadow-lg hover:bg-secondary/50 transition-transform transform hover:-translate-y-1"
            >
              <p className="font-semibold text-primary mb-1">{recipe.title}</p>
              <p className="text-foreground/80 text-sm">{recipe.subtitle}</p>
            </Link>
          ))}
        </div>
        <p className="text-foreground/70 text-sm mt-4">
          These recipes are beginner-friendly and crafted to make plant-based cooking easy and joyful.
        </p>
      </section>

      {/* Beginner Checklist */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          <span className="relative inline-block">
            <span className="relative z-10">Your Beginner Checklist ✅</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
          </span>
        </h2>
        <ul className="styled-list">
          {["Stock your pantry basics 🥫", "Try your first recipe 🍛", "Prep a batch of grains 🍚", "Experiment with 1 new veggie 🥬"].map((item) => (
            <li
              key={item}
              className="hover:bg-secondary/20 p-1 rounded transition"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Beginner Grocery List */}
      <section className="mb-14">
    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
      <span className="relative inline-block">
        <span className="relative z-10">The Complete Beginner Vegan Grocery List: Essential Plant-Based Staples</span>
        <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
      </span>
    </h2>
    <p className="text-foreground/80 mb-3">
        No huge pantry needed - start with these affordable beginner vegan staples, organized by store section, for cheap and quick meal prep:
    </p>

    {/* Using an outer list for the main categories */}
    <ul className="space-y-6">

        {/* 🍏 Produce & Fresh Items */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">🍏</span> Fresh Produce & Aromatics
            </h3>
            {/* H4 for subcategories is excellent for SEO/semantics */}
            <h4 className="font-bold text-base mt-2 ml-5 list-none">Aromatics:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🧄 Garlic (or bottled)</li>
                <li>🧅 Onion</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Veggies:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🌶️ Bell Peppers</li>
                <li>🥬 Spinach</li>
                <li>🥔 Potatoes</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Citrus & Herbs:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍋 Lemon juice and/or Lime juice</li>
                <li>🌿 Fresh Herbs (Cilantro, etc.)</li>
            </ul>
        </li>

        {/* 🧈 Refrigerated & Dairy Alternatives */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">🧈</span> Refrigerated Plant-Based Alternatives
            </h3>
            <h4 className="font-bold text-base mt-2 ml-5 list-none">Vegan Proteins:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>⬜ 4x Firm Tofu</li>
                <li>🍳 Mini box of Just Egg / Eggs from Plants</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Milks & Creams:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🥛 2x Oat Milk</li>
                <li>🥄 Vegan Yogurt (plain coconut)</li>
                <li>🧀 Vegan Cream Cheese (Myokos)</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Fats & Shredded Cheese:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🧈 Vegan Butter (Smart Balance/Earth Balance)</li>
                <li>🧀 Vegan Cheese (shredded mozzarella)</li>
            </ul>
        </li>

        {/* 🥫 Pantry Staples (Cans, Jars, Dry Goods, Oils) */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">🥫</span> Essential Pantry Staples
            </h3>
            <h4 className="font-bold text-base mt-2 ml-5 list-none">Cooking Oils:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🫒 Olive oil</li>
                <li>🥡 Sesame oil</li>
                <li>🥥 Coconut oil</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Cans & Jars:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍅 Canned Crushed Tomato (Tutto Rosso)</li>
                <li>🥥 Canned Coconut Milk</li>
                <li>🥒 Jar of Pickles</li>
                <li>🥫 Kidney Beans</li>
                <li>🥫 Refried Beans</li>
                <li>🌶️ Salsa</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Grains & Nut Butters:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍚 Basmati/Brown Rice</li>
                <li>🍝 Pasta noodles</li>
                <li>🥜 Natural peanut butter</li>
                <li>🥣 Tahini</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Flavor Boosters & Condiments:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍄 Nutritional Yeast</li>
                <li>Knorr Bouillon cubes</li>
                <li>🍶 Soy Sauce</li>
                <li>🍶 Mirin</li>
                <li>🧪 White Vinegar</li>
                <li>🌶️ Curry Paste</li>
                <li>🔥 Liquid Smoke</li>
                <li>🌰 Pistachios (ideally no shells)</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Snacks:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍟 Tortilla chips</li>
                <li>🍜 Vegan ramen</li>
                <li>🍿 Popcorn kernels</li>
            </ul>
        </li>

        {/* ✨ Baking & Flours */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">✨</span> Baking, Flours & Sweeteners
            </h3>
            <h4 className="font-bold text-base mt-2 ml-5 list-none">Flours & Binders:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🍞 All-purpose flour</li>
                <li>🥖 Bread flour</li>
                <li>🥄 Corn starch</li>
                <li>🥚 Ground flax seed</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Leavening:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🥄 Instant yeast or sourdough discard</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Sweeteners & Treats:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🥄 Sugar</li>
                <li>🍁 Maple Syrup</li>
                <li>🍫 Vegan chocolate chips</li>
            </ul>
        </li>

        {/* 🍞 Breads & Wraps */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">🍞</span> Breads, Bagels & Wraps
            </h3>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🥯 2 packs of Everything Bagels (1 can be frozen)</li>
                <li>🌮 Large Flour Tortillas</li>
                <li>🌮 Small Corn Tortillas</li>
            </ul>
        </li>

        {/* 🧂 Spices */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">🧂</span> Spices & Flavoring Agents
            </h3>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🧂 Salt</li>
                <li>🧂 Pepper</li>
                <li>💛 Turmeric</li>
                <li>🌶️ Cumin</li>
                <li>🧄 Garlic Powder</li>
                <li>🔥 Smoked Paprika</li>
                <li>🌿 Rosemary</li>
                <li>🌿 Basil</li>
            </ul>
        </li>

        {/* ❄️ Frozen Foods */}
        <li className="list-none">
            <h3 className="text-lg font-semibold mb-1 flex items-center">
                <span className="text-xl mr-2">❄️</span> Frozen Vegan Proteins & Meals
            </h3>
            <h4 className="font-bold text-base mt-2 ml-5 list-none">Bulk Proteins:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🚫🥩 4x Vegan Ground Beef (Morningstar/Gardein)</li>
                <li>🍔 2x Beyond Burger patties</li>
                <li>🌭 Vegan sausage</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Quick Meals:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🚫🐔 2x Vegan Chicken Strips</li>
                <li>🚫🐔 1x Large Vegan Chicken Nuggets</li>
                <li>🍕 3x Daiya pizzas</li>
            </ul>

            <h4 className="font-bold text-base mt-4 ml-5 list-none">Dessert:</h4>
            <ul className="ml-12 list-disc text-foreground/90 space-y-1">
                <li>🫐 2x Frozen Blueberries (plus small organic bag)</li>
            </ul>
        </li>
    </ul>
</section>

      {/* Tips Box with Fade-In (Reduced margin) */}
      <div
        ref={tipRef}
        className={`bg-secondary/30 border border-secondary/50 rounded-xl p-4 mb-8 transition-opacity duration-700 ${
          tipVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-foreground/80 text-sm">
          💡 Tip: Buy beans and lentils in bulk—they’re cheap, last forever, and make cooking stress-free!
        </p>
      </div>

      {/* Philosophy */}
      <section className="mb-14">
        <div className="relative p-6 bg-[#735d78]/10 dark:bg-white/5 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold mb-2 uppercase tracking-wider text-[#735d78] dark:text-[#735d78]">
            <span className="relative inline-block">
              <span className="relative z-10">My Cooking Philosophy</span>
              <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#735d78]/30 -rotate-1"></span>
            </span>
          </h2>
          <ul className="styled-list">
            <li>⚡ Simple ingredients can still provide a lot of flavor</li>
            <li>🍲 Use pantry staples across multiple meals</li>
            <li>😌 Taste throughout, no perfection needed</li>
          </ul>
        </div>
      </section>

      {/* Meal Prep */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          <span className="relative inline-block">
            <span className="relative z-10">Easy Meal Prep Formula</span>
            <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#606C38]/30 -rotate-1"></span>
          </span>
        </h2>
        <p className="text-foreground/80 mb-3">
          Feeling overwhelmed? Try this template:
        </p>
        <ol className="styled-list-ordered">
          <li>Pick 1 grain — rice, pasta, or quinoa</li>
          <li>Pick 1 protein — lentils, tofu, or beans</li>
          <li>Add 1-2 vegetables</li>
          <li>Finish with a simple sauce (pesto, tahini, soy garlic, etc.)</li>
        </ol>
      </section>

      {/* Contact */}
      <section className="mb-14">
        <div className="relative p-6 bg-[#BC6C25]/10 dark:bg-white/5 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-bold mb-2 uppercase tracking-wider text-[#BC6C25] dark:text-[#BC6C25]">
            <span className="relative inline-block">
              <span className="relative z-10">Have Questions?</span>
              <span className="absolute bottom-0 left-0 right-0 h-2 bg-[#BC6C25]/30 -rotate-1"></span>
            </span>
          </h2>
          <p className="text-base leading-relaxed text-foreground/80">
            I'm always happy to help. Email me anytime at{" "}
            <a
              href="mailto:cheapquickvegan@gmail.com"
              className="text-primary hover:underline"
            >
              cheapquickvegan@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <p className="text-foreground/60">
        Happy you're here — let's make vegan food cheap, quick, and delicious.
      </p>
    </main>
    </section>
  );
}
