"use client";

import { ChefHat, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

interface JumpToRecipeProps {
  targetId?: string;
}

export function JumpToRecipe({ targetId = "ingredients" }: JumpToRecipeProps) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`
        sticky top-20 z-30 mb-6 transition-all duration-500 ease-out print:hidden opacity-100 translate-y-0"}
      `}
    >
      <button
        onClick={handleClick}
        className="
          group relative w-full sm:w-auto sm:mx-auto sm:flex
          overflow-hidden rounded-2xl
          bg-gradient-to-br from-[#a3b18a] via-[#8fa376] to-[#7d9161]
          hover:from-[#8fa376] hover:via-[#7d9161] hover:to-[#6d8152]
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-[#735d78] focus:ring-offset-2
        "
        aria-label="Jump to recipe ingredients and instructions"
      >
        {/* Animated background shine effect */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            -translate-x-full group-hover:translate-x-full
            transition-transform duration-1000 ease-out
          "
        />

        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3 px-6 py-2.5 sm:px-6">
          {/* Icon with bounce animation */}
          <ChefHat
            className="
              w-6 h-6 text-white/90
              group-hover:rotate-12 group-hover:scale-110
              transition-transform duration-300 ease-out
            "
            strokeWidth={1.5}
          />

          {/* Text */}
          <span className="text-md font-semibold text-white tracking-wide">
            Jump to Recipe
          </span>

          {/* Animated arrow */}
          <ArrowDown
            className="
              w-5 h-5 text-white/90
              group-hover:translate-y-1
              transition-transform duration-300 ease-out
              animate-bounce
            "
            strokeWidth={2.5}
          />
        </div>
      </button>
    </div>
  );
}
