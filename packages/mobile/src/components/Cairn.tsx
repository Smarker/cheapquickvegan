import { Text, useWindowDimensions, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';
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
  const count = stacks.reduce((n, s) => n + s.length, 0);
  const width = Math.max(screen - space.xl * 2, stacks.length * COL + 16);
  const tallest = Math.max(24, ...stacks.map(cairnHeight));
  const height = tallest + 22;
  const base = height - 14;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={count ? `Your cairn: ${count} ${count === 1 ? 'stone' : 'stones'}, one for each recipe you've cooked.` : 'Your cairn starts with the first recipe you cook.'}
      style={{ gap: space.xs }}
    >
      <Svg width={width} height={height}>
        {/* The ground the cairns stand on: a gentle line of earth, a tuft of grass, a loose pebble. */}
        <Path d={`M4 ${base + 3} C ${width * 0.3} ${base + 1}, ${width * 0.65} ${base + 6}, ${width - 4} ${base + 3}`} stroke={p.ink} strokeOpacity={0.45} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        <Tuft x={width - 40} y={base + 3} color={p.green} />
        {stacks.length > 0 && <Tuft x={8 + COL / 2 + (stacks[0][0]?.width ?? 60) * 0.5 + 6} y={base + 3} color={p.green} small />}
        <Ellipse cx={width - 70} cy={base + 1} rx={5} ry={3} fill={p.stone[1]} stroke={p.ink} strokeWidth={1.2} />
        {stacks.length === 0 && (
          <Path d={`M${8 + COL / 2 - 26} ${base - 2} q26 -16 52 0`} stroke={p.control} strokeWidth={2} strokeDasharray="4 5" fill="none" strokeLinecap="round" />
        )}
        {stacks.map((stack, ci) => (
          <Stack key={ci} stack={stack} cx={8 + ci * COL + COL / 2} base={base} p={p} />
        ))}
      </Svg>
      <Text style={[t.small, { color: p.muted }]}>{count ? "One stone for each recipe you've cooked." : 'Your cairn starts with the first recipe you cook.'}</Text>
    </View>
  );
}

/** A few blades of grass at the foot of the cairn. */
function Tuft({ x, y, color, small }: { x: number; y: number; color: string; small?: boolean }) {
  const k = small ? 0.7 : 1;
  return (
    <Path
      d={`M${x} ${y} q-3 ${-7 * k} -7 ${-10 * k} M${x + 2} ${y} q0 ${-8 * k} 1 ${-13 * k} M${x + 4} ${y} q3 ${-6 * k} 7 ${-9 * k}`}
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** One cairn's stones, bottom up, settling into each other: field-stone grey, lit from above, casting a soft shadow. */
function Stack({ stack, cx, base, p }: { stack: Stone[]; cx: number; base: number; p: ReturnType<typeof usePalette> }) {
  let y = base;
  const foot = stack[0]?.width ?? 60;
  return (
    <G>
      <Ellipse cx={cx} cy={base + 1} rx={foot * 0.58} ry={4.5} fill={p.ink} opacity={0.12} />
      {stack.map((s) => {
        const cy = y - s.height / 2;
        y -= s.height * 0.8;
        const x = cx + s.shift;
        const w = s.width / 2;
        const h = s.height / 2;
        return (
          <G key={s.slug} rotation={s.tilt} origin={`${x}, ${cy}`}>
            <Path d={stonePath(s, x, cy)} fill={p.stone[s.shade]} stroke={p.ink} strokeWidth={1.8} strokeLinejoin="round" />
            {/* light catching the top of the stone */}
            <Path d={`M${(x - w * 0.55).toFixed(1)} ${(cy - h * 0.2).toFixed(1)} Q${(x - w * 0.25).toFixed(1)} ${(cy - h * 0.78).toFixed(1)} ${(x + w * 0.2).toFixed(1)} ${(cy - h * 0.72).toFixed(1)}`} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round" fill="none" />
            {/* a darker underside where it rests */}
            <Path d={`M${(x - w * 0.6).toFixed(1)} ${(cy + h * 0.55).toFixed(1)} Q${x.toFixed(1)} ${(cy + h * 1.05).toFixed(1)} ${(x + w * 0.65).toFixed(1)} ${(cy + h * 0.5).toFixed(1)}`} stroke={p.ink} strokeOpacity={0.22} strokeWidth={2.4} strokeLinecap="round" fill="none" />
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
        <Path d={stonePath({ ...s, shift: 0 }, vw / 2, vh / 2)} fill={p.stone[s.shade]} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

/** A summit cairn: the stones from this hike's cooked recipes, stacked where the trail ends. */
export function SummitCairn({ cooked }: { cooked: { slug: string; firstCookedOn?: string }[] }) {
  const p = usePalette();
  const stacks = cairns(cooked);
  if (!stacks.length) return null;
  const height = Math.max(...stacks.map(cairnHeight)) + 12;
  const width = stacks.length * COL;
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {stacks.map((stack, ci) => (
        <Stack key={ci} stack={stack} cx={ci * COL + COL / 2} base={height - 8} p={p} />
      ))}
    </Svg>
  );
}
