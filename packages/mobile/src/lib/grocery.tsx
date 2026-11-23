import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { displayTitle, type Recipe } from './recipes';

const KEY = 'cqv:grocery:v1';

export type GroceryItem = { id: string; text: string; aisle: Aisle; recipeSlug: string; recipeTitle: string; checked: boolean };

export const AISLES = ['Produce', 'Fridge & freezer', 'Pantry', 'Spices & oils', 'Bakery', 'Other'] as const;
export type Aisle = (typeof AISLES)[number];

// First match wins, so oils and spices are checked before the broader pantry words.
const RULES: [Aisle, RegExp][] = [
  // Fresh peppers before the spice rule, which would otherwise take any line with "pepper" in it.
  ['Produce', /\b(bell peppers?|jalape[nñ]os?|poblanos?|serranos?|habaneros?)\b/i],
  ['Spices & oils', /\b(salt|pepper(corns)?|cumin|paprika|chili powder|cinnamon|nutmeg|oregano|basil|thyme|rosemary|turmeric|saffron|curry powder|garam masala|red pepper flakes|gochugaru|bay lea|cloves?|cardamom|vanilla|olive oil|sesame oil|coconut oil|vegetable oil|canola oil|avocado oil|oil|vinegar|everything (bagel )?seasoning|seasoning|spice)\b/i],
  ['Fridge & freezer', /\b(tofu|tempeh|plant[- ]?based milk|oat milk|soy milk|almond milk|vegan butter|butter|vegan cheese|cream cheese|yogurt|beyond|impossible|frozen|ice|miso|kimchi|hummus|tortillas?)\b/i],
  ['Produce', /\b(onions?|shallots?|garlic|ginger|scallions?|green onions?|leeks?|potato(es)?|sweet potato|carrots?|celery|peppers?|bell pepper|jalape[nñ]o|tomato(es)?|cucumbers?|zucchini|spinach|kale|lettuce|cabbage|broccoli|cauliflower|mushrooms?|corn|avocados?|lemons?|limes?|oranges?|apples?|bananas?|berries|blueberries|strawberries|cilantro|parsley|dill|mint|radish(es)?|artichokes?|peas|herbs?)\b/i],
  ['Bakery', /\b(bread|bagels?|buns?|pita|naan|phyllo|filo|pizza dough|dough)\b/i],
  ['Pantry', /\b(flour|sugar|maple|syrup|honey|agave|rice|pasta|noodles|ramen|oats|quinoa|beans|chickpeas|lentils|broth|stock|coconut milk|curry paste|soy sauce|tamari|gochujang|sriracha|hot sauce|ketchup|mustard|mayo|tahini|peanut butter|nut butter|almonds|cashews|walnuts|pecans|pistachios|nuts|seeds|dates|raisins|chocolate|cocoa|baking powder|baking soda|yeast|cornstarch|panko|breadcrumbs|nutritional yeast|canned|can|jar|biscoff|marshmallows?|crackers)\b/i],
];

export const aisleFor = (line: string): Aisle => RULES.find(([, re]) => re.test(line))?.[0] ?? 'Other';

/** Tap water isn't something you shop for. */
const isJustWater = (line: string) => /^[\d\s\/½¼¾⅓⅔.–-]*\s*(cups?|c|tbsp|tsp|ml|l|g)?\s*(of\s+)?(cold|warm|hot|boiling|lukewarm|room[- ]temperature)?\s*water\b(?!\s*chestnut)/i.test(line.trim());

type Grocery = {
  items: GroceryItem[];
  addRecipe: (r: Recipe) => number;
  hasRecipe: (slug: string) => boolean;
  toggle: (id: string) => void;
  removeRecipe: (slug: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  send: () => Promise<void>;
};

const Ctx = createContext<Grocery | null>(null);

/** The grocery list, kept on the phone. Sending shares plain text (good for Notes, Google Keep or a text to your partner). */
export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      // Re-sort on load, so fixes to the store-section rules reach lists already saved.
      .then((raw) => raw && setItems((JSON.parse(raw) as GroceryItem[]).map((i) => ({ ...i, aisle: aisleFor(i.text) }))))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  const addRecipe = useCallback((r: Recipe) => {
    const lines = r.ingredients.flatMap((g) => g.items).filter((l) => !isJustWater(l));
    setItems((prev) => {
      const have = new Set(prev.filter((i) => i.recipeSlug === r.slug).map((i) => i.text));
      const fresh = lines
        .filter((text) => !have.has(text))
        .map((text, n) => ({
          id: `${r.slug}:${Date.now()}:${n}`,
          text,
          aisle: aisleFor(text),
          recipeSlug: r.slug,
          recipeTitle: displayTitle(r),
          checked: false,
        }));
      return [...prev, ...fresh];
    });
    return lines.length;
  }, []);

  const value = useMemo<Grocery>(
    () => ({
      items,
      addRecipe,
      hasRecipe: (slug) => items.some((i) => i.recipeSlug === slug),
      toggle: (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))),
      removeRecipe: (slug) => setItems((prev) => prev.filter((i) => i.recipeSlug !== slug)),
      clearChecked: () => setItems((prev) => prev.filter((i) => !i.checked)),
      clearAll: () => setItems([]),
      send: async () => {
        const todo = items.filter((i) => !i.checked);
        const text = AISLES.map((a) => {
          const rows = todo.filter((i) => i.aisle === a);
          return rows.length ? `${a}\n${rows.map((i) => `☐ ${i.text}`).join('\n')}` : '';
        })
          .filter(Boolean)
          .join('\n\n');
        const recipesLine = [...new Set(todo.map((i) => i.recipeTitle))].join(', ');
        await Share.share({ title: 'Grocery list', message: `Grocery list for ${recipesLine}\n\n${text}` }).catch(() => {});
      },
    }),
    [items, addRecipe],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGrocery(): Grocery {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGrocery must be used inside GroceryProvider');
  return v;
}
