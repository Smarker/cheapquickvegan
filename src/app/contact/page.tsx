"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

interface HerbConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: "basil" | "mint" | "parsley" | "rosemary";
  swayAmplitude: number;
  swaySpeed: number;
  fallSpeed: number;
  rotationSpeed: number;
}

// Floating leaf colors based on type
const herbColors: Record<HerbConfig["type"], string> = {
  basil: "text-green-700 dark:text-green-400",
  mint: "text-emerald-600 dark:text-emerald-400",
  parsley: "text-lime-700 dark:text-lime-400",
  rosemary: "text-teal-700 dark:text-teal-400",
};

export default function ContactPage() {
  const [herbs, setHerbs] = useState<HerbConfig[]>([]);
  const herbCount = 14;

  // Generate random floating herbs
  useEffect(() => {
    const types: HerbConfig["type"][] = ["basil", "mint", "parsley", "rosemary"];
    const generated = Array.from({ length: herbCount }).map((_, i) => ({
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

    setHerbs(generated);
  }, []);

  // Animate floating herbs
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      const t = performance.now() / 1000;
      const herbEls = document.querySelectorAll<HTMLElement>(".herb-floating");

      herbEls.forEach((el, idx) => {
        const herb = herbs[idx];
        if (!herb) return;

        const swayX = Math.sin(t * herb.swaySpeed + herb.id) * herb.swayAmplitude;
        const fallY = ((herb.y + herb.fallSpeed * t) % (window.innerHeight + 200)) - 100;
        const rotation = (herb.rotation + herb.rotationSpeed * t) % 360;

        el.style.transform = `translate(${swayX}px, ${fallY}px) rotate(${rotation}deg)`;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [herbs]);

  return (
    <section className="relative w-full min-h-screen bg-background flex justify-center overflow-hidden py-12">
      {/* Floating leaves */}
      {herbs.map((herb) => (
        <div
          key={herb.id}
          className="absolute herb-floating pointer-events-none"
          style={{
            left: `${herb.x}%`,
            width: `${herb.size}px`,
            opacity: 0.35,
          }}
        >
          <Leaf
            className={herbColors[herb.type]}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
        {/* Top icon */}
        <div className="bg-green-700/10 p-3 rounded-full mb-4">
          <Leaf
            className="text-green-700 dark:text-green-400"
            style={{ width: 36, height: 36 }}
          />
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
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
