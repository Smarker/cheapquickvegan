import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Blazes } from '../components/Blazes';
import { CookCat } from '../components/CookCat';
import { AREAS, GRADE_LABEL, journey, openHikes, type Area, type Difficulty, type Region } from '../lib/journeys';
import { useDataVersion } from '../lib/data';
import { useSaved } from '../lib/saved';
import { space, type as t, usePalette, type Palette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ JourneyMap: undefined; Journey: { id: string } }, 'JourneyMap'>;

type Pt = { x: number; y: number };
const ISLAND_H = 260;
const GRADES: Difficulty[] = ['Easy', 'Medium', 'Challenge'];

/** A point along a quadratic curve. */
const along = (a: Pt, c: Pt, b: Pt, k: number): Pt => ({
  x: (1 - k) ** 2 * a.x + 2 * (1 - k) * k * c.x + k * k * b.x,
  y: (1 - k) ** 2 * a.y + 2 * (1 - k) * k * c.y + k * k * b.y,
});

/** A hand-drawn island outline: a wobbly ellipse, smoothed through its midpoints. */
function islandPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.07 * Math.sin(i * 2.3 + seed) + 0.05 * Math.sin(i * 5.1 + seed * 2);
    return { x: cx + rx * r * Math.cos(a), y: cy + ry * r * Math.sin(a) };
  });
  const mid = (p: Pt, q: Pt) => `${((p.x + q.x) / 2).toFixed(1)} ${((p.y + q.y) / 2).toFixed(1)}`;
  let d = `M${mid(pts[0], pts[1])}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    d += ` Q${p.x.toFixed(1)} ${p.y.toFixed(1)} ${mid(p, pts[(i + 1) % n])}`;
  }
  return `${d} Z`;
}

/** A little drawing of what each area looks like, tucked into its island. */
function scenery(kind: Area['scenery'], x: number, y: number): string {
  switch (kind) {
    case 'terraces':
      return `M${x} ${y + 18} q20 -8 40 0 M${x + 4} ${y + 10} q16 -7 32 0 M${x + 9} ${y + 2} q11 -5 22 0`;
    case 'mesa':
      return `M${x} ${y + 20} L${x + 8} ${y + 4} H${x + 30} L${x + 38} ${y + 20}`;
    case 'andes':
      return `M${x} ${y + 20} L${x + 10} ${y + 4} L${x + 18} ${y + 14} L${x + 27} ${y} L${x + 40} ${y + 20}`;
    default:
      return `M${x} ${y + 20} L${x + 12} ${y + 4} L${x + 20} ${y + 12} L${x + 28} ${y + 2} L${x + 40} ${y + 20}`;
  }
}

/** A hill under each summit flag: a gentle rise for easy, a tall peak for hard. */
function hill(grade: Difficulty, e: Pt): string {
  const [w, h] = grade === 'Easy' ? [46, 14] : grade === 'Medium' ? [54, 26] : [62, 38];
  return grade === 'Easy'
    ? `M${e.x - w / 2} ${e.y + h} Q${e.x} ${e.y - h * 0.9} ${e.x + w / 2} ${e.y + h}`
    : `M${e.x - w / 2} ${e.y + h} L${e.x} ${e.y} L${e.x + w / 2} ${e.y + h}`;
}

/**
 * The trail map: each area is an ink island with its hikes fanning out from base camp, a gentle
 * hill for the easy hike up to a tall peak for the hard one. Stops fill in as you cook, flags go
 * green at the summit, and the cat waits on the hike you're partway through.
 */
export function JourneyMapScreen({ navigation }: Props) {
  const p = usePalette();
  const saved = useSaved();
  const { width } = useWindowDimensions();
  const dataVersion = useDataVersion();
  const W = width - space.xl * 2;

  const hikes = useMemo(() => {
    const open = openHikes();
    return new Map(open.map((h) => [h.id, journey(h).flatMap((s) => (s.kind === 'recipe' ? [s.recipe.slug] : []))]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const behind = (h: Region, slug: string) => saved.cookedCount(slug) > 0 || saved.isPassed(h.id, slug);
  // The cat waits on the first hike you've started but not finished.
  const current = [...hikes.entries()].find(([id, slugs]) => {
    const h = openHikes().find((x) => x.id === id)!;
    const done = slugs.filter((s) => behind(h, s)).length;
    return done > 0 && done < slugs.length;
  })?.[0];

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.root}>
      <Text style={[t.hand, { color: p.greenDeep }]}>The trail map</Text>
      <Text style={[t.title, { color: p.ink }]} accessibilityRole="header">
        Pick a hike
      </Text>
      <Text style={[t.body, { color: p.muted }]}>
        Every area has an easy stroll, a steady climb and a summit. Start wherever you like.
      </Text>

      {AREAS.map((area, ai) => {
        const areaHikes = GRADES.map((g) => openHikes().find((h) => h.area === area.id && h.grade === g)).filter((h): h is Region => !!h);
        if (!areaHikes.length) return null;
        const cx = W * (ai % 2 ? 0.56 : 0.44);
        const cy = ISLAND_H / 2;
        const rx = W * 0.42;
        const ry = 104;
        const base: Pt = { x: cx, y: cy + ry * 0.72 };
        const ends: Record<Difficulty, Pt> = {
          Easy: { x: cx - rx * 0.58, y: cy + ry * 0.02 },
          Medium: { x: cx - rx * 0.02, y: cy - ry * 0.5 },
          Challenge: { x: cx + rx * 0.56, y: cy - ry * 0.22 },
        };
        const ctrl: Record<Difficulty, Pt> = {
          Easy: { x: cx - rx * 0.5, y: cy + ry * 0.6 },
          Medium: { x: cx + rx * 0.2, y: cy + ry * 0.1 },
          Challenge: { x: cx + rx * 0.5, y: cy + ry * 0.55 },
        };
        return (
          <View key={area.id} style={styles.area}>
            <Text style={[t.hand, { color: p.greenDeep, fontSize: 22 }]} textBreakStrategy="simple">
              {area.name}
            </Text>
            <View style={{ width: W, height: ISLAND_H }}>
              <Svg width={W} height={ISLAND_H}>
                {/* the sea around it */}
                <Path d={`M4 24 q8 -6 16 0 t16 0 M${W - 44} ${ISLAND_H - 18} q8 -6 16 0 t16 0`} stroke={p.green} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />
                <Path d={islandPath(cx, cy, rx, ry, ai * 1.7 + 0.4)} fill={[p.greenSoft, p.sand, p.sageSoft, p.mist][ai % 4]} stroke={p.ink} strokeWidth={2} />
                <Path d={scenery(area.scenery, cx - rx * 0.7, cy - ry * 0.62)} stroke={p.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
                {/* base camp */}
                <Path d={`M${base.x - 9} ${base.y + 7} L${base.x} ${base.y - 6} L${base.x + 9} ${base.y + 7} Z`} stroke={p.ink} strokeWidth={1.8} fill={p.ground} strokeLinejoin="round" />
                {areaHikes.map((h) => {
                  const e = ends[h.grade];
                  const c = ctrl[h.grade];
                  const slugs = hikes.get(h.id) ?? [];
                  const summited = !!saved.summits[h.id];
                  const d = `M${base.x} ${base.y} Q${c.x} ${c.y} ${e.x} ${e.y}`;
                  return (
                    <G key={h.id}>
                      <Path d={hill(h.grade, e)} stroke={p.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d={d} stroke={p.greenDeep} strokeWidth={3} strokeDasharray="1 7" strokeLinecap="round" fill="none" />
                      {/* a wide invisible stroke so the trail itself can be tapped */}
                      <Path d={d} stroke="transparent" strokeWidth={28} fill="none" onPress={() => navigation.navigate('Journey', { id: h.id })} />
                      {slugs.map((slug, k) => {
                        const pt = along(base, c, e, ((k + 1) / (slugs.length + 1)) * 0.92);
                        const done = behind(h, slug);
                        return <Circle key={slug} cx={pt.x} cy={pt.y} r={5} fill={done ? p.green : p.ground} stroke={p.green} strokeWidth={2} />;
                      })}
                      {/* summit flag */}
                      <Path d={`M${e.x} ${e.y} V${e.y - 18}`} stroke={p.ink} strokeWidth={2} strokeLinecap="round" />
                      <Path d={`M${e.x} ${e.y - 18} L${e.x + 12} ${e.y - 14} L${e.x} ${e.y - 10} Z`} fill={summited ? p.green : p.ground} stroke={p.ink} strokeWidth={1.6} strokeLinejoin="round" />
                    </G>
                  );
                })}
              </Svg>
              {areaHikes.map((h) => {
                if (h.id !== current) return null;
                const slugs = hikes.get(h.id) ?? [];
                const k = slugs.findIndex((s) => !behind(h, s));
                const pt = along(base, ctrl[h.grade], ends[h.grade], ((k + 1) / (slugs.length + 1)) * 0.92);
                return (
                  <View key="cat" pointerEvents="none" style={[styles.cat, { left: pt.x + 8, top: pt.y - 38 }]}>
                    <CookCat outline={p.ink} size={40} />
                  </View>
                );
              })}
            </View>

            {areaHikes.map((h) => (
              <HikeRow key={h.id} hike={h} slugs={hikes.get(h.id) ?? []} p={p} behind={(s) => behind(h, s)} summited={!!saved.summits[h.id]} onPress={() => navigation.navigate('Journey', { id: h.id })} />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

type RowProps = { hike: Region; slugs: string[]; p: Palette; behind: (slug: string) => boolean; summited: boolean; onPress: () => void };

function HikeRow({ hike, slugs, p, behind, summited, onPress }: RowProps) {
  const done = slugs.filter(behind).length;
  const status = summited ? 'Summited' : done ? `${done} of ${slugs.length} stops` : `${slugs.length} ${slugs.length === 1 ? 'stop' : 'stops'}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hike.trail}, ${GRADE_LABEL[hike.grade]} hike, ${status}`}
      style={({ pressed }) => [styles.row, { borderColor: p.hairline, opacity: pressed ? 0.85 : 1 }]}
    >
      <Blazes level={hike.grade} color={p.green} />
      <Text style={[t.rowTitle, { color: p.ink, flex: 1, fontSize: 16 }]} numberOfLines={1}>
        {hike.trail}
      </Text>
      <Text style={[t.small, { color: summited ? p.greenDeep : p.muted }]}>{status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingTop: space.l, gap: space.s, paddingBottom: 48 },
  area: { gap: space.s, marginTop: space.l },
  cat: { position: 'absolute' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.m, borderWidth: 1.5, borderRadius: 18 },
});
