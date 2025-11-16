"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

interface HerbConfig {
  id: number;
  left: number; // percentage
  size: number; // px
  rotation: number; // degrees
  type: "basil" | "mint" | "parsley" | "rosemary";
  windAmplitude: number; // max horizontal sway in px
  windSpeed: number; // sway speed multiplier
  fallSpeed: number; // vertical speed multiplier
  rotationSpeed: number; // deg/sec
}

export default function ContactPage() {
  const [herbs, setHerbs] = useState<HerbConfig[]>([]);
  const herbCount = 14;

  // Generate herb configs (client-side)
  useEffect(() => {
    const types: HerbConfig["type"][] = [
      "basil",
      "mint",
      "parsley",
      "rosemary",
    ];

    const generated: HerbConfig[] = Array.from({ length: herbCount }).map(
      (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 22 + Math.random() * 24,
        rotation: Math.random() * 360,
        type: types[Math.floor(Math.random() * types.length)],
        windAmplitude: 5 + Math.random() * 15,
        windSpeed: 0.5 + Math.random() * 0.8,
        fallSpeed: 0.5 + Math.random() * 1.0,
        rotationSpeed: 5 + Math.random() * 15,
      })
    );

    setHerbs(generated);
  }, []);

  // Animate herbs
  useEffect(() => {
    let animationFrame: number;

    const animateHerbs = () => {
      const herbEls = document.querySelectorAll<HTMLElement>(".herb-floating");
      const t = performance.now() / 1000;

      herbEls.forEach((el, idx) => {
        const herb = herbs[idx];
        if (!herb) return;

        const swayX = Math.sin(t * herb.windSpeed + herb.id) * herb.windAmplitude;

        // Vertical position as percentage for mobile safety
        const fallY = ((t * 10 * herb.fallSpeed + herb.id * 7) % 100); // 0-100%

        const rotation = (herb.rotation + t * herb.rotationSpeed) % 360;

        el.style.transform = `translate(${swayX}px, ${fallY}%) rotate(${rotation}deg)`;
      });

      animationFrame = requestAnimationFrame(animateHerbs);
    };

    animateHerbs();
    return () => cancelAnimationFrame(animationFrame);
  }, [herbs]);

  const herbColors: Record<HerbConfig["type"], string> = {
    basil: "text-green-700 dark:text-green-400",
    mint: "text-emerald-600 dark:text-emerald-400",
    parsley: "text-lime-700 dark:text-lime-400",
    rosemary: "text-teal-700 dark:text-teal-400",
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden py-20 bg-background flex justify-center">
      {/* Herb container */}
      <div className="absolute inset-0 pointer-events-none">
        {herbs.map((herb) => (
          <div
            key={herb.id}
            className="absolute herb-floating"
            style={{
              left: `${herb.left}%`,
              width: `${herb.size}px`,
              height: `${herb.size}px`,
              top: "-10%",
              opacity: 0.35,
            }}
          >
            <Leaf className={`${herbColors[herb.type]} w-full h-full`} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
        {/* Top Icon */}
        <div className="bg-green-700/10 p-4 rounded-full mb-6">
          <Leaf className="h-10 w-10 text-green-700 dark:text-green-400" />
        </div>

        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>

        <p className="text-foreground/70 mb-10">
          Whether you have questions about a recipe, ideas for new content, or
          just want to say hi — I'd love to hear from you. 🌱
        </p>

        <div className="w-full bg-secondary/40 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-secondary/20">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Leaf className="h-6 w-6 text-green-700 dark:text-green-400" />
            <a
              href="mailto:cheapquickvegan@gmail.com"
              className="text-lg font-medium text-green-700 dark:text-green-400 hover:underline"
            >
              cheapquickvegan@gmail.com
            </a>
          </div>

          <p className="text-sm text-foreground/60">
            I'll get back to you as soon as I can — thanks for supporting Cheap
            Quick Vegan!
          </p>
        </div>
      </div>
    </section>
  );
}
