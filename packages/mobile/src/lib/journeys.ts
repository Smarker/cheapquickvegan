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

/** A part of the world on the trail map. Each area has a few hikes, graded as a whole. */
export type Area = {
  id: string;
  name: string;
  /** For small spaces: "Italy". */
  short: string;
  cuisines: string[];
  /** What's drawn on its island. */
  scenery: 'peaks' | 'terraces' | 'mesa' | 'andes';
};

export const AREAS: Area[] = [
  { id: 'italy', name: 'Italy & the Mediterranean', short: 'Italy', cuisines: ['Italian', 'Mediterranean', 'Spanish'], scenery: 'peaks' },
  { id: 'asia', name: 'Asia', short: 'Asia', cuisines: ['Asian', 'Thai', 'Japanese'], scenery: 'terraces' },
  { id: 'americas', name: 'American classics', short: 'American', cuisines: ['American'], scenery: 'mesa' },
  { id: 'latin', name: 'Latin America', short: 'Latin America', cuisines: ['Mexican', 'Tex-Mex', 'South American'], scenery: 'andes' },
];

/** One hike: an area's recipes at one grade. (Kept as "Region" so screens and saved progress keep working.) */
export type Region = {
  id: string;
  /** The area's id. */
  area: string;
  /** The area's name, shown above the hike's title. */
  name: string;
  trail: string;
  blurb: string;
  grade: Difficulty;
  cuisines: string[];
  guideSlugs: string[];
  /** Optional photo of the area for the finished-trail postcard. Defaults to the first travel guide's photo. */
  postcardPhoto?: string;
  /** The grades of recipe it holds, when a short neighbour was folded in. Defaults to [grade]. */
  grades?: Difficulty[];
  /** An area's only hike while it has too few recipes per grade: easy to hard in one trail. */
  mixed?: boolean;
};

/** "Easy", "Medium", "Hard", or "Easy to hard" for an area's single mixed hike. */
export const gradeLabel = (h: Region) => (h.mixed ? 'Easy to hard' : GRADE_LABEL[h.grade]);

export const GRADE_LABEL: Record<Difficulty, string> = { Easy: 'Easy', Medium: 'Medium', Challenge: 'Hard' };

const hike = (area: string, grade: Difficulty, id: string, trail: string, blurb: string, guideSlugs: string[] = []): Region => {
  const a = AREAS.find((x) => x.id === area)!;
  return { id, area, name: a.name, trail, blurb, grade, cuisines: a.cuisines, guideSlugs };
};

// Postcard photos: Italy and Asia are waiting on Stephanie's photos. Until then their postcards
// show a drawn placeholder scene; add `postcardPhoto: 'https://www.cheapquickvegan.com/images/…'` to a hike to swap one in.
export const REGIONS: Region[] = [
  hike('italy', 'Easy', 'italy-lakes', 'Stroll Lake Como', 'Quick, fresh starts: few ingredients and nothing fussy.'),
  hike('italy', 'Medium', 'italy-coast', 'Walk the Cinque Terre', 'A little more time at the stove, village by village.'),
  hike('italy', 'Challenge', 'italy-dolomites', 'Summit the Dolomites', 'Patient doughs and showpieces, for a slow weekend.'),
  hike('asia', 'Easy', 'asia-market', 'Wander a night market', 'Noodles and quick bowls to find your feet.'),
  hike('asia', 'Medium', 'asia-terraces', 'Walk the tea terraces', 'Stir-fries and crispy tofu, one terrace at a time.'),
  hike('asia', 'Challenge', 'asia-fuji', 'Climb Mount Fuji', 'Bigger cooks with more steps, worth the climb.'),
  hike('americas', 'Easy', 'americas-blueridge', 'Amble the Blue Ridge', 'Diner comfort food, made vegan and made easy.'),
  hike('americas', 'Medium', 'americas-appalachian', 'Ramble the Appalachian Trail', 'Weekend favourites with a few more moving parts.'),
  hike('americas', 'Challenge', 'americas-canyon', 'Hike the Grand Canyon', 'The big ones: long cooks and proud results.'),
  hike('latin', 'Easy', 'latin-cusco', 'Wander the streets of Cusco', 'Tacos and street corn, with my Cusco guide along the way.', ['cusco-peru-vegan-food']),
  hike('latin', 'Medium', 'latin-inca', 'Trek the Inca Trail', 'A steadier climb, resting in Ollantaytambo and Aguas Calientes.', ['ollantaytambo-vegan-food-travel-guide', 'aguas-calientes-vegan-food']),
  hike('latin', 'Challenge', 'latin-paine', 'Hike Torres del Paine', 'The hardest recipes, with my Patagonia day hikes for company.', ['vegan-torres-del-paine-day-hikes-and-meals']),
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

const areaRecipes = (cuisines: string[]) => recipes.filter((r) => r.cuisine != null && cuisines.includes(r.cuisine));

const ORDER: Difficulty[] = ['Easy', 'Medium', 'Challenge'];

/** Each of a hike's recipes with its grade, easier stretches first, easiest first within one. Grades are rated across the whole area. */
function gradedFor(region: Region, pinned?: string[]): { recipe: Recipe; grade: Difficulty }[] {
  const list = areaRecipes(region.cuisines);
  const rated = rateTrail(list);
  const grades = region.grades ?? [region.grade];
  // A hike the cook has started keeps exactly the stops it had then (minus any recipe since removed).
  const keep = pinned ? (r: Recipe) => pinned.includes(r.slug) : (r: Recipe) => grades.includes(rated.get(r.slug)!);
  return list
    .filter(keep)
    .map((recipe) => ({ recipe, grade: rated.get(recipe.slug)! }))
    .sort((x, y) => ORDER.indexOf(x.grade) - ORDER.indexOf(y.grade) || effort(x.recipe) - effort(y.recipe));
}

export function recipesFor(region: Region): Recipe[] {
  return gradedFor(region).map((x) => x.recipe);
}

/** A hike needs this many recipes to be a hike, so every summit means a few dinners, not one. */
export const MIN_STOPS = 3;

/**
 * The hikes to show. A grade with at least three recipes is its own hike; a shorter one folds into the
 * nearest real hike in its area (harder first). An area with no full grade but three recipes in all gets
 * one "easy to hard" hike, named after its medium trail. Fewer than three recipes: no hike yet.
 */
export function openHikes(): Region[] {
  const out: Region[] = [];
  for (const area of AREAS) {
    const hikes = REGIONS.filter((h) => h.area === area.id);
    const counts = new Map(hikes.map((h) => [h.grade, recipesFor(h).length]));
    const full = hikes.filter((h) => (counts.get(h.grade) ?? 0) >= MIN_STOPS);
    const short = hikes.filter((h) => !full.includes(h) && (counts.get(h.grade) ?? 0) > 0);
    if (full.length) {
      const grades = new Map(full.map((h) => [h.id, [h.grade] as Difficulty[]]));
      const guides = new Map(full.map((h) => [h.id, [...h.guideSlugs]]));
      for (const s of short) {
        const i = ORDER.indexOf(s.grade);
        const target = [...full].sort((a, b) => Math.abs(ORDER.indexOf(a.grade) - i) - Math.abs(ORDER.indexOf(b.grade) - i) || ORDER.indexOf(b.grade) - ORDER.indexOf(a.grade))[0];
        grades.get(target.id)!.push(s.grade);
        guides.get(target.id)!.push(...s.guideSlugs);
      }
      for (const h of full) out.push({ ...h, grades: grades.get(h.id)!.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)), guideSlugs: guides.get(h.id)! });
    } else if (short.reduce((n, h) => n + (counts.get(h.grade) ?? 0), 0) >= MIN_STOPS) {
      const flagship = hikes.find((h) => h.grade === 'Medium') ?? hikes[0];
      out.push({
        ...flagship,
        id: `${area.id}-trail`,
        grade: 'Medium',
        grades: short.map((h) => h.grade).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)),
        guideSlugs: hikes.flatMap((h) => h.guideSlugs),
        blurb: 'Easy to hard in one trail, while more recipes are on the way.',
        mixed: true,
      });
    }
  }
  return out;
}

/** A hike by id, including an area's mixed hike. */
export const hikeById = (id: string): Region | undefined =>
  openHikes().find((h) => h.id === id) ?? REGIONS.find((h) => h.id === id) ?? mixedHike(id);

/** An area's "easy to hard" hike by id, even after the area grew enough for separate hikes (a cook may have started it). */
function mixedHike(id: string): Region | undefined {
  const area = AREAS.find((a) => `${a.id}-trail` === id);
  if (!area) return undefined;
  const hikes = REGIONS.filter((h) => h.area === area.id);
  const flagship = hikes.find((h) => h.grade === 'Medium') ?? hikes[0];
  return { ...flagship, id, grade: 'Medium', grades: [...ORDER], guideSlugs: hikes.flatMap((h) => h.guideSlugs), mixed: true, blurb: 'Easy to hard in one trail.' };
}

/** Recipes added to a hike since the cook started it: optional side trips, never extra stops. */
export function sideTrips(region: Region, pinned?: string[]): Recipe[] {
  if (!pinned) return [];
  return recipesFor(region).filter((r) => !pinned.includes(r.slug));
}

/**
 * A hike: a rest stop at base camp (a technique lesson when its recipes need one, otherwise a
 * pantry stop), a signpost, then the recipes, easiest first. Travel guides are spread along the way.
 */
export function journey(region: Region, pinned?: string[]): Stop[] {
  const graded = gradedFor(region, pinned);
  const stops: Stop[] = [];
  const taught = new Set<string>();
  // One stretch per grade on the hike, each behind its own signpost.
  ORDER.forEach((grade) => {
    const items = graded.filter((x) => x.grade === grade).map((x) => x.recipe);
    if (!items.length) return;
    // Easy stretches start with a pantry stop; harder ones with a lesson in the technique they need, if any.
    const lesson = grade === 'Easy' ? undefined : items.flatMap(techniquesIn).find((t) => !taught.has(t.id));
    if (lesson) {
      taught.add(lesson.id);
      const guide = guideBySlug(lesson.guide);
      stops.push({ kind: 'lesson', title: lesson.title, body: guide ? guideIntro(guide) : lesson.body, guide });
    } else if (!stops.length) {
      const pantry = pantryFor(items);
      if (pantry.length > 1) stops.push({ kind: 'pantry', items: pantry, guide: guideBySlug(PANTRY_GUIDE) });
    }
    stops.push({ kind: 'section', difficulty: grade });
    items.forEach((recipe) => stops.push({ kind: 'recipe', recipe, difficulty: grade }));
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
  Easy: 'An easy stroll',
  Medium: 'A steady climb',
  Challenge: 'The summit climb',
};
