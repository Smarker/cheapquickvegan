import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { artFor, type Art } from '../lib/ingredientArt';

// Little ink drawings for ingredients, same hand as Doodles.tsx and GearDoodles.tsx.
// Stand-ins until Stephanie's own drawings replace them; each is one 32×32 sketch in a single ink colour.
type D = (c: string) => ReactNode;
const k = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const thin = { ...k, strokeWidth: 1.4 };

const DRAWINGS: Record<Art, D> = {
  oil: (c) => (
    <>
      <Path d="M13 4 H19 V8 L22 13 V27 C22 28 10 28 10 27 V13 L13 8 Z" stroke={c} {...k} />
      <Path d="M13 8 H19" stroke={c} {...k} />
      <Path d="M16 17 C14 20 14 22 16 23 C18 22 18 20 16 17 Z" stroke={c} {...thin} />
    </>
  ),
  salt: (c) => (
    <>
      <Path d="M11 13 C11 7 21 7 21 13 L22 27 C22 28 10 28 10 27 Z" stroke={c} {...k} />
      <Path d="M11 13 H21" stroke={c} {...k} />
      <Path d="M14 10 V10.1 M16 9 V9.1 M18 10 V10.1" stroke={c} {...k} strokeWidth={2.2} />
      <Path d="M14 19 H18" stroke={c} {...thin} />
    </>
  ),
  pepper: (c) => (
    <>
      <Path d="M14 4 H18 L19 8 H13 Z" stroke={c} {...k} />
      <Path d="M12 8 H20 L19 14 C21 16 21 25 20 27 C20 28 12 28 12 27 C11 25 11 16 13 14 Z" stroke={c} {...k} />
      <Circle cx="16" cy="21" r="0.8" stroke={c} {...k} />
      <Circle cx="14" cy="18" r="0.6" stroke={c} {...thin} />
    </>
  ),
  spice: (c) => (
    <>
      <Rect x="10" y="9" width="12" height="18" rx="2.5" stroke={c} {...k} />
      <Path d="M11 5 H21 V9 H11 Z" stroke={c} {...k} />
      <Path d="M13 16 H19 V21 H13 Z" stroke={c} {...thin} />
      <Path d="M13 7 V7.1 M16 7 V7.1 M19 7 V7.1" stroke={c} {...k} strokeWidth={2} />
    </>
  ),
  flour: (c) => (
    <>
      <Path d="M9 10 L11 7 L13 9 L16 6 L19 9 L21 7 L23 10 L24 27 C24 28 8 28 8 27 Z" stroke={c} {...k} />
      <Path d="M13 17 C15 14 17 14 19 17 C17 20 15 20 13 17 Z M16 16 V22" stroke={c} {...thin} />
    </>
  ),
  sugar: (c) => (
    <>
      <Path d="M8 14 L16 10 L24 14 L16 18 Z" stroke={c} {...k} />
      <Path d="M8 14 V22 L16 26 L24 22 V14 M16 18 V26" stroke={c} {...k} />
      <Path d="M22 7 L23 9 M25 8 L24 10" stroke={c} {...thin} />
    </>
  ),
  rice: (c) => (
    <>
      <Path d="M5 16 H27 C27 23 22 27 16 27 C10 27 5 23 5 16 Z" stroke={c} {...k} />
      <Path d="M8 16 C9 11 13 9 16 9 C19 9 23 11 24 16" stroke={c} {...k} />
      <Path d="M12 12 L13 13 M16 11 L17 12 M19 13 L20 12 M14 14 L15 15" stroke={c} {...thin} />
    </>
  ),
  cornstarch: (c) => (
    <>
      <Path d="M9 9 L13 5 H25 L21 9 Z" stroke={c} {...k} />
      <Rect x="9" y="9" width="12" height="18" stroke={c} {...k} />
      <Path d="M21 9 L25 5 V23 L21 27" stroke={c} {...k} />
      <Ellipse cx="15" cy="18" rx="3" ry="4" stroke={c} {...thin} />
    </>
  ),
  yeast: (c) => (
    <>
      <Path d="M10 9 C10 6 22 6 22 9 V26 C22 28 10 28 10 26 Z" stroke={c} {...k} />
      <Path d="M10 12 H22" stroke={c} {...k} />
      <Circle cx="15" cy="19" r="2" stroke={c} {...thin} />
      <Circle cx="18.5" cy="22" r="1.2" stroke={c} {...thin} />
    </>
  ),
  broth: (c) => (
    <>
      <Path d="M10 10 L13 5 H19 L22 10 V27 H10 Z" stroke={c} {...k} />
      <Path d="M10 10 H22 M17 5 V3 H20" stroke={c} {...k} />
      <Path d="M13 19 C15 17 17 21 19 19 M13 23 C15 21 17 25 19 23" stroke={c} {...thin} />
    </>
  ),
  vinegar: (c) => (
    <>
      <Path d="M14 3 H18 V9 C22 11 22 13 22 16 V27 C22 28 10 28 10 27 V16 C10 13 10 11 14 9 Z" stroke={c} {...k} />
      <Path d="M12 18 H20 V24 H12 Z" stroke={c} {...thin} />
    </>
  ),
  syrup: (c) => (
    <>
      <Path d="M13 4 H17 V8 C23 9 24 14 24 18 V27 C24 28 8 28 8 27 V18 C8 13 10 9 13 8 Z" stroke={c} {...k} />
      <Path d="M17 10 C21 10 21 15 18 15" stroke={c} {...k} />
      <Path d="M16 18 L16 25 M13 21 L16 23 L19 21 M14 19 L16 20 L18 19" stroke={c} {...thin} />
    </>
  ),
  soySauce: (c) => (
    <>
      <Path d="M13 5 H19 V8 H13 Z" stroke={c} {...k} />
      <Path d="M14 8 L13 12 C10 14 10 17 10 20 V27 C10 28 22 28 22 27 V20 C22 17 22 14 19 12 L18 8" stroke={c} {...k} />
      <Path d="M19 6 L23 4" stroke={c} {...k} />
      <Rect x="13" y="18" width="6" height="6" rx="1" stroke={c} {...thin} />
    </>
  ),
  vanilla: (c) => (
    <>
      <Path d="M6 26 C12 20 18 12 26 5" stroke={c} {...k} />
      <Path d="M8 27 C14 21 20 13 27 7" stroke={c} {...k} />
      <Path d="M12 21 L13 22 M16 17 L17 18 M20 13 L21 14" stroke={c} {...thin} />
      <Path d="M24 22 C22 18 26 16 27 19 C28 22 26 25 24 22 Z" stroke={c} {...thin} />
    </>
  ),
  sauce: (c) => (
    <>
      <Path d="M10 9 H22 V12 C23 13 23 14 23 16 V26 C23 28 9 28 9 26 V16 C9 14 9 13 10 12 Z" stroke={c} {...k} />
      <Path d="M10 12 H22" stroke={c} {...k} />
      <Path d="M12 19 C14 17 18 21 20 19" stroke={c} {...thin} />
      <Path d="M11 5 H21 V9 H11 Z" stroke={c} {...k} />
    </>
  ),
  milk: (c) => (
    <>
      <Path d="M10 11 L13 5 H19 L22 11 V27 H10 Z" stroke={c} {...k} />
      <Path d="M10 11 H22 M13 5 L16 11 L19 5" stroke={c} {...k} />
      <Path d="M14 17 C14 21 18 21 18 17 C18 15 16 14 16 14 C16 14 14 15 14 17 Z" stroke={c} {...thin} />
    </>
  ),
  yogurt: (c) => (
    <>
      <Path d="M8 11 H24 L22 26 C22 27 10 27 10 26 Z" stroke={c} {...k} />
      <Path d="M7 9 H25 V11 H7 Z" stroke={c} {...k} />
      <Path d="M12 7 C14 4 17 5 18 7" stroke={c} {...thin} />
      <Path d="M13 17 C15 15 17 19 19 17" stroke={c} {...thin} />
    </>
  ),
  butter: (c) => (
    <>
      <Path d="M5 17 L12 12 H27 L20 17 Z" stroke={c} {...k} />
      <Path d="M5 17 V23 H20 V17 M20 23 L27 18 V12" stroke={c} {...k} />
      <Path d="M8 9 C10 7 11 9 13 8" stroke={c} {...thin} />
      <Path d="M11 20 H16" stroke={c} {...thin} />
    </>
  ),
  coconut: (c) => (
    <>
      <Path d="M5 17 H27 C27 23 22 27 16 27 C10 27 5 23 5 17 Z" stroke={c} {...k} />
      <Path d="M8 17 C8 13 24 13 24 17" stroke={c} {...thin} />
      <Path d="M9 21 L10 22 M14 24 L15 23 M21 22 L22 21" stroke={c} {...thin} />
      <Path d="M18 7 C21 5 24 7 24 10 M18 7 C15 5 12 7 12 9" stroke={c} {...thin} />
    </>
  ),
  noodles: (c) => (
    <>
      <Path d="M4 16 H28 C28 23 23 27 16 27 C9 27 4 23 4 16 Z" stroke={c} {...k} />
      <Path d="M9 16 C9 12 12 14 12 10 C12 14 15 12 15 16 C15 12 18 14 18 10 C18 14 21 12 21 16" stroke={c} {...thin} />
      <Path d="M22 4 L17 15 M26 6 L19 15" stroke={c} {...k} />
    </>
  ),
  bellPepper: (c) => (
    <>
      <Path d="M16 9 C11 7 7 10 7 16 C7 23 11 27 14 26 C15 25 17 25 18 26 C21 27 25 23 25 16 C25 10 21 7 16 9 Z" stroke={c} {...k} />
      <Path d="M16 9 C16 6 17 4 20 4" stroke={c} {...k} />
      <Path d="M16 12 C14 16 14 21 15 24" stroke={c} {...thin} />
    </>
  ),
  scallion: (c) => (
    <>
      <Path d="M12 27 C11 25 12 23 14 22 V5 M18 27 C19 25 18 23 16 22 V7" stroke={c} {...k} />
      <Path d="M14 12 C12 9 10 6 9 4 M16 12 C18 8 21 5 23 4" stroke={c} {...k} />
      <Path d="M12 27 C13 26 17 26 18 27 M13 27 C12 28 12 29 11 30 M15 27 C15 28 15 29 15 30 M17 27 C18 28 19 29 19 30" stroke={c} {...thin} />
    </>
  ),
  onion: (c) => (
    <>
      <Path d="M16 6 C12 10 6 13 6 19 C6 24 10 27 16 27 C22 27 26 24 26 19 C26 13 20 10 16 6 Z" stroke={c} {...k} />
      <Path d="M16 6 C16 4 15 3 14 2 M16 6 C17 4 18 3 19 3" stroke={c} {...thin} />
      <Path d="M16 9 C13 13 11 16 11 20 C11 24 13 26 16 27 M16 9 C19 13 21 16 21 20 C21 24 19 26 16 27" stroke={c} {...thin} />
      <Path d="M14 28 L13 30 M16 28 V30 M18 28 L19 30" stroke={c} {...thin} />
    </>
  ),
  garlic: (c) => (
    <>
      <Path d="M16 6 C13 10 7 13 7 19 C7 24 11 27 16 27 C21 27 25 24 25 19 C25 13 19 10 16 6 Z" stroke={c} {...k} />
      <Path d="M16 6 C15 4 16 3 17 2" stroke={c} {...k} />
      <Path d="M16 10 C13 15 12 20 13 26 M16 10 C19 15 20 20 19 26 M11 14 C9 18 9 23 11 26 M21 14 C23 18 23 23 21 26" stroke={c} {...thin} />
    </>
  ),
  ginger: (c) => (
    <>
      <Path d="M6 19 C5 15 9 13 12 15 C13 11 17 10 18 13 C20 9 25 10 25 14 C28 16 27 21 24 22 C22 25 17 25 15 23 C12 25 7 23 6 19 Z" stroke={c} {...k} />
      <Path d="M11 18 C12 19 13 19 14 18 M19 16 L20 17 M21 20 L22 20" stroke={c} {...thin} />
    </>
  ),
  greens: (c) => (
    <>
      <Path d="M16 27 C9 24 6 17 8 8 C14 8 19 12 20 18 C20 22 18 25 16 27 Z" stroke={c} {...k} />
      <Path d="M16 27 C13 21 12 15 10 11 M12 18 L9 17 M14 22 L11 22 M13 14 L15 12" stroke={c} {...thin} />
      <Path d="M20 20 C22 15 25 12 27 10 C28 16 26 22 21 24" stroke={c} {...k} />
    </>
  ),
  herbs: (c) => (
    <>
      <Path d="M16 28 V8" stroke={c} {...k} />
      <Path d="M16 10 C13 8 12 5 13 3 C16 4 17 7 16 10 Z M16 15 C12 14 10 11 10 9 C13 9 16 11 16 15 Z M16 15 C20 14 22 11 22 9 C19 9 16 11 16 15 Z M16 21 C12 20 9 18 9 15 C12 15 16 17 16 21 Z M16 21 C20 20 23 18 23 15 C20 15 16 17 16 21 Z" stroke={c} {...thin} />
    </>
  ),
  citrus: (c) => (
    <>
      <Circle cx="16" cy="17" r="10" stroke={c} {...k} />
      <Circle cx="16" cy="17" r="7" stroke={c} {...thin} />
      <Path d="M16 10 V24 M9 17 H23 M11 12 L21 22 M21 12 L11 22" stroke={c} {...thin} />
    </>
  ),
  potato: (c) => (
    <>
      <Path d="M7 18 C6 12 11 8 17 8 C23 8 27 12 26 18 C25 24 20 26 15 26 C10 26 7 23 7 18 Z" stroke={c} {...k} />
      <Path d="M12 14 L13 15 M19 13 L20 14 M16 20 L17 20 M22 19 L22 20 M11 21 L12 21" stroke={c} {...k} strokeWidth={1.6} />
    </>
  ),
  mushroom: (c) => (
    <>
      <Path d="M5 16 C5 9 10 5 16 5 C22 5 27 9 27 16 Z" stroke={c} {...k} />
      <Path d="M12 16 L11 25 C11 27 21 27 21 25 L20 16" stroke={c} {...k} />
      <Circle cx="12" cy="11" r="1.4" stroke={c} {...thin} />
      <Circle cx="20" cy="10" r="1" stroke={c} {...thin} />
    </>
  ),
  tomato: (c) => (
    <>
      <Path d="M16 10 C9 10 5 14 5 19 C5 24 10 27 16 27 C22 27 27 24 27 19 C27 14 23 10 16 10 Z" stroke={c} {...k} />
      <Path d="M16 10 L13 7 M16 10 L19 7 M16 10 L11 11 M16 10 L21 11 M16 10 V6" stroke={c} {...k} />
      <Path d="M9 18 C9 16 10 15 11 14" stroke={c} {...thin} />
    </>
  ),
  carrot: (c) => (
    <>
      <Path d="M20 9 C23 12 22 15 20 17 L8 27 C7 28 6 27 7 26 L15 12 C16 10 18 8 20 9 Z" stroke={c} {...k} />
      <Path d="M21 9 C22 6 25 4 27 4 M21 9 C24 9 27 10 28 12 M20 8 C20 5 21 3 22 2" stroke={c} {...k} />
      <Path d="M13 17 L15 18 M11 21 L13 22" stroke={c} {...thin} />
    </>
  ),
  avocado: (c) => (
    <>
      <Path d="M16 4 C12 4 11 9 10 13 C7 16 6 19 6 21 C6 25 10 28 16 28 C22 28 26 25 26 21 C26 19 25 16 22 13 C21 9 20 4 16 4 Z" stroke={c} {...k} />
      <Circle cx="16" cy="20" r="4.5" stroke={c} {...k} />
    </>
  ),
  tofu: (c) => (
    <>
      <Path d="M5 13 L12 8 H27 L20 13 Z" stroke={c} {...k} />
      <Path d="M5 13 V25 H20 V13 M20 25 L27 20 V8" stroke={c} {...k} />
      <Path d="M12 13 V25 M5 19 H20" stroke={c} {...thin} />
    </>
  ),
  beans: (c) => (
    <>
      <Circle cx="11" cy="13" r="4.5" stroke={c} {...k} />
      <Circle cx="21" cy="12" r="4" stroke={c} {...k} />
      <Circle cx="16" cy="21" r="5" stroke={c} {...k} />
      <Path d="M9 12 C10 11 11 11 12 12 M15 20 C16 19 17 19 18 20" stroke={c} {...thin} />
    </>
  ),
  nuts: (c) => (
    <>
      <Path d="M10 8 C6 11 5 18 9 23 C13 27 20 27 24 23 C25 22 24 20 22 20 C17 21 13 18 13 13 C13 10 12 7 10 8 Z" stroke={c} {...k} />
      <Path d="M11 13 C11 18 15 22 20 23" stroke={c} {...thin} />
    </>
  ),
  dates: (c) => (
    <>
      <Ellipse cx="12" cy="17" rx="5" ry="9" stroke={c} {...k} transform="rotate(-20 12 17)" />
      <Ellipse cx="21" cy="17" rx="5" ry="9" stroke={c} {...k} transform="rotate(15 21 17)" />
      <Path d="M10 13 C11 16 11 19 10 22 M20 13 C22 16 22 19 21 22" stroke={c} {...thin} />
    </>
  ),
  chocolate: (c) => (
    <>
      <Path d="M8 24 C8 18 11 12 14 9 C16 12 20 18 20 24 Z" stroke={c} {...k} />
      <Path d="M18 26 C18 22 20 19 22 17 C24 19 26 22 26 26 Z" stroke={c} {...k} />
      <Path d="M14 9 C14 7 15 6 16 5 M22 17 C22 15 23 14 24 14" stroke={c} {...thin} />
    </>
  ),
  nutButter: (c) => (
    <>
      <Path d="M8 10 H24 V26 C24 28 8 28 8 26 Z" stroke={c} {...k} />
      <Path d="M7 5 H25 V10 H7 Z" stroke={c} {...k} />
      <Path d="M12 17 C12 14 15 14 15 16 C15 18 17 18 17 16 C17 14 20 14 20 17 C20 20 18 21 16 21 C14 21 12 20 12 17 Z" stroke={c} {...thin} />
    </>
  ),
  radish: (c) => (
    <>
      <Path d="M16 13 C10 13 8 17 9 21 C10 25 14 27 16 29 C18 27 22 25 23 21 C24 17 22 13 16 13 Z" stroke={c} {...k} />
      <Path d="M16 13 C14 9 11 6 8 6 C9 9 12 12 16 13 Z M16 13 C17 9 20 5 24 5 C23 9 20 12 16 13 Z" stroke={c} {...thin} />
      <Path d="M12 19 C12.6 21 13.6 22 15 23" stroke={c} {...thin} />
    </>
  ),
  cucumber: (c) => (
    <>
      <Path d="M6 24 C4 21 6 18 10 15 C15 11 21 7 25 7 C28 7 28 10 26 13 C23 17 17 22 12 25 C9 26.6 7 26 6 24 Z" stroke={c} {...k} />
      <Path d="M11 20 L11.6 20.6 M15 17 L15.6 17.6 M19 14 L19.6 14.6 M14 21.6 L14.6 22.2 M18 18.4 L18.6 19" stroke={c} {...thin} />
      <Path d="M25 7 L27 5" stroke={c} {...thin} />
    </>
  ),
  corn: (c) => (
    <>
      <Path d="M16 4 C20 4 22 10 22 17 C22 22 19 26 16 26 C13 26 10 22 10 17 C10 10 12 4 16 4 Z" stroke={c} {...k} />
      <Path d="M13 9 H19 M12 13 H20 M11.6 17 H20.4 M12 21 H20 M16 5 V25" stroke={c} {...thin} />
      <Path d="M10 17 C6 19 6 25 9 29 M22 17 C26 19 26 25 23 29" stroke={c} {...k} />
    </>
  ),
  berries: (c) => (
    <>
      <Circle cx="11" cy="19" r="5" stroke={c} {...k} />
      <Circle cx="21" cy="18" r="5" stroke={c} {...k} />
      <Circle cx="16" cy="11" r="4.5" stroke={c} {...k} />
      <Path d="M10 17.6 L11 18.6 L12 17.6 M20 16.6 L21 17.6 L22 16.6 M15 9.6 L16 10.6 L17 9.6" stroke={c} {...thin} />
    </>
  ),
  cauliflower: (c) => (
    <>
      <Path d="M8 16 C6 13 8 9 11 10 C11 6 16 5 17 8 C19 5 25 7 24 11 C27 11 28 15 25 17 Z" stroke={c} {...k} />
      <Path d="M12 13 C13 12 14 12 15 13 M18 11 C19 10 20 10 21 11 M15 16 C16 15 17 15 18 16" stroke={c} {...thin} />
      <Path d="M8 16 C9 22 12 27 16 27 C20 27 23 22 25 17 M12 18 L16 27 L20 18" stroke={c} {...k} />
    </>
  ),
  artichoke: (c) => (
    <>
      <Path d="M16 4 C13 6 12.4 9 13 11 C14 12 18 12 19 11 C19.6 9 19 6 16 4 Z" stroke={c} {...k} />
      <Path d="M10.6 10.6 C8.6 13 8.6 16 10 18 C12 19 20 19 22 18 C23.4 16 23.4 13 21.4 10.6" stroke={c} {...k} />
      <Path d="M8.4 16.6 C6.6 19.6 7.4 23 10 25 C13 26.4 19 26.4 22 25 C24.6 23 25.4 19.6 23.6 16.6" stroke={c} {...k} />
      <Path d="M16 12 V18 M13 18.6 L14 25.6 M19 18.6 L18 25.6" stroke={c} {...thin} />
      <Path d="M16 26 V29.4" stroke={c} {...k} />
    </>
  ),

  bread: (c) => (
    <>
      <Path d="M7 14 C5 10 8 7 12 7 H20 C24 7 27 10 25 14 V25 C25 26 24 27 23 27 H9 C8 27 7 26 7 25 Z" stroke={c} {...k} />
      <Path d="M10.4 15 C9.4 12.6 11 10.6 13.4 10.6 H18.6 C21 10.6 22.6 12.6 21.6 15 V23.6 H10.4 Z" stroke={c} {...thin} />
    </>
  ),

  dough: (c) => (
    <>
      <Path d="M5 20 C5 15 10 13 16 13 C22 13 27 15 27 20 C27 24 22 26 16 26 C10 26 5 24 5 20 Z" stroke={c} {...k} />
      <Path d="M10 19 C12 17 14 17 16 18 C18 19 20 19 22 17" stroke={c} {...thin} />
      <Path d="M20 4 L26 10 M18 6 L24 12 M17.4 5.4 L18.6 4.2 M25.4 12.4 L26.6 11.2" stroke={c} {...k} />
    </>
  ),
  tortilla: (c) => (
    <>
      <Ellipse cx="16" cy="18" rx="11" ry="7" stroke={c} {...k} />
      <Ellipse cx="16" cy="15" rx="11" ry="7" stroke={c} {...k} />
      <Path d="M11 13 L11.4 13.4 M18 12 L18.4 12.4 M15 17 L15.4 17.4 M21 16 L21.4 16.4" stroke={c} {...k} strokeWidth={2} />
    </>
  ),
  cheese: (c) => (
    <>
      <Path d="M4 21 L24 10 L28 16 V24 H4 Z M4 21 V24 M24 10 V16 H28" stroke={c} {...k} />
      <Path d="M4 21 H28" stroke={c} {...k} />
      <Circle cx="12" cy="18" r="1.4" stroke={c} {...thin} />
      <Circle cx="18" cy="21.6" r="1.2" stroke={c} {...thin} />
      <Circle cx="22" cy="16.6" r="1" stroke={c} {...thin} />
    </>
  ),
  plantMeat: (c) => (
    <>
      <Ellipse cx="16" cy="17" rx="11" ry="6.5" stroke={c} {...k} />
      <Path d="M5 17 C5 20.6 10 23.6 16 23.6 C22 23.6 27 20.6 27 17" stroke={c} {...thin} />
      <Path d="M10 18.6 L14 13 M15 19.6 L19 14 M20 18.6 L23 14.4" stroke={c} {...k} />
      <Path d="M12 5 C13 6.6 13 7.6 12 9 M17 4 C18 5.6 18 6.6 17 8 M22 5 C23 6.6 23 7.6 22 9" stroke={c} {...thin} />
    </>
  ),

  egg: (c) => (
    <>
      <Path d="M16 4 C11 4 7 12 7 18 C7 24 11 28 16 28 C21 28 25 24 25 18 C25 12 21 4 16 4 Z" stroke={c} {...k} />
      <Path d="M13 12 C14 10 15 9 16 9" stroke={c} {...thin} />
      <Path d="M15 22 C14 20 15 19 16 19 C17 19 18 20 17 22 C16.4 23 15.6 23 15 22 Z" stroke={c} {...thin} />
    </>
  ),
  marshmallow: (c) => (
    <>
      <Ellipse cx="11" cy="12" rx="6" ry="2.6" stroke={c} {...k} />
      <Path d="M5 12 V19 C5 20.6 17 20.6 17 19 V12" stroke={c} {...k} />
      <Ellipse cx="21" cy="19" rx="6" ry="2.6" stroke={c} {...k} />
      <Path d="M15 19 V26 C15 27.6 27 27.6 27 26 V19" stroke={c} {...k} />
    </>
  ),
  seaweed: (c) => (
    <>
      <Path d="M10 28 C6 22 13 18 9 12 C7 9 9 6 11 4" stroke={c} {...k} />
      <Path d="M16 28 C13 22 19 18 16 12 C14 8 17 5 19 3" stroke={c} {...k} />
      <Path d="M22 28 C19 23 25 19 22 14 C20.6 11 22.6 8 24.6 7" stroke={c} {...k} />
    </>
  ),
  wine: (c) => (
    <>
      <Path d="M10 4 H22 C22 11 20 15 16 15 C12 15 10 11 10 4 Z" stroke={c} {...k} />
      <Path d="M16 15 V26 M11 27 H21" stroke={c} {...k} />
      <Path d="M11 9 C13 10 19 10 21 9" stroke={c} {...thin} />
    </>
  ),
  water: (c) => (
    <>
      {/* a glass of water: tapered tumbler, a wavy waterline and a bubble */}
      <Path d="M9 6 H23 L21 27 C21 28 11 28 11 27 Z" stroke={c} {...k} />
      <Path d="M10 13 C12 11.5 14 14.5 16 13 C18 11.5 20 14.5 22 13" stroke={c} {...thin} />
      <Circle cx="14" cy="20" r="1.1" stroke={c} {...thin} />
      <Circle cx="18" cy="23" r="0.7" stroke={c} {...thin} />
    </>
  ),
  pickle: (c) => (
    <>
      <Path d="M9 9 H23 V12 C24 13 24 14 24 16 V26 C24 28 8 28 8 26 V16 C8 14 8 13 9 12 Z" stroke={c} {...k} />
      <Path d="M8 5 H24 V9 H8 Z" stroke={c} {...k} />
      <Path d="M13 15 C11 18 11 22 13 25 C15 22 15 18 13 15 Z M19 15 C17 18 17 22 19 25 C21 22 21 18 19 15 Z" stroke={c} {...thin} />
    </>
  ),
  seeds: (c) => (
    <>
      <Ellipse cx="10" cy="11" rx="2.2" ry="3.4" stroke={c} {...k} transform="rotate(-25 10 11)" />
      <Ellipse cx="20" cy="9" rx="2.2" ry="3.4" stroke={c} {...k} transform="rotate(20 20 9)" />
      <Ellipse cx="15" cy="19" rx="2.2" ry="3.4" stroke={c} {...k} transform="rotate(-10 15 19)" />
      <Ellipse cx="23" cy="21" rx="2.2" ry="3.4" stroke={c} {...k} transform="rotate(30 23 21)" />
      <Ellipse cx="9" cy="24" rx="2.2" ry="3.4" stroke={c} {...k} transform="rotate(15 9 24)" />
    </>
  ),
};

type Props = { color: string; size?: number } & ({ art: Art } | { line: string });

/** The drawing for an ingredient (by name or by recipe line), or nothing if there isn't one. */
export function IngredientDoodle(props: Props) {
  const art = 'art' in props ? props.art : artFor(props.line);
  if (!art) return null;
  const size = props.size ?? 28;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessible={false}>
      {DRAWINGS[art](props.color)}
    </Svg>
  );
}
