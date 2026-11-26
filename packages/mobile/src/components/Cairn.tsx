import { Text, useWindowDimensions, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { cairnHeight, cairns, stonePath, type Stone } from '../lib/cairn';
import { space, type as t, usePalette } from '../theme/tokens';

const COL = 82;

/**
 * Your cairns along a dotted trail: one stone per different recipe cooked. Drawn in the app's
 * ink style for now; Stephanie's own stones can replace the shapes later without changing the data.
 */
export function Cairn({ stacks }: { stacks: Stone[][] }) {
  const p = usePalette();
  const { width: screen } = useWindowDimensions();
  const fills = [p.sand, p.sageSoft, p.greenSoft];
  const count = stacks.reduce((n, s) => n + s.length, 0);
  const width = Math.max(screen - space.xl * 2, stacks.length * COL + 16);
  const tallest = Math.max(24, ...stacks.map(cairnHeight));
  const height = tallest + 18;
  const base = height - 12;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={count ? `Your cairn: ${count} ${count === 1 ? 'stone' : 'stones'}, one for each recipe you've cooked.` : 'Your cairn starts with the first recipe you cook.'}
      style={{ gap: space.xs }}
    >
      <Svg width={width} height={height}>
        {/* The trail the cairns stand beside. */}
        <Path d={`M4 ${base + 5} C ${width * 0.3} ${base + 1}, ${width * 0.6} ${base + 9}, ${width - 4} ${base + 4}`} stroke={p.ink} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="2 7" fill="none" />
        {stacks.length === 0 && (
          <Path d={`M${8 + COL / 2 - 26} ${base - 2} q26 -16 52 0`} stroke={p.control} strokeWidth={2} strokeDasharray="4 5" fill="none" strokeLinecap="round" />
        )}
        {stacks.map((stack, ci) => (
          <Stack key={ci} stack={stack} cx={8 + ci * COL + COL / 2} base={base} fills={fills} ink={p.ink} />
        ))}
      </Svg>
      <Text style={[t.small, { color: p.muted }]}>
        {count ? "One stone for each different recipe you've cooked." : 'Your cairn starts with the first recipe you cook.'}
      </Text>
    </View>
  );
}

/** One cairn's stones, bottom up, settling into each other a little. */
function Stack({ stack, cx, base, fills, ink }: { stack: Stone[]; cx: number; base: number; fills: string[]; ink: string }) {
  let y = base;
  return (
    <G>
      {stack.map((s) => {
        const cy = y - s.height / 2;
        y -= s.height * 0.82;
        const x = cx + s.shift;
        return (
          <G key={s.slug} rotation={s.tilt} origin={`${x}, ${cy}`}>
            <Path d={stonePath(s, x, cy)} fill={fills[s.shade]} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
          </G>
        );
      })}
    </G>
  );
}

/** The stone a recipe leaves: the same one it adds to your cairn in Kitchen. Decorative. */
export function StoneMark({ slug, width = 36 }: { slug: string; width?: number }) {
  const p = usePalette();
  const base = cairns([{ slug }])[0][0];
  // On its own a stone reads better a little rounder than one squashed into a stack.
  const s = { ...base, height: base.height * 1.35 };
  const scale = width / (s.width + 6);
  const vw = s.width + 6;
  const vh = s.height + 8;
  return (
    <Svg width={vw * scale} height={vh * scale} viewBox={`0 0 ${vw} ${vh}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <G rotation={s.tilt} origin={`${vw / 2}, ${vh / 2}`}>
        <Path d={stonePath({ ...s, shift: 0 }, vw / 2, vh / 2)} fill={[p.sand, p.sageSoft, p.greenSoft][s.shade]} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

/** A summit cairn: the stones from this hike's cooked recipes, stacked where the trail ends. */
export function SummitCairn({ cooked }: { cooked: { slug: string; firstCookedOn?: string }[] }) {
  const p = usePalette();
  const stacks = cairns(cooked);
  if (!stacks.length) return null;
  const height = Math.max(...stacks.map(cairnHeight)) + 8;
  const width = stacks.length * COL;
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {stacks.map((stack, ci) => (
        <Stack key={ci} stack={stack} cx={ci * COL + COL / 2} base={height - 4} fills={[p.sand, p.sageSoft, p.greenSoft]} ink={p.ink} />
      ))}
    </Svg>
  );
}
