"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

interface HerbConfig {
  id: number;
  left: number;
  size: number;
  rotation: number;
  type: "basil" | "mint" | "parsley" | "rosemary";
  windAmplitude: number; // max horizontal sway
  windSpeed: number; // sway frequency
  fallSpeed: number; // vertical speed
  rotationSpeed: number; // deg per second
}

export default function ContactPage() {
  const [herbs, setHerbs] = useState<HerbConfig[]>([]);
  const herbCount = 14;

  // Generate herbs (client-side)
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

  // Animate herbs with wind gusts & falling
  useEffect(() => {
    let animationFrame: number;

    const animateHerbs = () => {
      const herbEls = document.querySelectorAll<HTMLElement>(".herb-floating");
      const t = performance.now() / 1000;

      herbEls.forEach((el, idx) => {
        const herb = herbs[idx];
        if (!herb) return;

        // horizontal sway: sinusoidal "wind gust"
        const swayX = Math.sin(t * herb.windSpeed + herb.id) * herb.windAmplitude;

        // vertical falling
        const fallY = ((t * 30 * herb.fallSpeed + herb.id * 10) % window.innerHeight) - 60;

        // rotation
        const rotation = (herb.rotation + t * herb.rotationSpeed) % 360;

        el.style.transform = `translate(${swayX}px, ${fallY}px) rotate(${rotation}deg)`;
      });

      animationFrame = requestAnimationFrame(animateHerbs);
    };

    animateHerbs();
    return () => cancelAnimationFrame(animationFrame);
  }, [herbs]);

  // Herb colors with dark/light mode
  const herbColors: Record<HerbConfig["type"], string> = {
    basil: "text-green-700 dark:text-green-400",
    mint: "text-emerald-600 dark:text-emerald-400",
    parsley: "text-lime-700 dark:text-lime-400",
    rosemary: "text-teal-700 dark:text-teal-400",
  };

  return (
    <section className="w-full flex justify-center relative overflow-hidden py-20 bg-background">
      {/* Floating Herbs */}
      {herbs.map((herb) => (
        <div
          key={herb.id}
          className="absolute pointer-events-none opacity-35 herb-floating"
          style={{
            left: `${herb.left}%`,
            width: `${herb.size}px`,
            height: `${herb.size}px`,
            top: "-60px",
          }}
        >
          <Leaf className={`${herbColors[herb.type]} w-full h-full`} />
        </div>
      ))}

      {/* Content */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto z-10 pointer-events-auto">
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
