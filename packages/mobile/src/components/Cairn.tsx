import { Text, useWindowDimensions, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';
import { cairnPile, cairns, stonePath, type PlacedStone } from '../lib/cairn';
import { space, type as t, usePalette } from '../theme/tokens';

const COL = 82;

/**
 * Your cairns along a dotted trail: one stone per different recipe cooked. Drawn in the app's
 * ink style for now; Stephanie's own stones can replace the shapes later without changing the data.
 */
export function Cairn({ cooked }: { cooked: { slug: string; firstCookedOn?: string }[] }) {
  const p = usePalette();
  const { width: screen } = useWindowDimensions();
  const width = screen - space.xl * 2;
  const pile = cairnPile(cooked);
  const count = pile.stones.length;
  // A big cairn shrinks to fit, no taller than about a third of the screen, leaving room beside it for the grass.
  const scale = count ? Math.min(1, (width - 90) / pile.width, 200 / pile.height) : 1;
  const left = 8 + (pile.width * scale) / 2;
  const base = (count ? pile.height * scale : 24) + 10;
  const height = base + 12;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={count ? `Your cairn: ${count} ${count === 1 ? 'stone' : 'stones'}, one for each recipe you've cooked.` : 'Your cairn starts with the first recipe you cook.'}
      style={{ gap: space.xs }}
    >
      <Svg width={width} height={height}>
        {/* The ground the cairn stands on: a gentle line of earth, tufts of grass, a loose pebble. */}
        <Path d={`M4 ${base + 3} C ${width * 0.3} ${base + 1}, ${width * 0.65} ${base + 6}, ${width - 4} ${base + 3}`} stroke={p.ink} strokeOpacity={0.45} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        {count > 0 && <Tuft x={left + (pile.width * scale) / 2 + 6} y={base + 3} color={p.green} small />}
        <Tuft x={width - 40} y={base + 3} color={p.green} />
        <Ellipse cx={width - 70} cy={base + 1} rx={5} ry={3} fill={p.stone[1]} stroke={p.ink} strokeWidth={1.2} />
        {count === 0 ? (
          <Path d={`M${8 + COL / 2 - 26} ${base - 2} q26 -16 52 0`} stroke={p.control} strokeWidth={2} strokeDasharray="4 5" fill="none" strokeLinecap="round" />
        ) : (
          <Pile stones={pile.stones} footWidth={pile.width} cx={left} base={base} scale={scale} p={p} />
        )}
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

/** A cairn's stones in field-stone grey, lit from above, casting a soft shadow, drawn bottom up so each rests on the last. */
function Pile({ stones, footWidth, cx, base, scale, p }: { stones: PlacedStone[]; footWidth: number; cx: number; base: number; scale: number; p: ReturnType<typeof usePalette> }) {
  const f = (n: number) => n.toFixed(1);
  // Strokes stay the same weight however small a big cairn is drawn.
  const sw = (n: number) => n / scale;
  return (
    <G>
      <Ellipse cx={cx} cy={base + 1} rx={(footWidth * scale) / 2 + 6} ry={4.5} fill={p.ink} opacity={0.12} />
      <G transform={`translate(${f(cx)} ${f(base)}) scale(${scale.toFixed(3)})`}>
        {stones.map((s) => {
          const x = s.x;
          const cy = -s.y;
          const w = s.width / 2;
          const h = s.height / 2;
          return (
            <G key={s.slug} rotation={s.tilt} origin={`${f(x)}, ${f(cy)}`}>
              <Path d={stonePath({ ...s, shift: 0 }, x, cy)} fill={p.stone[s.shade]} stroke={p.ink} strokeWidth={sw(1.8)} strokeLinejoin="round" />
              {/* light catching the top of the stone */}
              <Path d={`M${f(x - w * 0.55)} ${f(cy - h * 0.2)} Q${f(x - w * 0.25)} ${f(cy - h * 0.78)} ${f(x + w * 0.2)} ${f(cy - h * 0.72)}`} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={sw(2)} strokeLinecap="round" fill="none" />
              {/* a darker underside where it rests */}
              <Path d={`M${f(x - w * 0.6)} ${f(cy + h * 0.55)} Q${f(x)} ${f(cy + h * 1.05)} ${f(x + w * 0.65)} ${f(cy + h * 0.5)}`} stroke={p.ink} strokeOpacity={0.22} strokeWidth={sw(2.4)} strokeLinecap="round" fill="none" />
            </G>
          );
        })}
      </G>
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

/** A summit cairn: the stones from this hike's cooked recipes, built where the trail ends. */
export function SummitCairn({ cooked }: { cooked: { slug: string; firstCookedOn?: string }[] }) {
  const p = usePalette();
  const pile = cairnPile(cooked);
  if (!pile.stones.length) return null;
  const width = pile.width + 24;
  const height = pile.height + 12;
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Pile stones={pile.stones} footWidth={pile.width} cx={width / 2} base={height - 7} scale={1} p={p} />
    </Svg>
  );
}
