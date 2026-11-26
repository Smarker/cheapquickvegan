import { useColorScheme } from 'react-native';

// TRIAL: "Garden & Harvest". Olive greens on oat cookbook paper. Each warm color has one job:
// harvest marks the trail (signposts, tape, the meal scribble); terracotta is what's yours (the saved
// heart). Sage fills buttons and selections; olive is
// for the trail and icons; deep olive (greenDeep) is the only colored text. Terracotta and harvest only
// ever fill shapes: they're too light for small text. Fills never carry small text.
const light = {
  ground: '#F4EBDD',
  mist: '#EBE1D0',
  ink: '#2E2E2E',
  muted: '#57564C',
  green: '#606C38',
  greenDeep: '#566230', // a shade under olive, so colored text reads green and clears 4.5:1 on every panel
  greenSoft: '#E7EBD7',
  accent: '#A3B18A',
  tape: '#DDA15E',
  sand: '#E8DCC8',
  sage: '#A3B18A',
  sageSoft: '#EAEEDB',
  heart: '#BC6C25',
  harvest: '#DDA15E',
  // Relief map land, lowland to snowy peak (contour levels 0 to 6). The sea is mist; shelf is the shallows.
  relief: ['#E3E7CC', '#D5DCB1', '#DCD9AE', '#E1CEA2', '#D5B98E', '#C6A57E', '#F6F1E6'],
  shelf: '#F2EADD',
  // Cairn stones: warm field-stone greys, so a stack reads as rock, not as cards.
  stone: ['#CBC3B3', '#B8B0A0', '#D8D1C3'],
  hairline: 'rgba(46,46,46,0.10)',
  control: '#8E8A7B',
  photoFallback: '#EAE0CE',
  shadow: 'rgba(60,52,32,0.14)',
  tint: {
    Meal: '#EAEEDB',
    Side: '#E9E7D3',
    Breakfast: '#EEDFC4',
    Snack: '#EAE0CE',
    Dessert: '#F1DFCE',
  } as Record<string, string>,
};

const dark: typeof light = {
  ground: '#1A1C14',
  mist: '#26291D',
  ink: '#F4EFE0',
  muted: '#BDB8A6',
  green: '#A3B18A',
  greenDeep: '#C9D4A8',
  greenSoft: '#252C1A',
  accent: '#A3B18A',
  tape: '#C08A4C',
  sand: '#2C2920',
  sage: '#A3B18A',
  sageSoft: '#232A1B',
  heart: '#D98A45',
  harvest: '#C08A4C',
  relief: ['#313626', '#384027', '#3F4128', '#48422B', '#52472E', '#5E4F34', '#7C7462'],
  shelf: '#2D3022',
  stone: ['#77705F', '#686252', '#837C6B'],
  hairline: 'rgba(244,239,224,0.12)',
  control: '#8A8676',
  photoFallback: '#2B2B22',
  shadow: 'rgba(0,0,0,0.5)',
  tint: {
    Meal: '#232A1B',
    Side: '#28271F',
    Breakfast: '#2E291E',
    Snack: '#2A2820',
    Dessert: '#30261F',
  },
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const tintFor = (p: Palette, category: string | null) => p.tint[category ?? 'Meal'] ?? p.tint.Meal;

export const font = {
  serif: 'SourceSerif4_700Bold',
  serifLight: 'SourceSerif4_300Light',
  hand: 'GochiHand_400Regular',
  sans: 'Rubik_400Regular',
  sansMedium: 'Rubik_500Medium',
  sansBold: 'Rubik_600SemiBold',
};

export const type = {
  display: { fontFamily: font.serifLight, fontSize: 40, lineHeight: 46, letterSpacing: -0.6 },
  title: { fontFamily: font.serif, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  cardTitle: { fontFamily: font.serif, fontSize: 21, lineHeight: 25, letterSpacing: -0.2 },
  rowTitle: { fontFamily: font.serif, fontSize: 17, lineHeight: 21 },
  section: { fontFamily: font.serif, fontSize: 22, lineHeight: 27, letterSpacing: -0.2 },
  body: { fontFamily: font.sans, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: font.sans, fontSize: 14, lineHeight: 20 },
  caps: { fontFamily: font.sansMedium, fontSize: 13, lineHeight: 16, letterSpacing: 1.1 },
  label: { fontFamily: font.sansMedium, fontSize: 14, lineHeight: 18 },
  /** Handwriting for the human moments: greetings, notes, loading lines. Never for instructions. */
  hand: { fontFamily: font.hand, fontSize: 20, lineHeight: 24 },
};

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

/** Soft, offset drop shadow for floating photos and cards. */
export const lift = (p: Palette) => ({ boxShadow: `0px 10px 22px -12px ${p.shadow}` });

// Press feedback: a quick spring with a small overshoot.
export const spring = { damping: 12, stiffness: 220, mass: 0.8 };
// Settling motion (highlights, layout): no visible overshoot.
export const glide = { damping: 20, stiffness: 240, mass: 0.9 };
