import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { CookedStamp } from '../components/CookedStamp';
import { Hut, SummitFlag } from '../components/Doodles';
import { CheckIcon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { journey, REGIONS, STRETCH_LABEL, type Difficulty, type Stop } from '../lib/journeys';
import { displayTitle } from '../lib/recipes';
import { useSaved } from '../lib/saved';
import { font, space, tintFor, type as t, usePalette, type Palette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ Journey: { id: string }; Recipe: { slug: string }; Guide: { slug: string } }, 'Journey'>;

const BLAZES: Record<Difficulty, number> = { Easy: 1, Medium: 2, Challenge: 3 };

/** Trail blazes, like the painted marks on trees: one for easy, three for the summit climb. */
function Blazes({ level, color }: { level: Difficulty; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={level}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ width: 9, height: 14, borderRadius: 2, backgroundColor: color, opacity: i <= BLAZES[level] ? 1 : 0.18 }} />
      ))}
    </View>
  );
}

export function JourneyScreen({ route, navigation }: Props) {
  const p = usePalette();
  const reduce = useReducedMotion();
  const saved = useSaved();
  const region = REGIONS.find((r) => r.id === route.params.id)!;
  const stops = useMemo(() => journey(region), [region]);
  const recipeStops = stops.filter((s) => s.kind === 'recipe');
  const cooked = recipeStops.filter((s) => s.kind === 'recipe' && saved.cookedCount(s.recipe.slug) > 0).length;

  let recipeIndex = 0;

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.root}>
      <Text style={[t.hand, { color: p.greenDeep }]}>{region.name}</Text>
      <Text style={[t.title, { color: p.ink, fontSize: 34, lineHeight: 40 }]} accessibilityRole="header">
        {region.trail}
      </Text>
      <Text style={[t.body, { color: p.muted }]}>{region.blurb}</Text>
      <Text style={[t.hand, { color: p.greenDeep, marginTop: space.s }]}>
        {cooked === 0
          ? `${recipeStops.length} stops. Start at the bottom and take your time.`
          : cooked === recipeStops.length
            ? `You've cooked the whole trail. Summit reached!`
            : `${cooked} of ${recipeStops.length} cooked. Keep going!`}
      </Text>

      <View style={styles.trail}>
        <Svg width={4} height="100%" style={styles.path} pointerEvents="none">
          <Line x1="2" y1="0" x2="2" y2="100%" stroke={p.green} strokeWidth={3} strokeDasharray="1 9" strokeLinecap="round" />
        </Svg>

        {stops.map((stop, i) => {
          const key = `${stop.kind}-${i}`;
          const enter = reduce ? undefined : FadeInDown.duration(350).delay(Math.min(i, 8) * 45);
          if (stop.kind === 'section') {
            return (
              <Animated.View key={key} entering={enter} style={styles.signRow}>
                <View style={[styles.signBoard, { borderColor: p.ink, backgroundColor: p.sand }]}>
                  <Text style={[t.hand, { color: p.ink, fontSize: 18 }]}>{STRETCH_LABEL[stop.difficulty]}</Text>
                </View>
                <Blazes level={stop.difficulty} color={p.green} />
              </Animated.View>
            );
          }
          if (stop.kind === 'recipe') {
            const r = stop.recipe;
            const n = ++recipeIndex;
            const count = saved.cookedCount(r.slug);
            return (
              <Animated.View key={key} entering={enter}>
                <Pressable
                  onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                  accessibilityRole="button"
                  accessibilityLabel={`Stop ${n}: ${displayTitle(r)}, ${stop.difficulty}, ${r.totalText ?? ''}`}
                  style={({ pressed }) => [styles.stop, { backgroundColor: tintFor(p, r.category), transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                >
                  <View style={[styles.node, { backgroundColor: count ? p.green : p.ground, borderColor: p.green }]}>
                    {count ? <CheckIcon color="#FFFFFF" size={14} /> : <Text style={[t.label, { color: p.greenDeep, fontFamily: font.sansBold }]}>{n}</Text>}
                  </View>
                  <Photo uri={r.image} width={76} radius={18} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                      {displayTitle(r)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
                      <Blazes level={stop.difficulty} color={p.green} />
                      <Text style={[t.hand, { color: p.greenDeep, fontSize: 17, flexShrink: 0, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple">
                        {r.totalText}
                      </Text>
                      <CookedStamp count={count} color={p.greenDeep} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }
          if (stop.kind === 'guide') {
            const g = stop.guide;
            return (
              <Animated.View key={key} entering={enter}>
                <Pressable
                  onPress={() => navigation.navigate('Guide', { slug: g.slug })}
                  accessibilityRole="button"
                  accessibilityLabel={`Rest stop guide: ${g.title}`}
                  style={({ pressed }) => [styles.rest, { borderColor: p.hairline, backgroundColor: p.ground, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Photo uri={g.image} width={300} height={120} radius={18} style={{ alignSelf: 'stretch', width: '100%' }} />
                  <Text style={[t.hand, { color: p.greenDeep }]}>Rest stop{g.city ? `: ${g.city}` : ''}</Text>
                  <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                    {g.title.split(':')[0]}
                  </Text>
                  {g.readingTime && <Text style={[t.small, { color: p.muted }]}>{g.readingTime}</Text>}
                </Pressable>
              </Animated.View>
            );
          }
          return <RestStop key={key} stop={stop} p={p} enter={enter} onOpenGuide={(slug) => navigation.navigate('Guide', { slug })} />;
        })}

        <View style={styles.summit} accessible accessibilityLabel="Summit">
          <SummitFlag color={p.ink} />
          <Text style={[t.hand, { color: p.ink, fontSize: 22 }]}>The summit</Text>
        </View>
      </View>
    </ScrollView>
  );
}

type RestProps = {
  stop: Extract<Stop, { kind: 'lesson' | 'pantry' }>;
  p: Palette;
  enter: ReturnType<typeof FadeInDown.duration> | undefined;
  onOpenGuide: (slug: string) => void;
};

function RestStop({ stop, p, enter, onOpenGuide }: RestProps) {
  return (
    <Animated.View entering={enter} style={[styles.rest, { borderColor: p.hairline, backgroundColor: p.sand }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
        <Hut color={p.ink} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={[t.hand, { color: p.greenDeep }]}>{stop.kind === 'lesson' ? 'Refugio lesson' : 'Pantry stop'}</Text>
          <Text style={[t.rowTitle, { color: p.ink }]}>{stop.kind === 'lesson' ? stop.title : 'Stock up for the next stretch'}</Text>
        </View>
      </View>
      {stop.kind === 'lesson' ? (
        <Text style={[t.body, { color: p.ink }]}>{stop.body}</Text>
      ) : (
        <Text style={[t.body, { color: p.ink }]}>The next recipes share {joinList(stop.items)}. Grab them once and you're set.</Text>
      )}
      {stop.guide && (
        <Pressable
          onPress={() => onOpenGuide(stop.guide!.slug)}
          accessibilityRole="link"
          accessibilityLabel={`Read the full guide: ${stop.guide.title}`}
          hitSlop={8}
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={[t.hand, { color: p.greenDeep, textDecorationLine: 'underline' }]}>
            {stop.kind === 'pantry' ? 'My pantry essentials guide →' : 'Read the full guide →'}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const joinList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingTop: space.s, paddingBottom: 64, gap: space.s },
  trail: { marginTop: space.xl, gap: space.l, paddingLeft: 30 },
  path: { position: 'absolute', left: 13, top: 0, bottom: 0 },
  signRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginLeft: -30, marginTop: space.m },
  signBoard: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, transform: [{ rotate: '-2deg' }] },
  stop: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 10, borderRadius: 24 },
  node: { position: 'absolute', left: -42, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rest: { borderWidth: 1.5, borderRadius: 24, padding: space.l, gap: space.s },
  summit: { alignItems: 'center', gap: space.s, marginTop: space.l, marginLeft: -30 },
});
