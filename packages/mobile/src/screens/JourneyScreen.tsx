import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Line } from 'react-native-svg';
import { Blazes } from '../components/Blazes';
import { CookedStamp } from '../components/CookedStamp';
import { CookCat } from '../components/CookCat';
import { TrailPostcard } from '../components/TrailPostcard';
import { dismissHint } from '../lib/hints';
import { Hut, SummitFlag } from '../components/Doodles';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { CheckIcon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { gradeLabel, hikeById, journey, sideTrips, STRETCH_LABEL, type Stop } from '../lib/journeys';
import { displayTitle } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { useSaved } from '../lib/saved';
import { font, space, tintFor, type as t, usePalette, type Palette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ Journey: { id: string }; Recipe: { slug: string }; Guide: { slug: string } }, 'Journey'>;

/** Two small footprints: a stop you walked past. Not a cross, not a miss, just another path. */
function Footprints({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      {/* left print, lower */}
      <Ellipse cx="6" cy="14" rx="1.9" ry="3" fill={color} />
      <Circle cx="4.6" cy="9.6" r="0.8" fill={color} />
      <Circle cx="6.3" cy="9.2" r="0.8" fill={color} />
      <Circle cx="7.8" cy="9.8" r="0.75" fill={color} />
      {/* right print, a step ahead */}
      <Ellipse cx="13.5" cy="8" rx="1.9" ry="3" fill={color} />
      <Circle cx="12.1" cy="3.6" r="0.8" fill={color} />
      <Circle cx="13.8" cy="3.2" r="0.8" fill={color} />
      <Circle cx="15.3" cy="3.8" r="0.75" fill={color} />
    </Svg>
  );
}

export function JourneyScreen({ route, navigation }: Props) {
  const p = usePalette();
  const reduce = useReducedMotion();
  const saved = useSaved();
  const region = hikeById(route.params.id)!;
  const dataVersion = useDataVersion();
  // Opening a hike is how you learn what one is: the Discover tip has done its job.
  useEffect(() => dismissHint('journeys'), []);
  // Once started, the hike keeps its stops; recipes published later become side trips below the summit.
  const pinned = saved.trailFor(region.id);
  const stops = useMemo(() => journey(region, pinned), [region, dataVersion, pinned]);
  const extras = useMemo(() => sideTrips(region, pinned), [region, dataVersion, pinned]);
  const recipeStops = stops.filter((s) => s.kind === 'recipe');
  const cooked = recipeStops.filter((s) => s.kind === 'recipe' && saved.cookedCount(s.recipe.slug) > 0).length;
  // A stop is behind you once it's cooked, or once you chose another path past it.
  const behind = (slug: string) => saved.cookedCount(slug) > 0 || saved.isPassed(region.id, slug);

  // The helper cat waits on your next stop, or at the summit once the trail is done.
  const nextSlug = recipeStops.map((s) => (s.kind === 'recipe' ? s.recipe.slug : '')).find((slug) => slug && !behind(slug));

  // The trail is done once every stop is behind you. A postcard needs at least one cooked memory on it.
  const allCooked = recipeStops.length > 0 && !nextSlug;
  // The first stop cooked or passed starts the hike: remember its stops from here on.
  const started = recipeStops.some((s) => s.kind === 'recipe' && behind(s.recipe.slug));
  useEffect(() => {
    if (started && !pinned) saved.pinTrail(region.id, recipeStops.flatMap((s) => (s.kind === 'recipe' ? [s.recipe.slug] : [])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, pinned, region.id]);
  const hasPostcard = allCooked && cooked > 0;
  // A summit, once reached, stays reached. If a stop opens up again later, the trail says so beside it.
  const summitedOn = saved.summits[region.id];
  const reopened = summitedOn && !allCooked ? recipeStops.filter((s) => s.kind === 'recipe' && !behind(s.recipe.slug)).length : 0;
  // Remember the day the trail was finished, for its postcard.
  useEffect(() => {
    if (hasPostcard) saved.markSummit(region.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPostcard, region.id]);

  let recipeIndex = 0;

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.root}>
      <Text style={[t.hand, { color: p.greenDeep }]}>{region.name}</Text>
      <Text style={[t.title, { color: p.ink, fontSize: 34, lineHeight: 40 }]} accessibilityRole="header">
        {region.trail}
      </Text>
      <View style={styles.grade}>
        <Blazes level={region.grade} color={p.green} />
        <Text style={[t.label, { color: p.ink }]}>{gradeLabel(region)} hike</Text>
      </View>
      <Text style={[t.body, { color: p.muted }]}>{region.blurb}</Text>
      <Text style={[t.label, { color: p.greenDeep, marginTop: space.s }]}>
        {reopened
          ? `Summited ${new Date(summitedOn).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}. ${reopened} ${reopened === 1 ? 'stop' : 'stops'} open again, whenever you like.`
          : allCooked
          ? cooked === recipeStops.length
            ? `You've cooked the whole trail. Summit reached!`
            : `Summit reached, your way. ${cooked} cooked along the trail.`
          : cooked === 0
            ? `${recipeStops.length} stops. Start at the bottom and take your time.`
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
                  <Text style={[t.hand, { color: p.ink, fontSize: 18, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple">{STRETCH_LABEL[stop.difficulty]}</Text>
                </View>
                <Blazes level={stop.difficulty} color={p.green} />
              </Animated.View>
            );
          }
          if (stop.kind === 'recipe') {
            const r = stop.recipe;
            const n = ++recipeIndex;
            const count = saved.cookedCount(r.slug);
            const isNext = r.slug === nextSlug;
            const isPassed = !count && saved.isPassed(region.id, r.slug);
            return (
              <Animated.View key={key} entering={enter} style={isNext ? styles.nextStop : undefined}>
                {isNext && <CookCat outline={p.ink} size={52} style={styles.waitingCat} />}
                <Pressable
                  onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                  accessibilityRole="button"
                  accessibilityLabel={`Stop ${n}: ${displayTitle(r)}, ${stop.difficulty}, ${r.totalText ?? ''}${isPassed ? ', passed by' : ''}`}
                  style={({ pressed }) => [styles.stop, { backgroundColor: tintFor(p, r.category), opacity: isPassed ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                >
                  <View style={[styles.node, { backgroundColor: count ? p.green : p.ground, borderColor: p.green }]}>
                    {count ? (
                      <CheckIcon color="#FFFFFF" size={14} />
                    ) : isPassed ? (
                      <Footprints color={p.greenDeep} />
                    ) : (
                      <Text style={[t.label, { color: p.greenDeep, fontFamily: font.sansBold }]}>{n}</Text>
                    )}
                  </View>
                  <Photo uri={r.image} width={76} radius={18} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                      {displayTitle(r)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
                      <Blazes level={stop.difficulty} color={p.green} />
                      <Text style={[t.label, { color: p.greenDeep, flexShrink: 0, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple">
                        {r.totalText}
                      </Text>
                      <CookedStamp count={count} color={p.greenDeep} />
                    </View>
                  </View>
                </Pressable>
                {(isNext || isPassed) && (
                  <Pressable
                    onPress={() => saved.togglePassed(region.id, r.slug)}
                    accessibilityRole="button"
                    accessibilityHint={isPassed ? 'Puts this stop back on your trail' : 'Moves on to the next stop without cooking this one'}
                    hitSlop={8}
                    style={[styles.pathLink, styles.chip, { borderColor: p.hairline }]}
                  >
                    <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>
                      {isPassed ? 'Passed by. Come back to it' : 'Not feeling this one? Take another path'}
                    </Text>
                  </Pressable>
                )}
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
          <View style={styles.summitRow}>
            <SummitFlag color={p.ink} />
            {!nextSlug && recipeStops.length > 0 && <CookCat outline={p.ink} size={56} mood="happy" />}
          </View>
          <Text style={[t.hand, { color: p.ink, fontSize: 22, alignSelf: 'stretch', textAlign: 'center' }]} numberOfLines={1} textBreakStrategy="simple">The summit</Text>
          {(hasPostcard || !!summitedOn) && (
            <View style={styles.postcard}>
              <TrailPostcard region={region} recipes={recipeStops.flatMap((s) => (s.kind === 'recipe' && saved.cookedCount(s.recipe.slug) > 0 ? [s.recipe] : []))} />
            </View>
          )}
          {extras.length > 0 && (
            <View style={styles.extras}>
              <Text style={[t.hand, { color: p.greenDeep }]} textBreakStrategy="simple">
                New since you started
              </Text>
              <Text style={[t.small, { color: p.muted }]}>Optional side trips. Your trail and your summit stay as they are.</Text>
              {extras.map((r) => (
                <Pressable
                  key={r.slug}
                  onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                  accessibilityRole="button"
                  accessibilityLabel={`Side trip: ${displayTitle(r)}`}
                  style={({ pressed }) => [styles.extra, { borderColor: p.hairline, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Photo uri={r.image} width={52} radius={14} />
                  <Text style={[t.rowTitle, { color: p.ink, flex: 1, fontSize: 16 }]} numberOfLines={2}>
                    {displayTitle(r)}
                  </Text>
                  {saved.cookedCount(r.slug) > 0 && <CheckIcon color={p.green} size={18} />}
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            onPress={() =>
              Linking.openURL(`mailto:cheapquickvegan@gmail.com?subject=${encodeURIComponent(`Recipe idea for "${region.trail}"`)}`).catch(() => {})
            }
            accessibilityRole="link"
            hitSlop={8}
            style={styles.suggest}
          >
            <Text style={[t.small, { color: p.muted, textAlign: 'center' }]}>
              Something you'd love to see on this trail?{' '}
              <Text style={{ color: p.greenDeep, textDecorationLine: 'underline' }}>Suggest a recipe</Text>
            </Text>
          </Pressable>
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
          <Text style={[t.rowTitle, { color: p.ink }]}>{stop.kind === 'lesson' ? stop.title : 'Stock up before you set off'}</Text>
        </View>
      </View>
      {stop.kind === 'lesson' ? (
        <Text style={[t.body, { color: p.ink }]}>{stop.body}</Text>
      ) : (
        <>
          <Text style={[t.body, { color: p.ink }]}>The next recipes share {joinList(stop.items)}. Grab them once and you're set.</Text>
          <View style={styles.shelf} accessible={false}>
            {stop.items.map((item) => (
              <View key={item} style={styles.shelfItem}>
                <IngredientDoodle line={item} color={p.ink} size={34} />
                <Text style={[t.small, { color: p.muted, textAlign: 'center' }]} numberOfLines={2}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
      {stop.guide && (
        <Pressable
          onPress={() => onOpenGuide(stop.guide!.slug)}
          accessibilityRole="link"
          accessibilityLabel={`Read the full guide: ${stop.guide.title}`}
          hitSlop={8}
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>
            {stop.kind === 'pantry' ? 'My pantry essentials guide →' : 'Read the full guide →'}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const joinList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const styles = StyleSheet.create({
  // Quiet actions that change your data (mark cooked, undo, reset) wear a small outline; underlined text only ever navigates.
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  chipText: { fontFamily: font.sansMedium },
  root: { padding: space.xl, paddingTop: space.s, paddingBottom: 64, gap: space.s },
  trail: { marginTop: space.xl, gap: space.l, paddingLeft: 30 },
  path: { position: 'absolute', left: 13, top: 0, bottom: 0 },
  signRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginLeft: -30, marginTop: space.m },
  signBoard: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, transform: [{ rotate: '-2deg' }] },
  stop: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 10, borderRadius: 24 },
  node: { position: 'absolute', left: -42, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rest: { borderWidth: 1.5, borderRadius: 24, padding: space.l, gap: space.s },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m, marginTop: space.xs },
  shelfItem: { width: 72, alignItems: 'center', gap: 2 },
  nextStop: { marginTop: 30 },
  extras: { alignSelf: 'stretch', marginLeft: 30, marginTop: space.xl, gap: space.s },
  extra: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderWidth: 1.5, borderRadius: 18, padding: space.s, minHeight: 52 },
  grade: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  pathLink: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s },
  suggest: { marginTop: space.l, marginLeft: 30, minHeight: 44, justifyContent: 'center', paddingHorizontal: space.l },
  postcard: { alignSelf: 'stretch', marginTop: space.l, marginLeft: 30 },
  summitRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.s },
  waitingCat: { position: 'absolute', right: 14, top: -36, zIndex: 1 },
  summit: { alignItems: 'center', gap: space.s, marginTop: space.l, marginLeft: -30 },
});
