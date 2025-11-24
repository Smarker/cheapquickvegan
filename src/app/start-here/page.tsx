"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold mb-4 text-foreground">
        Start Here
      </h1>
      <p className="text-lg text-foreground/70 leading-relaxed mb-6">
        Welcome to <span className="font-semibold text-foreground">CheapQuickVegan</span>!
        Budget-friendly, beginner-friendly vegan cooking awaits. Whether you're totally new to food or just want faster plant-based meals, you'll find simple recipes, grocery tips, and ideas to cook without stress.
      </p>

      {/* Callout Box */}
      <div className="bg-secondary/40 border border-secondary/60 rounded-xl p-5 mb-12">
        <p className="text-foreground/80 text-sm">
          My goal: <span className="font-medium">maximize flavor with as few steps as possible.</span>
          <br /><br />
          Less chopping, fewer dishes, and meals that taste like you spent way more time than you actually did.
        </p>
      </div>

      {/* What You'll Find */}
      <section className="mb-14">
        <h2 className="section-title">What You'll Find Here</h2>
        <ul className="styled-list">
          <li>Cheap, quick, and simple vegan recipes 🌱</li>
          <li>Ingredients available at any grocery store 🛒</li>
          <li>Tips to help beginner cooks build confidence 💪</li>
          <li>Free guides to eat well on a budget 💰</li>
        </ul>
      </section>

      {/* Popular Recipes - Mood Buttons + Styled Cards */}
      <section className="mb-14">
        <h2 className="section-title">Perfect First Recipes</h2>

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
        <h2 className="section-title">Your Beginner Checklist ✅</h2>
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
        <h2 className="section-title">Beginner Grocery List</h2>
        <p className="text-foreground/80 mb-3">
          No huge pantry needed — start with these affordable basics:
        </p>
        <ul className="styled-list">
          <li>🥬 Tofu, 🍝 pasta, 🍚 rice, lentils, canned beans</li>
          <li>🌱 Vegan chicken strips, vegan sausage, oat milk</li>
          <li>🥥 Coconut milk, veggie broth, tomato paste, curry paste</li>
          <li>🧄 Garlic, 🧅 onions, 🥔 potatoes, spinach, leeks</li>
          <li>🧂 Nutritional yeast, smoked paprika, turmeric</li>
          <li>🍶 Soy sauce, mirin, sesame oil, maple syrup</li>
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
        <h2 className="section-title">My Cooking Philosophy</h2>
        <ul className="styled-list">
          <li>⚡ Simple ingredients can still provide a lot of flavor</li>
          <li>🍲 Use pantry staples across multiple meals</li>
          <li>😌 Taste throughout, no perfection needed</li>
        </ul>
      </section>

      {/* Meal Prep */}
      <section className="mb-14">
        <h2 className="section-title">Easy Meal Prep Formula</h2>
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
        <h2 className="section-title">Have Questions?</h2>
        <p className="text-foreground/80">
          I'm always happy to help. Email me anytime at{" "}
          <a
            href="mailto:cheapquickvegan@gmail.com"
            className="text-primary hover:underline"
          >
            cheapquickvegan@gmail.com
          </a>
          .
        </p>
      </section>

      <p className="text-foreground/60 italic">
        Happy you're here — let's make vegan food cheap, quick, and delicious.
      </p>
    </main>
  );
}
