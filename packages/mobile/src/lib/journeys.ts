import type { AppGuide } from '@cheapquickvegan/shared';
import guidesData from '../data/guides.json';
import { recipes, type Recipe } from './recipes';

export type Difficulty = 'Easy' | 'Medium' | 'Challenge';
export type Guide = AppGuide;

/** Guides. Starts as the bundled copy; DataProvider swaps in live data from the website in place. */
export const guides: Guide[] = [...(guidesData as Guide[])];

type Technique = {
  id: string;
  match: RegExp;
  title: string;
  /** Drafted lesson, used only when no guide covers this skill. Stephanie to rewrite. */
  body: string;
  /** One of Stephanie's guides that teaches this; its own opening becomes the lesson. */
  guide?: string;
  /** How much the technique adds to a recipe's effort. Air frying is a skill, not a hurdle. */
  weight?: number;
};

// Techniques worth a refugio lesson before the stretch that needs them.
const TECHNIQUES: Technique[] = [
  {
    id: 'dough',
    match: /\b(proof|knead|dough|sourdough|starter|rise)\b/i,
    title: 'Working with dough',
    guide: 'vegan-sourdough-recipes',
    body: "Dough is forgiving. If it's sticky, use wet hands instead of more flour. If it hasn't doubled yet, give it more time somewhere warm. The clock in a recipe is a guide; the dough decides.",
  },
  {
    id: 'tofu',
    match: /\b(press(ing)? (the )?tofu|firm tofu|extra[- ]firm)\b/i,
    title: 'Pressing tofu',
    body: 'Wrap the block in a clean towel and set something heavy on it, like a pan with a few cans, for 15 to 30 minutes. Less water means crispier tofu that soaks up sauce.',
  },
  {
    id: 'sugar',
    match: /\b(candy thermometer|soft ball|caramel|syrup to)\b/i,
    title: 'Cooking sugar',
    body: "Hot sugar goes from perfect to burnt fast, so stay at the stove and keep everything measured out before you start. A cheap candy thermometer takes the guessing away.",
  },
  {
    id: 'phyllo',
    match: /\bphyllo|filo\b/i,
    title: 'Handling phyllo',
    body: "Keep the sheets you aren't using under a damp towel so they don't dry out. Tears are fine; they disappear once the layers stack up.",
  },
  {
    id: 'frying',
    match: /\b(deep fry|shallow fry|fry (it|them) in|oil (is|until) (hot|shimmering))\b/i,
    title: 'Frying without fear',
    body: "Pat everything dry first, since water makes oil spit. Lay food in away from you, don't crowd the pan, and let it crisp before you move it.",
  },
  {
    id: 'blending',
    match: /\b(immersion blender|blend until smooth|puree)\b/i,
    title: 'Blending hot soup',
    body: "Let it cool a few minutes, and only fill a blender halfway with the lid cracked and a towel on top. An immersion blender skips all of that.",
  },
  {
    id: 'airfryer',
    match: /\bair[- ]?fr(y|yer|ied)\b/i,
    title: 'Air fryer basics',
    body: '',
    guide: 'vegan-air-fryer-recipes',
    weight: 0,
  },
];

const PANTRY_GUIDE = 'vegan-pantry-essentials';

/** The opening paragraph of a guide, in Stephanie's own words, for a rest-stop lesson. */
export function guideIntro(g: Guide): string {
  const para = g.content
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 60 && !/^[#\-*!>|]/.test(l));
  return (para ?? g.description).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
}

const guideBySlug = (slug?: string) => (slug ? guides.find((g) => g.slug === slug) : undefined);

const allText = (r: Recipe) => [...r.steps.flatMap((g) => g.items), ...r.ingredients.flatMap((g) => g.items)].join(' ');

export function techniquesIn(r: Recipe) {
  const text = allText(r);
  return TECHNIQUES.filter((t) => t.match.test(text));
}

const tagged = (r: Recipe): Difficulty | null =>
  r.difficulty === 'Easy' || r.difficulty === 'Medium' || r.difficulty === 'Challenge' ? r.difficulty : null;

/** How much effort a recipe takes: active time (waiting doesn't count past an hour), ingredients, steps and tricky techniques. */
function effort(r: Recipe): number {
  const minutes = Math.min(r.totalMinutes ?? 30, 60);
  const ingredients = r.ingredients.reduce((n, g) => n + g.items.length, 0);
  const steps = r.steps.reduce((n, g) => n + g.items.length, 0);
  return minutes / 30 + ingredients / 5 + steps / 4 + techniquesIn(r).reduce((n, t) => n + (t.weight ?? 2), 0);
}

/**
 * Difficulty within a trail. Stephanie's Notion tag wins; untagged recipes are ranked
 * by effort and split into thirds, so every trail has an easy start and a summit.
 */
function rateTrail(list: Recipe[]): Map<string, Difficulty> {
  const out = new Map<string, Difficulty>();
  const untagged = list.filter((r) => !tagged(r)).sort((a, b) => effort(a) - effort(b));
  untagged.forEach((r, i) => out.set(r.slug, i < untagged.length / 3 ? 'Easy' : i < (untagged.length * 2) / 3 ? 'Medium' : 'Challenge'));
  list.forEach((r) => tagged(r) && out.set(r.slug, tagged(r)!));
  return out;
}

export type Region = {
  id: string;
  name: string;
  trail: string;
  blurb: string;
  cuisines: string[];
  guideSlugs: string[];
};

export const REGIONS: Region[] = [
  {
    id: 'italy',
    name: 'Italy & the Mediterranean',
    trail: 'Hike the Dolomites',
    blurb: 'From a cool tzatziki to an overnight sourdough focaccia.',
    cuisines: ['Italian', 'Mediterranean', 'Spanish'],
    guideSlugs: [],
  },
  {
    id: 'asia',
    name: 'Asia',
    trail: 'Walk the tea terraces',
    blurb: 'Noodles, stir-fries and crispy tofu, one terrace at a time.',
    cuisines: ['Asian', 'Thai', 'Japanese'],
    guideSlugs: [],
  },
  {
    id: 'americas',
    name: 'American classics',
    trail: 'Ramble the Appalachian Trail',
    blurb: 'Diner comfort food, made vegan and made easy.',
    cuisines: ['American'],
    guideSlugs: [],
  },
  {
    id: 'latin',
    name: 'Latin America',
    trail: 'Trek the Inca Trail',
    blurb: 'Tacos and street corn, with my Peru and Patagonia guides as rest stops.',
    cuisines: ['Mexican', 'Tex-Mex', 'South American'],
    guideSlugs: ['cusco-peru-vegan-food', 'ollantaytambo-vegan-food-travel-guide', 'aguas-calientes-vegan-food', 'vegan-torres-del-paine-day-hikes-and-meals'],
  },
];

export type Stop =
  | { kind: 'section'; difficulty: Difficulty }
  | { kind: 'recipe'; recipe: Recipe; difficulty: Difficulty }
  | { kind: 'lesson'; title: string; body: string; guide?: Guide }
  | { kind: 'pantry'; items: string[]; guide?: Guide }
  | { kind: 'guide'; guide: Guide };

const PANTRY_WORDS = /\b(soy sauce|tamari|miso|gochujang|sesame oil|rice vinegar|coconut milk|curry paste|nutritional yeast|tahini|maple syrup|olive oil|balsamic|arborio|saffron|chickpeas|black beans|cumin|chili powder|smoked paprika|tortillas?|masa|lime|cornstarch|panko|oat milk|cashews|dates|peanut butter|vegetable broth|flour|yeast|sourdough discard)\b/gi;

/** The pantry staples a stretch of recipes shares, most-used first. */
function pantryFor(stretch: Recipe[]): string[] {
  const counts = new Map<string, number>();
  for (const r of stretch) {
    const seen = new Set((allText(r).match(PANTRY_WORDS) ?? []).map((w) => w.toLowerCase()));
    seen.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

export function recipesFor(region: Region): Recipe[] {
  return recipes.filter((r) => r.cuisine != null && region.cuisines.includes(r.cuisine));
}

/**
 * The trail, easy to hard. Each new stretch starts with a signpost and, after the first,
 * a rest stop: a technique lesson when the next recipes need one, otherwise a pantry stop.
 * Travel guides are spread evenly along the way.
 */
export function journey(region: Region): Stop[] {
  const list = recipesFor(region);
  const rated = rateTrail(list);
  const level = (r: Recipe) => rated.get(r.slug)!;
  const stretches = (['Easy', 'Medium', 'Challenge'] as Difficulty[])
    .map((d) => ({ d, items: list.filter((r) => level(r) === d).sort((a, b) => effort(a) - effort(b)) }))
    .filter((s) => s.items.length);

  const stops: Stop[] = [];
  const taught = new Set<string>();
  stretches.forEach(({ d, items }, si) => {
    if (si > 0) {
      const lesson = items.flatMap(techniquesIn).find((t) => !taught.has(t.id));
      if (lesson) {
        taught.add(lesson.id);
        const guide = guideBySlug(lesson.guide);
        stops.push({ kind: 'lesson', title: lesson.title, body: guide ? guideIntro(guide) : lesson.body, guide });
      }
      else {
        const pantry = pantryFor(items);
        if (pantry.length) stops.push({ kind: 'pantry', items: pantry, guide: guideBySlug(PANTRY_GUIDE) });
      }
    }
    stops.push({ kind: 'section', difficulty: d });
    items.forEach((recipe) => stops.push({ kind: 'recipe', recipe, difficulty: d }));
  });

  // Spread guides between recipes: after recipe #2, #4, … (never before the first recipe).
  const regionGuides = region.guideSlugs.map((s) => guides.find((g) => g.slug === s)).filter((g): g is Guide => !!g);
  let recipeCount = 0;
  let gi = 0;
  const withGuides: Stop[] = [];
  for (const stop of stops) {
    withGuides.push(stop);
    if (stop.kind === 'recipe') {
      recipeCount++;
      if (recipeCount % 2 === 0 && gi < regionGuides.length) withGuides.push({ kind: 'guide', guide: regionGuides[gi++] });
    }
  }
  while (gi < regionGuides.length) withGuides.push({ kind: 'guide', guide: regionGuides[gi++] });
  return withGuides;
}

export const STRETCH_LABEL: Record<Difficulty, string> = {
  Easy: 'The easy stretch',
  Medium: 'Getting steeper',
  Challenge: 'The summit climb',
};
