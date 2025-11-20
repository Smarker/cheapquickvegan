"use client";

import { useEffect } from "react";
import { Leaf } from "lucide-react";

export interface HerbConfig {
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

const herbColors: Record<HerbConfig["type"], string> = {
  basil: "text-green-700 dark:text-green-400",
  mint: "text-emerald-600 dark:text-emerald-400",
  parsley: "text-lime-700 dark:text-lime-400",
  rosemary: "text-teal-700 dark:text-teal-400",
};

export default function FloatingHerbs({ herbs }: { herbs: HerbConfig[] }) {
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
    <>
      {herbs.map((herb) => (
        <div
          key={herb.id}
          className="absolute herb-floating pointer-events-none"
          style={{
            left: `${herb.x}%`,
            width: `${herb.size}px`,
            opacity: 0.35,
            transform: `translate(0px, ${herb.y}px) rotate(${herb.rotation}deg)` // SSR-safe initial
          }}
        >
          <Leaf
            className={herbColors[herb.type]}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ))}
    </>
  );
}
