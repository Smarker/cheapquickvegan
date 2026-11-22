import { describe, it, expect } from "vitest";
import { parseRecipeContent } from "@/lib/recipe-parser";

// Mirrors the transformation applied in page.tsx when building recipeIngredient for JSON-LD
const toJsonLdIngredients = (ingredients: string[]) =>
  ingredients.map((ing) =>
    ing.replace(/^-+\s*/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  );

const INGREDIENTS_SECTION = `
## Ingredients
- 1 cup oat milk
- 6 plant-based egg roll wrappers ([Nasoya](https://www.walmart.com/ip/Nasoya))
- 2 tbsp [soy sauce](https://example.com/soy-sauce)
- Salt and pepper
`.trim();

describe("parseRecipeContent – ingredients", () => {
  it("parses plain ingredients", () => {
    const { ingredients } = parseRecipeContent(INGREDIENTS_SECTION);
    expect(ingredients).toContain("- 1 cup oat milk");
    expect(ingredients).toContain("- Salt and pepper");
  });

  it("preserves raw markdown links in parsed ingredients", () => {
    const { ingredients } = parseRecipeContent(INGREDIENTS_SECTION);
    expect(ingredients).toContain(
      "- 6 plant-based egg roll wrappers ([Nasoya](https://www.walmart.com/ip/Nasoya))"
    );
    expect(ingredients).toContain("- 2 tbsp [soy sauce](https://example.com/soy-sauce)");
  });
});

describe("toJsonLdIngredients – markdown link stripping", () => {
  it("strips leading dash from ingredients", () => {
    const result = toJsonLdIngredients(["- 1 cup oat milk"]);
    expect(result[0]).toBe("1 cup oat milk");
  });

  it("strips inline markdown link, keeping link text", () => {
    const result = toJsonLdIngredients([
      "- 6 plant-based egg roll wrappers ([Nasoya](https://www.walmart.com/ip/Nasoya))",
    ]);
    expect(result[0]).toBe("6 plant-based egg roll wrappers (Nasoya)");
  });

  it("strips standalone markdown link, keeping link text", () => {
    const result = toJsonLdIngredients(["- 2 tbsp [soy sauce](https://example.com/soy-sauce)"]);
    expect(result[0]).toBe("2 tbsp soy sauce");
  });

  it("leaves plain ingredients unchanged (besides dash)", () => {
    const result = toJsonLdIngredients(["- Salt and pepper"]);
    expect(result[0]).toBe("Salt and pepper");
  });

  it("strips multiple markdown links in one ingredient", () => {
    const result = toJsonLdIngredients([
      "- [Firm tofu](https://example.com/tofu) or [silken tofu](https://example.com/silken)",
    ]);
    expect(result[0]).toBe("Firm tofu or silken tofu");
  });
});
