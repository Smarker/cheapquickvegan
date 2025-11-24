import FloatingHerbs, { HerbConfig } from "@/components/floating-herbs";
import { Leaf } from "lucide-react";

export default function ContactPage() {
  const herbCount = 14;

  // Server-generate initial leaf positions (prevents layout shift)
  const types: HerbConfig["type"][] = ["basil", "mint", "parsley", "rosemary"];

  const herbs: HerbConfig[] = Array.from({ length: herbCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -60 - Math.random() * 150,
    size: 24 + Math.random() * 36,
    rotation: Math.random() * 360,
    type: types[Math.floor(Math.random() * types.length)],
    swayAmplitude: 5 + Math.random() * 15,
    swaySpeed: 0.5 + Math.random() * 0.8,
    fallSpeed: 20 + Math.random() * 40,
    rotationSpeed: 20 + Math.random() * 50,
  }));

  return (
    <section className="relative w-full min-h-screen bg-background flex justify-center overflow-hidden py-12">

      {/* Floating herbs (client-only) */}
      <FloatingHerbs herbs={herbs} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">

        {/* Top icon */}
        <div className="bg-green-700/10 p-3 rounded-full mb-4">
          <Leaf
            className="text-green-700 dark:text-green-400"
            style={{ width: 36, height: 36 }}
          />
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Contact Me</h1>
        <p className="text-foreground/70 mb-6">
          Whether you have questions about a recipe, ideas for new content, or just want to say hi — I'd love to hear from you. 🌱
        </p>

        {/* Contact card */}
        <div className="w-full max-w-md bg-secondary/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-secondary/20 mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-3">Get in Touch</h2>
          <div className="flex flex-col items-center gap-2 mb-4">
            <Leaf
              className="text-green-700 dark:text-green-400"
              style={{ width: 24, height: 24 }}
            />
            <a
              href="mailto:cheapquickvegan@gmail.com"
              className="text-lg font-medium text-green-700 dark:text-green-400 hover:underline"
            >
              cheapquickvegan@gmail.com
            </a>
          </div>
          <p className="text-sm text-foreground/60">
            I'll get back to you as soon as I can — thanks for supporting Cheap Quick Vegan!
          </p>
        </div>
      </div>
    </section>
  );
}
