import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Ink line drawings of the equipment tags recipes already carry. Same hand as Doodles.tsx.
const ink = { fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
type P = { color: string; size?: number };

const AirFryer = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M14 10 C14 7 42 7 42 10 L44 46 C44 49 12 49 12 46 Z" stroke={color} {...ink} />
    <Rect x="18" y="26" width="20" height="14" rx="4" stroke={color} {...ink} />
    <Path d="M24 33 H32" stroke={color} {...ink} />
    <Circle cx="28" cy="17" r="3.5" stroke={color} {...ink} />
  </Svg>
);
const Blender = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M19 8 H37 L34 32 H22 Z" stroke={color} {...ink} />
    <Path d="M37 12 C43 12 43 22 36 22" stroke={color} {...ink} />
    <Path d="M17 34 C17 32 39 32 39 34 L41 47 C41 49 15 49 15 47 Z" stroke={color} {...ink} />
    <Circle cx="28" cy="41" r="2.5" stroke={color} {...ink} />
    <Path d="M24 20 L28 24 L32 20" stroke={color} {...ink} strokeWidth={1.8} />
  </Svg>
);
const Skillet = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M6 28 C6 24 38 24 38 28 C38 38 31 42 22 42 C13 42 6 38 6 28 Z" stroke={color} {...ink} />
    <Path d="M38 29 L52 25" stroke={color} {...ink} strokeWidth={3} />
    <Path d="M16 18 C14 15 18 13 16 10 M24 18 C22 15 26 13 24 10" stroke={color} {...ink} strokeWidth={1.8} />
  </Svg>
);
const Pot = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M12 22 C12 19 44 19 44 22" stroke={color} {...ink} />
    <Path d="M12 22 C12 32 12 40 16 45 C20 49 36 49 40 45 C44 40 44 32 44 22" stroke={color} {...ink} />
    <Path d="M12 26 C7 25 5 28 7 31 C9 33 12 32 12 32 M44 26 C49 25 51 28 49 31 C47 33 44 32 44 32" stroke={color} {...ink} />
    <Path d="M24 14 C22 11 26 9 24 6 M32 14 C30 11 34 9 32 6" stroke={color} {...ink} strokeWidth={1.8} />
  </Svg>
);
const FoodProcessor = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M15 14 C15 11 41 11 41 14 L39 36 H17 Z" stroke={color} {...ink} />
    <Path d="M24 11 V5 H32 V11" stroke={color} {...ink} />
    <Path d="M20 26 C25 22 31 30 36 26" stroke={color} {...ink} strokeWidth={1.8} />
    <Rect x="13" y="38" width="30" height="10" rx="4" stroke={color} {...ink} />
  </Svg>
);
const BakingSheet = ({ color, size = 56 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Path d="M6 34 L14 22 H50 L42 34 Z" stroke={color} {...ink} />
    <Path d="M6 34 V38 H42 L50 26 V22" stroke={color} {...ink} />
    <Circle cx="21" cy="28" r="3" stroke={color} {...ink} />
    <Circle cx="31" cy="28" r="3" stroke={color} {...ink} />
    <Circle cx="40" cy="27" r="2.5" stroke={color} {...ink} />
  </Svg>
);

export const GEAR = [
  { tag: 'Air Fryer', label: 'Air fryer', Doodle: AirFryer },
  { tag: 'Tall Skillet', label: 'Skillet', Doodle: Skillet },
  { tag: 'Large Pot', label: 'Big pot', Doodle: Pot },
  { tag: 'Blender', label: 'Blender', Doodle: Blender },
  { tag: 'Food Processor', label: 'Processor', Doodle: FoodProcessor },
  { tag: 'Baking Sheet', label: 'Baking sheet', Doodle: BakingSheet },
] as const;
