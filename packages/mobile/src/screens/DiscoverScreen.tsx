import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { Peaks, StirringPot, Squiggle } from '../components/Doodles';
import { usePrefs } from '../lib/prefs';
import { GEAR } from '../components/GearDoodles';
import { CookedStamp } from '../components/CookedStamp';
import { HeartButton } from '../components/HeartButton';
import { Photo } from '../components/Photo';
import { Pill } from '../components/Pill';
import { TimePicker } from '../components/TimePicker';
import {
  displayTitle,
  equipmentCount,
  greeting,
  isWeekend,
  mealWord,
  projects,
  recipes,
  timeStep,
  TIME_OPTIONS,
  tonight,
  type Meal,
  type Recipe,
  type TimeLimit,
  widerLimit,
} from '../lib/recipes';
import { gradeLabel, journey, openHikes } from '../lib/journeys';
import { Blazes } from '../components/Blazes';
import { useDataVersion } from '../lib/data';
import { useSaved } from '../lib/saved';
import type { DiscoverStack } from '../navigation';
import { font, lift, space, spring, tintFor, type as t, usePalette, type Palette } from '../theme/tokens';

const GAP = 18;
const SIGN_GAP = 84;

type Props = NativeStackScreenProps<DiscoverStack, 'Discover'>;

export function DiscoverScreen({ navigation }: Props) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const saved = useSaved();
  const cardW = Math.min(width * 0.62, 270);
  const net = useNetInfo();
  const dataVersion = useDataVersion();
  const scroller = useRef<ScrollView>(null);
  const [limit, setLimit] = useState<TimeLimit>(30);
  const [gear, setGear] = useState<string | null>(null);
  const [meal, setMeal] = useState<Meal>(mealWord());

  const prefs = usePrefs();
  // What's planned for this week and not cooked yet, so the plan you made is the first thing you see.
  const weekToCook = saved.week
    .filter((w) => !saved.cookedThisWeek(w.slug))
    .map((w) => recipes.find((r) => r.slug === w.slug))
    .filter((r): r is Recipe => !!r);
  // Hikes you've started come first, then the easy ones, so there's always a gentle place to begin.
  const gradeOrder = { Easy: 0, Medium: 1, Challenge: 2 } as const;
  const hikeCards = openHikes()
    .map((region) => {
      const stops = journey(region).filter((st) => st.kind === 'recipe');
      const done = stops.filter((st) => st.kind === 'recipe' && saved.cookedCount(st.recipe.slug) > 0).length;
      const started = done > 0 && done < stops.length;
      return { region, stops, done, rank: (started ? 0 : 10) + gradeOrder[region.grade] };
    })
    .sort((x, y) => x.rank - y.rank);
  const matches = useMemo(() => tonight(limit, gear, meal).filter(prefs.fits), [limit, gear, meal, dataVersion, prefs.fits]);
  // The trail is a timeline: every match, quickest on the left.
  const featured = matches;
  // A signpost stands between two cards wherever the time steps up (30 min, 45 min, 1 hr…).
  const signs = featured.map((r, i) => {
    const next = featured[i + 1];
    return next && timeStep(next.totalMinutes) !== timeStep(r.totalMinutes) ? timeStep(next.totalMinutes) : null;
  });
  const offsets = featured.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + cardW + (signs[i - 1] ? SIGN_GAP : GAP));
    return acc;
  }, []);
  const wider = widerLimit(limit);
  const limitLabel = TIME_OPTIONS.find((o) => o.value === limit)?.label;
  const widerLabel =
    wider === undefined ? undefined : wider === null ? 'See every recipe' : `See ${TIME_OPTIONS.find((o) => o.value === wider)?.label} recipes`;
  const slow = useMemo(() => projects().filter(prefs.fits).slice(0, 8), [dataVersion, prefs.fits]);
  const open = (r: Recipe) => navigation.navigate('Recipe', { slug: r.slug });

  const otherMeal: Meal = meal === 'breakfast' ? 'dinner' : 'breakfast';
  const gearLabel = GEAR.find((g) => g.tag === gear)?.label;

  const pickGear = (tag: string) => {
    setGear(gear === tag ? null : tag);
    scroller.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
    <ScrollView ref={scroller} style={{ backgroundColor: p.ground }} contentContainerStyle={{ paddingTop: insets.top + space.xl, paddingBottom: 48 }}>
      <View style={styles.pad}>
        <Text style={[t.hand, { color: p.muted }]}>{greeting()}</Text>
        <Text style={[t.display, { color: p.ink, marginTop: 2 }]} accessibilityRole="header">
          What's for{'\n'}
          <Text style={{ fontFamily: font.serif }}>{meal}?</Text>
        </Text>
        <View style={{ marginTop: -4, marginBottom: 4 }} accessible={false}>
          <Squiggle key={meal} color={p.accent} width={meal.length * 21 + 16} />
        </View>
        <Pressable
          onPress={() => setMeal(otherMeal)}
          accessibilityRole="button"
          accessibilityLabel={`Show ${otherMeal} recipes instead`}
          hitSlop={10}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>Want {otherMeal} instead?</Text>
        </Pressable>
        {net.isConnected === false && (
          <Text style={[t.label, { color: p.greenDeep, marginTop: space.s }]}>You're offline. Saved recipes still open.</Text>
        )}
      </View>

      {weekToCook.length > 0 && (
        <View style={styles.week}>
          <View style={[styles.pad, styles.weekHead]}>
            <Text style={[t.label, { color: p.ink, flexShrink: 1, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple" accessibilityRole="header">
              This week · {weekToCook.length} to cook
            </Text>
            <Pressable onPress={() => navigation.getParent()?.navigate('SavedTab')} accessibilityRole="link" accessibilityLabel="See this week in Kitchen" hitSlop={10}>
              <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
            {weekToCook.map((r) => (
              <Pressable
                key={r.slug}
                onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                accessibilityRole="button"
                accessibilityLabel={`${displayTitle(r)}, planned this week`}
                style={({ pressed }) => [styles.weekChip, { backgroundColor: p.sand, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              >
                <Photo uri={r.image} width={40} height={40} radius={20} />
                <Text style={[t.label, { color: p.ink, maxWidth: 170 }]} numberOfLines={1}>
                  {displayTitle(r)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <TimePicker value={limit} onChange={setLimit} />
      </ScrollView>

      {featured.length === 0 ? (
        <View style={[styles.pad, { gap: space.m, marginTop: space.xl }]}>
          <Text style={[t.cardTitle, { color: p.ink }]}>Nothing under {limitLabel} yet</Text>
          <Text style={[t.body, { color: p.muted }]}>Most of my {meal === 'breakfast' ? 'breakfasts' : 'dinners'} take around 30 minutes. Give it a little more time and you'll have options.</Text>
          {widerLabel && <Pill label={widerLabel} selected onPress={() => setLimit(wider ?? null)} style={{ alignSelf: 'flex-start' }} />}
        </View>
      ) : (
        <>
          <View style={[styles.pad, styles.note]} accessible={false}>
            <Text style={[t.label, { color: p.greenDeep, paddingRight: 6 }]} numberOfLines={1} textBreakStrategy="simple">
              {featured.length} {featured.length === 1 ? 'recipe' : 'recipes'}
              {gearLabel ? ` with a ${gearLabel.toLowerCase()}` : ', quickest first'}
            </Text>
            {gearLabel && (
              <Pressable onPress={() => setGear(null)} accessibilityRole="button" accessibilityLabel={`Clear the ${gearLabel} filter`} hitSlop={10}>
                <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>Clear</Text>
              </Pressable>
            )}
            <Svg width={44} height={14} viewBox="0 0 44 14">
              <Path d="M2 8 C12 4 24 10 38 6 M32 2 L39 6 L33 11" stroke={p.greenDeep} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <FlatList
            key={`${limit}-${gear}-${meal}`}
            horizontal
            data={featured}
            keyExtractor={(r) => r.slug}
            showsHorizontalScrollIndicator={false}
            snapToOffsets={offsets}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.l, paddingBottom: space.l }}
            renderItem={({ item: r, index }) => (
              <TrailCard
                r={r}
                index={index}
                width={cardW}
                gapAfter={signs[index] ? SIGN_GAP : GAP}
                sign={signs[index]}
                onOpen={() => open(r)}
                saved={saved.isSaved(r.slug)}
                onSave={() => saved.toggle(r.slug)}
                cooked={saved.cookedCount(r.slug)}
              />
            )}
            ListFooterComponent={
              <View style={[styles.endStop, { width: cardW * 0.8 }]}>
                <StirringPot color={p.ink} size={96} />
                <Text style={[t.hand, { color: p.ink, textAlign: 'center' }]}>
                  {widerLabel ? `That's everything under ${limitLabel}.` : "That's every recipe. Happy cooking!"}
                </Text>
                {widerLabel && (
                  <Pill label={`${widerLabel} →`} selected onPress={() => setLimit(wider ?? null)} />
                )}
              </View>
            }
          />
        </>
      )}

      <View style={{ marginTop: space.xl }}>
        <View style={styles.pad}>
          <Text style={[t.section, { color: p.ink }]} accessibilityRole="header">
            Cooking journeys
          </Text>
          <Text style={[t.hand, { color: p.muted, marginTop: 2 }]}>New to a cuisine? Pick a hike, from an easy stroll to a summit climb.</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slowRow}>
          <Pressable
            onPress={() => navigation.navigate('JourneyMap')}
            accessibilityRole="button"
            accessibilityLabel="Open the trail map"
            style={({ pressed }) => [styles.journey, styles.mapCard, { borderColor: p.ink, backgroundColor: p.ground, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <Peaks color={p.ink} width={130} />
            <Text style={[t.hand, { color: p.greenDeep, fontSize: 17 }]}>All the hikes</Text>
            <Text style={[t.rowTitle, { color: p.ink }]}>Open the trail map</Text>
          </Pressable>
          {hikeCards.map(({ region, stops, done }, i) => {
            return (
              <Pressable
                key={region.id}
                onPress={() => navigation.navigate('Journey', { id: region.id })}
                accessibilityRole="button"
                accessibilityLabel={`${region.trail}, ${region.name}, ${stops.length} recipes, ${done} cooked`}
                style={({ pressed }) => [
                  styles.journey,
                  { backgroundColor: [p.greenSoft, p.sand, p.sageSoft, p.mist][i % 4], transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <Text style={[t.hand, { color: p.greenDeep, fontSize: 17 }]}>{region.name}</Text>
                <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                  {region.trail}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
                  <Blazes level={region.grade} color={p.green} />
                  <Text style={[t.small, { color: p.muted }]}>
                    {done ? `${done} of ${stops.length} cooked` : `${gradeLabel(region)}, ${stops.length} ${stops.length === 1 ? 'stop' : 'stops'}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.pad, { marginTop: space.xl }]}>
        <Text style={[t.section, { color: p.ink }]} accessibilityRole="header">
          What's on your counter?
        </Text>
        <Text style={[t.hand, { color: p.muted, marginTop: 2 }]}>Tap what you've got and I'll show what it can make.</Text>
        <View style={styles.gearGrid}>
          {GEAR.filter((g) => !prefs.missingGear.includes(g.tag)).map(({ tag, label, Doodle }, i) => {
            const on = gear === tag;
            const count = equipmentCount(tag, limit, meal);
            const bg = [p.greenSoft, p.sageSoft, p.sand][i % 3];
            return (
              <GearTile
                key={tag}
                index={i}
                onPress={() => pickGear(tag)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${label}, ${count === 0 ? `nothing this quick` : `${count} recipes`}`}
                style={[styles.gear, { backgroundColor: bg, borderColor: on ? p.greenDeep : 'transparent' }]}
                doodle={<Doodle color={p.ink} />}
              >
                <Text style={[t.label, { color: p.ink, textAlign: 'center', alignSelf: 'stretch' }]} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={[t.label, { color: p.greenDeep, alignSelf: 'stretch', textAlign: 'center' }]} numberOfLines={1}>
                  {count === 0 ? `none this quick` : `${count} ${count === 1 ? 'recipe' : 'recipes'}`}
                </Text>
              </GearTile>
            );
          })}
        </View>
      </View>

      {slow.length > 0 && (
        <View style={{ marginTop: space.xxl }}>
          <View style={styles.pad}>
            <Text style={[t.section, { color: p.ink }]} accessibilityRole="header">
              {isWeekend() ? 'For a slow weekend' : 'When you have more time'}
            </Text>
            <Text style={[t.hand, { color: p.muted, marginTop: 2 }]}>Breads, soups and bigger cooks. Worth the wait.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slowRow}>
            {slow.map((r) => (
              <Pressable
                key={r.slug}
                onPress={() => open(r)}
                accessibilityRole="button"
                accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}`}
                style={({ pressed }) => [{ width: 150, gap: 6, opacity: pressed ? 0.8 : 1 }]}
              >
                <Photo uri={r.image} width={150} height={150} radius={22} />
                <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                  {displayTitle(r)}
                </Text>
                <Text style={[t.label, { color: p.greenDeep }]}>{r.totalText}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
    <View pointerEvents="none" style={[styles.statusBand, { height: insets.top, backgroundColor: p.ground }]} />
    </View>
  );
}

type CardProps = {
  r: Recipe;
  index: number;
  width: number;
  gapAfter: number;
  sign: string | null;
  onOpen: () => void;
  saved: boolean;
  onSave: () => void;
  cooked: number;
};

/** A recipe card standing on the dotted trail, held up by its own mile marker showing the time. */
function TrailCard({ r, index, width, gapAfter, sign, onOpen, saved, onSave, cooked }: CardProps) {
  const p = usePalette();
  const title = displayTitle(r);
  const photoW = width - 20;
  const tilt = index % 2 ? 1.2 : -1.2;
  const reduce = useReducedMotion();
  // Pressing straightens the pinned card and lifts it a touch.
  const press = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt * (1 - press.value)}deg` }, { scale: 1 + press.value * 0.02 }],
  }));
  // The dotted trail draws itself in from the left after the card lands.
  const line = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!reduce) line.value = withDelay(200 + Math.min(index, 4) * 60, withTiming(1, { duration: 450 }));
  }, [reduce, index, line]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: line.value }], opacity: line.value }));
  return (
    <Animated.View entering={FadeIn.duration(280).delay(Math.min(index, 4) * 50)} style={{ width: width + gapAfter }}>
      <Pressable
        onPress={onOpen}
        onPressIn={() => !reduce && (press.value = withSpring(1, spring))}
        onPressOut={() => (press.value = withSpring(0, spring))}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${r.totalText ?? ''}`}
      >
      <Animated.View style={[styles.card, { width, backgroundColor: tintFor(p, r.category) }, lift(p), reduce ? { transform: [{ rotate: `${tilt}deg` }] } : cardStyle]}>
        <View>
          <Photo uri={r.image} width={photoW} height={photoW * 0.86} radius={18} />
          <View style={styles.heart}>
            <HeartButton saved={saved} onToggle={onSave} label={title} size={40} />
          </View>
          <CookedStamp count={cooked} color="#2B2A24" style={styles.stamp} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[t.cardTitle, { color: p.ink, minHeight: t.cardTitle.lineHeight * 2 }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[t.small, { color: p.muted }]} numberOfLines={1}>
            {[r.category, r.yieldText].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </Animated.View>
      </Pressable>

      <View style={styles.stop} accessible={false}>
        <Animated.View pointerEvents="none" style={[styles.trail, { width: width + gapAfter, transformOrigin: 'left' }, lineStyle]}>
          <Svg width={width + gapAfter} height={4}>
            <Line x1="0" y1="2" x2={width + gapAfter} y2="2" stroke={p.green} strokeWidth={2.5} strokeDasharray="1 8" strokeLinecap="round" />
          </Svg>
        </Animated.View>
        <View style={[styles.marker, { width }]}>
          <View style={[styles.markerPost, { backgroundColor: p.ink, height: 14 }]} />
          <View style={[styles.markerBoard, { borderColor: p.ink, backgroundColor: p.sand }]}>
            <Text style={[t.label, { color: p.ink }]} numberOfLines={1}>
              {r.totalMinutes} min
            </Text>
          </View>
          <View style={[styles.markerPost, { backgroundColor: p.ink, height: 10 }]} />
        </View>
      </View>
      {sign && <Signpost p={p} label={sign} left={width + (gapAfter - 72) / 2} />}
    </Animated.View>
  );
}

/** An ink signpost planted on the trail where the time steps up. */
function Signpost({ p, label, left }: { p: Palette; label: string; left: number }) {
  const reduce = useReducedMotion();
  const sway = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    sway.value = withDelay(500, withSequence(withTiming(-7, { duration: 180 }), withSpring(0, { damping: 4, stiffness: 120 })));
  }, [reduce, sway]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.value}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sign, { left, transformOrigin: 'bottom' }, style]} accessible={false}>
      <View style={[styles.board, { borderColor: p.ink, backgroundColor: p.sand }]}>
        <Text style={[t.hand, { color: p.ink, fontSize: 16, lineHeight: 18 }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={[styles.post, { backgroundColor: p.ink }]} />
    </Animated.View>
  );
}

type GearTileProps = {
  index: number;
  onPress: () => void;
  doodle: React.ReactNode;
  style: object;
  children: React.ReactNode;
  accessibilityRole: 'button';
  accessibilityState: { selected: boolean };
  accessibilityLabel: string;
};

/** An equipment tile, tilted like a sticker. Its doodle gives a little wiggle when tapped. */
function GearTile({ index, onPress, doodle, style, children, ...a11y }: GearTileProps) {
  const reduce = useReducedMotion();
  const wiggle = useSharedValue(0);
  const scale = useSharedValue(1);
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${index % 2 ? 1.5 : -1.5}deg` }, { scale: scale.value }] }));
  const doodleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wiggle.value}deg` }] }));
  return (
    <Pressable
      {...a11y}
      onPress={() => {
        if (!reduce) wiggle.value = withSequence(withTiming(-9, { duration: 70 }), withTiming(8, { duration: 90 }), withTiming(-5, { duration: 80 }), withSpring(0, spring));
        onPress();
      }}
      onPressIn={() => (scale.value = withSpring(0.95, spring))}
      onPressOut={() => (scale.value = withSpring(1, spring))}
      style={{ width: '31%' }}
    >
      <Animated.View style={[style, { width: '100%' }, tileStyle]}>
        <Animated.View style={doodleStyle}>{doodle}</Animated.View>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.xl },
  endStop: { alignItems: 'center', justifyContent: 'center', gap: space.s, paddingBottom: 40 },
  statusBand: { position: 'absolute', top: 0, left: 0, right: 0 },
  filters: { paddingHorizontal: space.xl, gap: space.s, marginTop: space.m },
  week: { marginTop: space.l, gap: space.s },
  weekHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekRow: { paddingHorizontal: space.xl, gap: space.s },
  weekChip: { flexDirection: 'row', alignItems: 'center', gap: space.s, padding: 6, paddingRight: space.l, borderRadius: 26, minHeight: 52 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.l },
  card: { borderRadius: 26, padding: 10 },
  cardBody: { paddingHorizontal: 8, paddingTop: space.m, paddingBottom: space.s, gap: 4 },
  heart: { position: 'absolute', right: 10, top: 10 },
  stamp: { position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(247,243,234,0.92)' },
  stop: { marginTop: 2 },
  trail: { position: 'absolute', left: 0, top: 27 },
  marker: { alignItems: 'center' },
  markerPost: { width: 3, borderRadius: 2 },
  markerBoard: { borderWidth: 2, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 },
  gearGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.m, marginTop: space.l },
  gear: { alignItems: 'center', gap: 4, paddingVertical: space.m, paddingHorizontal: 4, borderRadius: 20, borderWidth: 2 },
  sign: { position: 'absolute', bottom: 22, width: 72, alignItems: 'center' },
  board: { borderWidth: 2, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, transform: [{ rotate: '-4deg' }] },
  post: { width: 2.5, height: 34, borderRadius: 2 },
  journey: { width: 190, borderRadius: 24, padding: space.l, gap: 6 },
  mapCard: { borderWidth: 2, borderStyle: 'dashed' },
  slowRow: { paddingHorizontal: space.xl, gap: space.l, paddingTop: space.l },
});
