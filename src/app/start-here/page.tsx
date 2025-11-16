import Link from "next/link";

export default function StartHerePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold mb-4 text-foreground">
        Start Here
      </h1>
      <p className="text-lg text-foreground/70 leading-relaxed mb-10">
        Welcome to <span className="font-semibold text-foreground">CheapQuickVegan</span>!
        Here you will find budget-friendly, beginner-friendly vegan cooking. Whether you're totally
        new to making food or just want faster plant-based meals, you'll find simple recipes,
        grocery tips, and ideas to help you cook without stress.
      </p>

      {/* Callout Box */}
      <div className="bg-secondary/40 border border-secondary/60 rounded-xl p-5 mb-12">
        <p className="text-foreground/80 text-sm">
          My goal: <span className="font-medium">maximize flavor with as few steps as possible.</span>
          <br></br><br></br>
          Less chopping, fewer dishes, and meals that taste like you spent way more time prepping the food than you actually did.
        </p>
      </div>

      {/* What You'll Find */}
      <section className="mb-14">
        <h2 className="section-title">What You'll Find Here</h2>
        <ul className="styled-list">
          <li>Cheap, quick, and simple vegan recipes.</li>
          <li>Ingredients available at any grocery store.</li>
          <li>Tips to help beginner cooks build confidence.</li>
          <li>Free guides to help you eat well on a budget.</li>
        </ul>
      </section>

      {/* Popular Recipes - Styled Cards */}
        <section className="mb-14">
        <h2 className="section-title">Perfect First Recipes</h2>

        <div className="grid sm:grid-cols-2 gap-5">
            {[
            {
                title: "Vegan Coconut Red Curry",
                link: "/posts/vegan-coconut-red-curry",
                subtitle: "Creamy, fragrant, and easy for weeknights",
            },
            {
                title: "Spinach, Tofu & Sesame Stir-Fry",
                link: "/posts/vegan-spinach-tofu-and-sesame-stir-fry",
                subtitle: "Quick, nutrient-packed, and full of flavor",
            },
            {
                title: "Potato & Leek Soup",
                link: "/posts/vegan-potato-and-leek-soup",
                subtitle: "Warm, comforting, and budget-friendly",
            },
            {
                title: "Vegan Agadashi Tofu",
                link: "/posts/vegan-agadashi-tofu",
                subtitle: "Crispy tofu in a savory umami broth",
            },
            ].map((recipe) => (
            <Link
                key={recipe.link}
                href={recipe.link}
                className="block p-4 bg-secondary/40 border border-secondary/50 rounded-xl hover:shadow-lg hover:bg-secondary/50 transition"
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

      {/* Grocery List */}
      <section className="mb-14">
        <h2 className="section-title">Beginner Grocery List</h2>
        <p className="text-foreground/80 mb-3">
          No huge pantry needed — start with these affordable basics:
        </p>

        <ul className="styled-list">
          <li>Tofu, pasta, rice, lentils, canned beans</li>
          <li>Vegan chicken strips, vegan sausage, oat milk</li>
          <li>Coconut milk, veggie broth, tomato paste, curry paste</li>
          <li>Garlic, onions, potatoes, spinach, leeks</li>
          <li>Nutritional yeast, smoked paprika, turmeric</li>
          <li>Soy sauce, mirin, sesame oil, maple syrup</li>
        </ul>
      </section>

      {/* Philosophy */}
      <section className="mb-14">
        <h2 className="section-title">My Cooking Philosophy</h2>
        <ul className="styled-list">
          <li>Simple ingredients can still provide a lot of flavor.</li>
          <li>Use pantry staples across multiple meals.</li>
          <li>Taste throughout, no perfection needed.</li>
        </ul>
      </section>

      {/* Meal Prep */}
      <section className="mb-14">
        <h2 className="section-title">Easy Meal Prep Formula</h2>
        <p className="text-foreground/80 mb-3">
          If you're overwhelmed, try this template:
        </p>

        <ol className="styled-list-ordered">
          <li>Pick 1 grain — rice, pasta, or quinoa.</li>
          <li>Pick 1 protein — lentils, tofu, or beans.</li>
          <li>Add 1-2 vegetables.</li>
          <li>Finish with a simple sauce (pesto, tahini, soy garlic, etc.).</li>
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
