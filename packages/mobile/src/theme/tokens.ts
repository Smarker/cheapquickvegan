import { useColorScheme } from 'react-native';

// Garden greens on warm sand paper, with ink line drawings. Greens sit well beside food photos
// (blues fight them). Sage fills buttons and selections; green is for hearts, the trail and icons;
// greenDeep is the only colored text (handwritten notes). Fills never carry small text.
const light = {
  ground: '#F7F3EA',
  mist: '#EDE7DA',
  ink: '#2B2A24',
  muted: '#59574C',
  green: '#5E8B4E',
  greenDeep: '#3A5E30',
  greenSoft: '#E3EDDA',
  accent: '#B7D3A0',
  tape: '#D9C49A',
  sand: '#EFE6D3',
  sage: '#B7D3A0',
  sageSoft: '#E6EFDF',
  hairline: 'rgba(43,42,36,0.10)',
  control: '#8E8A7B',
  photoFallback: '#EAE3D4',
  shadow: 'rgba(60,52,32,0.14)',
  tint: {
    Meal: '#E6EFDF',
    Side: '#ECEADF',
    Breakfast: '#F2E9D6',
    Snack: '#EFE9DD',
    Dessert: '#F1E6DA',
  } as Record<string, string>,
};

const dark: typeof light = {
  ground: '#191A16',
  mist: '#27281F',
  ink: '#EFECE2',
  muted: '#BAB6A8',
  green: '#8FC27A',
  greenDeep: '#B6DBA2',
  greenSoft: '#22301D',
  accent: '#9CC488',
  tape: '#BFA978',
  sand: '#2E2A20',
  sage: '#9CC488',
  sageSoft: '#21301F',
  hairline: 'rgba(239,236,226,0.12)',
  control: '#8A8676',
  photoFallback: '#2B2B24',
  shadow: 'rgba(0,0,0,0.5)',
  tint: {
    Meal: '#21301F',
    Side: '#272922',
    Breakfast: '#2E2A20',
    Snack: '#2A2822',
    Dessert: '#2E2622',
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
