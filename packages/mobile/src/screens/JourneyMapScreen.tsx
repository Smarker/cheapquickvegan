import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { BackHandler, Image, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { Blazes } from '../components/Blazes';
import { CookCat } from '../components/CookCat';
import { Pill } from '../components/Pill';
import { AREAS, gradeLabel, journey, openHikes, type Area, type Difficulty, type Region } from '../lib/journeys';
import { useDataVersion } from '../lib/data';
import { displayTitle, recipes } from '../lib/recipes';
import { useSaved } from '../lib/saved';
import { CLOSE_UPS, LAND } from '../lib/reliefData';
import { closeUpBox, CLOSE_UP_ZOOM, projection, REF_W, WORLD_MAPS, type LonLat, type Projected, type WorldMap } from '../lib/worldMaps';
import { font, space, type as t, usePalette, type Palette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ JourneyMap: undefined; Journey: { id: string }; Recipe: { slug: string } }, 'JourneyMap'>;

type Pt = Projected;
const GRADES: Difficulty[] = ['Easy', 'Medium', 'Challenge'];
const AnimatedG = Animated.createAnimatedComponent(G);
// Each map inks itself in the first time it's shown in a session; after that it's already drawn.
const inkedThisSession = new Set<string>();
// The cuisine last picked, so coming back to the map shows the same one.
let lastArea: string | undefined;

/** 0 to 1 over the slice [from, to] of a progress value. */
const slice = (v: number, from: number, to: number) => {
  'worklet';
  return interpolate(v, [from, to], [0, 1], Extrapolation.CLAMP);
};

const f = (n: number) => n.toFixed(1);

/** A point along a cubic curve. */
const along = (a: Pt, b: Pt, c: Pt, d: Pt, k: number): Pt => {
  const u = 1 - k;
  return {
    x: u ** 3 * a.x + 3 * u * u * k * b.x + 3 * u * k * k * c.x + k ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u * u * k * b.y + 3 * u * k * k * c.y + k ** 3 * d.y,
  };
};

type Trail = { start: Pt; c1: Pt; c2: Pt; end: Pt; d: string; label: string };

/** A hike's trail: from its trailhead, a gentle S-curve in to the real place it's named after. */
function trailFor(map: WorldMap, at: (p: LonLat) => Pt, W: number, id: string): Trail | null {
  const spot = map.hikes[id];
  if (!spot) return null;
  // Lengths are given for a map REF_W wide and scale with it, so a trail covers the same ground on any screen.
  const u = W / REF_W;
  const len = spot.length * u;
  const e0 = at(spot.at);
  const end = { x: e0.x + (spot.nudge?.[0] ?? 0) * u, y: e0.y + (spot.nudge?.[1] ?? 0) * u };
  const a = (spot.from * Math.PI) / 180;
  const start = { x: end.x + len * Math.cos(a), y: end.y + len * Math.sin(a) };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const px = -dy / len;
  const py = dx / len;
  const c1 = { x: start.x + dx * 0.33 + px * 10 * u, y: start.y + dy * 0.33 + py * 10 * u };
  const c2 = { x: start.x + dx * 0.66 - px * 10 * u, y: start.y + dy * 0.66 - py * 10 * u };
  return { label: spot.label, start, c1, c2, end, d: `M${f(start.x)} ${f(start.y)} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(end.x)} ${f(end.y)}` };
}

/**
 * The trail map: each cuisine's real corner of the world, drawn as a relief map with its mountains
 * raised in contour bands. Each hike walks in from its own trailhead to the place it's named after.
 * Stops fill in as you cook, flags go green at the summit, and the cat waits on the hike you're
 * partway through. The first time, each map inks itself in as it scrolls into view; tapping a hike
 * leans the map in towards it before the journey opens.
 */
export function JourneyMapScreen({ navigation }: Props) {
  const p = usePalette();
  const saved = useSaved();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const dataVersion = useDataVersion();
  const W = width - space.xl * 2;
  // Working out the hikes grades every recipe, so do it once per data change, not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allHikes = useMemo(() => openHikes(), [dataVersion]);
  const hikes = useMemo(() => {
    return new Map(allHikes.map((h) => [h.id, journey(h, saved.trailFor(h.id)).flatMap((s) => (s.kind === 'recipe' ? [s.recipe.slug] : []))]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allHikes, saved]);

  const behind = (h: Region, slug: string) => saved.cookedCount(slug) > 0 || saved.isPassed(h.id, slug);
  // The cat waits on the first hike you've started but not summited.
  const current = [...hikes.entries()].find(([id, slugs]) => {
    if (saved.summits[id]) return false;
    const h = allHikes.find((x) => x.id === id)!;
    const done = slugs.filter((s) => behind(h, s)).length;
    return done > 0 && done < slugs.length;
  })?.[0];

  const areas = AREAS.map((area) => ({
    area,
    hikes: GRADES.map((g) => allHikes.find((h) => h.area === area.id && h.grade === g)).filter((h): h is Region => !!h),
  })).filter((a) => a.hikes.length > 0 && WORLD_MAPS[a.area.id]);

  // Only one map at a time: the cuisine picked last, else the one with a hike underway, else the first.
  const [picked, setPicked] = useState(() => lastArea ?? allHikes.find((h) => h.id === current)?.area);
  const shown = areas.find((a) => a.area.id === picked) ?? areas[0];
  const pick = (id: string) => {
    lastArea = id;
    setPicked(id);
  };
  const shownId = shown?.area.id;
  useEffect(() => {
    if (shownId) inkedThisSession.add(shownId);
  }, [shownId]);

  // Where each map sits on the page, measured once laid out, so it knows when it scrolls into view.
  const [blockY, setBlockY] = useState<Record<string, number>>({});
  const [mapY, setMapY] = useState<Record<string, number>>({});
  const topOf = (id: string) => (blockY[id] != null && mapY[id] != null ? blockY[id] + mapY[id] : -1);

  const scrollY = useSharedValue(0);
  const viewH = useSharedValue(800);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // The camera: tapping a hike leans in towards it, then the journey opens. Coming back pulls out.
  const zoom = useSharedValue(0);
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const camera = useAnimatedStyle(() => {
    const z = zoom.value;
    const s = 1 + 1.5 * z;
    const cx = width / 2;
    const cy = scrollY.value + viewH.value / 2;
    return {
      transform: [{ translateX: z * (cx - focusX.value * s) }, { translateY: z * (cy - focusY.value * s) }, { scale: s }],
    };
  });
  const veil = useAnimatedStyle(() => ({ opacity: slice(zoom.value, 0.55, 1) }));
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        if (zoom.value > 0) zoom.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
      }),
    [navigation, zoom],
  );

  const open = (h: Region, focus: Pt) => {
    if (reduce) return navigation.navigate('Journey', { id: h.id });
    focusX.value = focus.x;
    focusY.value = focus.y;
    zoom.value = withTiming(1, { duration: 520, easing: Easing.bezier(0.45, 0, 0.2, 1) });
    setTimeout(() => navigation.navigate('Journey', { id: h.id }), 470);
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }} onLayout={(e) => (viewH.value = e.nativeEvent.layout.height)}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} style={{ backgroundColor: p.ground }}>
        <Animated.View style={[styles.root, { transformOrigin: [0, 0, 0] }, camera]}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: space.s }}>
              <Text style={[t.hand, { color: p.greenDeep }]}>Every journey</Text>
              <Text style={[t.title, { color: p.ink }]} accessibilityRole="header">
                Pick a cuisine
              </Text>
            </View>
            <Compass p={p} />
          </View>
          <Text style={[t.body, { color: p.muted }]}>
            Each cuisine has a few journeys, from easy dishes to weekend projects. Start wherever you like.
          </Text>

          {areas.length > 1 && (
            <View style={styles.picker} accessibilityRole="tablist">
              {areas.map(({ area }) => (
                <Pill key={area.id} label={area.short} role="tab" selected={area.id === shown?.area.id} onPress={() => pick(area.id)} />
              ))}
            </View>
          )}

          {(shown ? [shown] : []).map(({ area, hikes: areaHikes }) => {
            const map = WORLD_MAPS[area.id];
            // The map runs the full width of the screen; its edges dissolve into the page.
            const MW = width;
            const proj = projection(map, MW);
            const top = topOf(area.id);
            const focusFor = (h: Region) => {
              const tr = trailFor(map, proj.at, MW, h.id);
              return { x: tr?.end.x ?? MW / 2, y: (top < 0 ? 0 : top) + (tr?.end.y ?? proj.height / 2) };
            };
            return (
              <View
                key={area.id}
                style={styles.area}
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  setBlockY((b) => (b[area.id] === y ? b : { ...b, [area.id]: y }));
                }}
              >
                <Text style={[t.hand, { color: p.greenDeep, fontSize: 22, paddingRight: 4 }]} textBreakStrategy="simple">
                  {area.name}
                </Text>
                <View
                  style={{ width: MW, height: proj.height, marginHorizontal: -space.xl }}
                  onLayout={(e) => {
                    // The map's top on the page is its block's place plus its own place inside the block.
                    const y = e.nativeEvent.layout.y;
                    setMapY((b) => (b[area.id] === y ? b : { ...b, [area.id]: y }));
                  }}
                >
                  <ReliefMap
                    p={p}
                    area={area}
                    map={map}
                    W={MW}
                    proj={proj}
                    hikes={areaHikes}
                    slugsFor={(h) => hikes.get(h.id) ?? []}
                    behind={behind}
                    summited={(h) => !!saved.summits[h.id]}
                    current={current}
                    top={top}
                    scrollY={scrollY}
                    viewH={viewH}
                    inked={reduce || inkedThisSession.has(area.id)}
                    onOpen={(h) => navigation.navigate('Journey', { id: h.id })}
                    cooked={(slug) => saved.cookedCount(slug) > 0}
                    inWeek={saved.inWeek}
                    toggleWeek={saved.toggleWeek}
                    onRecipe={(slug) => navigation.navigate('Recipe', { slug })}
                  />
                </View>

                {areaHikes.map((h) => (
                  <HikeRow
                    key={h.id}
                    hike={h}
                    slugs={hikes.get(h.id) ?? []}
                    p={p}
                    behind={(s) => behind(h, s)}
                    summited={!!saved.summits[h.id]}
                    onPress={() => open(h, focusFor(h))}
                  />
                ))}
              </View>
            );
          })}
          {/* The elevation data's sources ask for credit. */}
          <Text style={[t.small, { color: p.muted, marginTop: space.l }]}>Elevation data: Terrain Tiles (SRTM, GMTED2010, ETOPO1).</Text>
        </Animated.View>
      </Animated.ScrollView>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: p.ground }, veil]} />
    </View>
  );
}

type ReliefProps = {
  p: Palette;
  area: Area;
  map: WorldMap;
  W: number;
  proj: ReturnType<typeof projection>;
  hikes: Region[];
  slugsFor: (h: Region) => string[];
  behind: (h: Region, slug: string) => boolean;
  summited: (h: Region) => boolean;
  current: string | undefined;
  top: number;
  scrollY: SharedValue<number>;
  viewH: SharedValue<number>;
  inked: boolean;
  /** Opens a hike's journey, from its close-up. */
  onOpen: (h: Region) => void;
  cooked: (slug: string) => boolean;
  inWeek: (slug: string) => boolean;
  toggleWeek: (slug: string) => void;
  onRecipe: (slug: string) => void;
};

/** A trail moved into a close-up: the part of the map at `box` blown up to fill the map's whole size. */
function zoomTrail(tr: Trail, ox: number, oy: number, z: number): Trail {
  const m = (q: Pt) => ({ x: (q.x - ox) * z, y: (q.y - oy) * z });
  const [start, c1, c2, end] = [m(tr.start), m(tr.c1), m(tr.c2), m(tr.end)];
  return { label: tr.label, start, c1, c2, end, d: `M${f(start.x)} ${f(start.y)} C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(end.x)} ${f(end.y)}` };
}

/**
 * One area's relief map, painted from real elevation data: the shallows, the coast, each step of land
 * up to the snowline with a hairline contour, and a hillshade lit from the northwest, dissolving into
 * the page at its edges. The first time it scrolls into view the land fades in, then each hike appears,
 * easiest first. Tapping a hike zooms the map in on it, to a sharper close-up of its own ground.
 */
function ReliefMap({ p, area, map, W, proj, hikes, slugsFor, behind, summited, current, top, scrollY, viewH, inked, onOpen, cooked, inWeek, toggleWeek, onRecipe }: ReliefProps) {
  const H = proj.height;
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const reduce = useReducedMotion();

  const ink = useSharedValue(inked ? 1 : 0);
  const started = useSharedValue(inked);
  useAnimatedReaction(
    () => top >= 0 && scrollY.value + viewH.value > top + 90,
    (visible) => {
      if (!visible || started.value) return;
      started.value = true;
      ink.value = withDelay(200, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
    },
    [top],
  );
  // A map already on screen when its place is first measured starts at once, without waiting for a scroll.
  useEffect(() => {
    if (top < 0 || started.value || scrollY.value + viewH.value <= top + 90) return;
    started.value = true;
    ink.value = withDelay(250, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
  }, [top, started, ink, scrollY, viewH]);
  // The land fades in as a plain view, so the phone fades a finished picture instead of redrawing the map.
  const ground = useAnimatedStyle(() => ({ opacity: slice(ink.value, 0, 0.45) }));

  // The close-up: the map grows around the one point that stays put, until the hike's box fills it,
  // and the sharper picture of that ground fades in over it.
  const Z = CLOSE_UP_ZOOM;
  const [focus, setFocus] = useState<Region | null>(null);
  // The stop picked in the close-up, shown as a preview card.
  const [stop, setStop] = useState<{ hike: Region; slug: string } | null>(null);
  const zoom = useSharedValue(0);
  const drawn = useSharedValue(1);
  const box = focus ? closeUpBox(map, focus.id) : null;
  const ox = (box?.x ?? 0) * W;
  const oy = (box?.y ?? 0) * H;
  const lens = useAnimatedStyle(() => ({ opacity: 1 - slice(zoom.value, 0.4, 0.9), transform: [{ scale: 1 + (Z - 1) * zoom.value }] }));
  const closeStyle = useAnimatedStyle(() => ({ opacity: slice(zoom.value, 0.3, 0.85) }));
  const zoomIn = (h: Region) => {
    setFocus(h);
    // Load the stops' photos while the map zooms, so each preview opens with its photo ready.
    ExpoImage.prefetch(hikes.flatMap((x) => slugsFor(x)).flatMap((slug) => recipes.find((r) => r.slug === slug)?.image ?? []));
    zoom.value = withTiming(1, { duration: reduce ? 0 : 600, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  };
  const zoomOut = () => {
    setStop(null);
    zoom.value = withTiming(0, { duration: reduce ? 0 : 480, easing: Easing.out(Easing.cubic) });
    setTimeout(() => setFocus(null), reduce ? 0 : 500);
  };
  useEffect(() => {
    if (!focus) return;
    // Back closes the preview first, then the close-up.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stop) setStop(null);
      else zoomOut();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, stop]);

  const trails = hikes.map((h) => ({ h, tr: trailFor(map, proj.at, W, h.id) }));
  // A stop low in the close-up would hide under the preview, so then the preview sits at the top instead.
  const stopIsLow = (() => {
    const tr = stop && trails.find(({ h }) => h.id === stop.hike.id)?.tr;
    if (!stop || !tr) return false;
    const z = zoomTrail(tr, ox, oy, Z);
    const slugs = slugsFor(stop.hike);
    const pt = along(z.start, z.c1, z.c2, z.end, (slugs.indexOf(stop.slug) + 1) / (slugs.length + 1));
    return pt.y > H - 150;
  })();
  // The cat waits at the next stop on the hike you're partway through. It sits outside the zoom and
  // follows its stop through it, so it stays on the trail at its own size instead of growing with the map.
  const catAt = (() => {
    const cur = trails.find(({ h }) => h.id === current);
    if (!cur?.tr) return null;
    const slugs = slugsFor(cur.h);
    const k = slugs.findIndex((s) => !behind(cur.h, s));
    return along(cur.tr.start, cur.tr.c1, cur.tr.c2, cur.tr.end, (k + 1) / (slugs.length + 1));
  })();
  const fx = (Z * ox) / (Z - 1);
  const fy = (Z * oy) / (Z - 1);
  const catX = catAt?.x ?? 0;
  const catY = catAt?.y ?? 0;
  const catStyle = useAnimatedStyle(() => {
    const k = 1 + (Z - 1) * zoom.value;
    return { opacity: slice(ink.value, 0.9, 1), transform: [{ translateX: fx + k * (catX - fx) }, { translateY: fy + k * (catY - fy) }] };
  });

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* The map grows around the one point that stays put, chosen so the hike's box ends up filling the map. */}
      <Animated.View style={[{ width: W, height: H, transformOrigin: [fx, fy, 0] }, lens]}>
        <Animated.Image source={LAND[area.id][scheme]} style={[{ width: W, height: H }, ground]} resizeMode="stretch" fadeDuration={0} />
        {/* The hikes sit on top in plain points, so their trails, stops and flags stay crisp at any map size. */}
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {trails.map(({ h, tr }, i) =>
            tr ? <Hike key={h.id} p={p} h={h} k={i} W={W} ink={ink} trail={tr} slugs={slugsFor(h)} behind={(s) => behind(h, s)} summited={summited(h)} onOpen={() => zoomIn(h)} /> : null,
          )}
        </Svg>
      </Animated.View>

      {focus && CLOSE_UPS[focus.id] && (
        <Animated.View style={[StyleSheet.absoluteFill, closeStyle]}>
          <Image source={CLOSE_UPS[focus.id][scheme]} style={{ width: W, height: H }} resizeMode="stretch" fadeDuration={0} />
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            {trails.map(({ h, tr }, i) =>
              tr ? (
                <Hike
                  key={h.id}
                  p={p}
                  h={h}
                  k={i}
                  W={W}
                  ink={drawn}
                  trail={zoomTrail(tr, ox, oy, Z)}
                  slugs={slugsFor(h)}
                  behind={(s) => behind(h, s)}
                  summited={summited(h)}
                  onOpen={() => onOpen(h)}
                  picked={stop?.hike.id === h.id ? stop.slug : undefined}
                  onStop={(slug) => setStop((cur) => (cur?.slug === slug && cur.hike.id === h.id ? null : { hike: h, slug }))}
                />
              ) : null,
            )}
          </Svg>
          {stop ? (
            <StopCard
              // A fresh card for each stop, so the last stop's photo never lingers while the next one loads.
              key={stop.slug}
              p={p}
              slug={stop.slug}
              n={slugsFor(stop.hike).indexOf(stop.slug) + 1}
              of={slugsFor(stop.hike).length}
              cooked={cooked(stop.slug)}
              inWeek={inWeek(stop.slug)}
              onWeek={() => toggleWeek(stop.slug)}
              atTop={stopIsLow}
              onOpen={() => onRecipe(stop.slug)}
              onClose={() => setStop(null)}
            />
          ) : (
            <View style={styles.closeBar} pointerEvents="box-none">
              <Pill label="← Back to map" onPress={zoomOut} />
              <Pill label="Open journey →" selected onPress={() => onOpen(focus)} accessibilityLabel={`Open ${focus.trail}`} />
            </View>
          )}
        </Animated.View>
      )}
      {catAt && (
        <Animated.View pointerEvents="none" style={[styles.cat, catStyle]}>
          <CookCat outline={p.ink} size={36} />
        </Animated.View>
      )}
    </View>
  );
}

type HikeProps = {
  p: Palette;
  h: Region;
  k: number;
  W: number;
  ink: SharedValue<number>;
  trail: Trail;
  slugs: string[];
  behind: (slug: string) => boolean;
  summited: boolean;
  onOpen: () => void;
  /** In a close-up, the stops can be tapped for a preview; `picked` is the one showing. */
  onStop?: (slug: string) => void;
  picked?: string;
};

/**
 * A hike drawn the way a survey map marks a footpath: a dashed ink line on a pale casing, small dots
 * for each stop (cooked ones filled), an open circle at the trailhead, and a peak marker with the
 * place's name where the hike ends.
 */
function Hike({ p, k, W, ink, trail, slugs, behind, summited, onOpen, onStop, picked }: HikeProps) {
  const from = 0.55 + k * 0.1;
  const show = useAnimatedProps(() => ({ opacity: slice(ink.value, from, from + 0.18) }));
  const { start: s, end: e } = trail;
  // The name sits beside the peak, on whichever side has room.
  const right = e.x < W * 0.62;
  const lx = e.x + (right ? 9 : -9);
  const label = { x: lx, y: e.y + 4, fontSize: 11, fontFamily: font.sansMedium, textAnchor: right ? ('start' as const) : ('end' as const) };
  return (
    <AnimatedG animatedProps={show}>
      {/* casing, then the dashed path on top */}
      <Path d={trail.d} stroke={p.shelf} strokeOpacity={0.9} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d={trail.d} stroke={p.ink} strokeWidth={1.6} strokeDasharray="5 3" strokeLinecap="round" fill="none" />
      {/* a wide invisible stroke so the trail itself can be tapped */}
      <Path d={trail.d} stroke="transparent" strokeWidth={28} fill="none" onPress={onOpen} />
      <Circle cx={s.x} cy={s.y} r={3.5} fill={p.shelf} stroke={p.ink} strokeWidth={1.4} />
      {slugs.map((slug, i) => {
        const pt = along(trail.start, trail.c1, trail.c2, trail.end, (i + 1) / (slugs.length + 1));
        return (
          <G key={slug}>
            {picked === slug && <Circle cx={pt.x} cy={pt.y} r={7.5} fill="none" stroke={p.ink} strokeWidth={1.6} />}
            <Circle cx={pt.x} cy={pt.y} r={picked === slug ? 4 : 2.8} fill={behind(slug) ? p.green : p.shelf} stroke={p.ink} strokeWidth={1.1} />
            {/* a generous invisible target, so a small stop is easy to tap */}
            {onStop && <Circle cx={pt.x} cy={pt.y} r={16} fill="transparent" onPress={() => onStop(slug)} />}
          </G>
        );
      })}
      {/* the peak marker: a small triangle, green once you've reached it */}
      <Path
        d={`M${f(e.x - 6)} ${f(e.y + 4.5)} L${f(e.x)} ${f(e.y - 6)} L${f(e.x + 6)} ${f(e.y + 4.5)} Z`}
        fill={summited ? p.green : p.ink}
        stroke={p.shelf}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* the place name, with a halo so it reads over the hillshade */}
      <SvgText {...label} stroke={p.shelf} strokeWidth={3} strokeLinejoin="round" fill={p.shelf}>
        {trail.label}
      </SvgText>
      <SvgText {...label} fill={p.ink}>
        {trail.label}
      </SvgText>
    </AnimatedG>
  );
}

type StopCardProps = {
  p: Palette;
  slug: string;
  n: number;
  of: number;
  cooked: boolean;
  inWeek: boolean;
  onWeek: () => void;
  atTop: boolean;
  onOpen: () => void;
  onClose: () => void;
};

/** A preview of the recipe at one stop on a hike, tucked into the bottom of the close-up. */
function StopCard({ p, slug, n, of, cooked, inWeek, onWeek, atTop, onOpen, onClose }: StopCardProps) {
  // The button flips the moment it's tapped; saving the week can take a beat while other screens catch up.
  const [shownInWeek, setShownInWeek] = useState(inWeek);
  useEffect(() => setShownInWeek(inWeek), [inWeek]);
  const r = recipes.find((x) => x.slug === slug);
  if (!r) return null;
  const meta = [`Stop ${n} of ${of}`, r.totalText ?? null, cooked ? 'Cooked' : null].filter(Boolean).join(' · ');
  return (
    <View style={[styles.card, atTop ? { top: space.l } : { bottom: space.l }, { backgroundColor: p.ground, borderColor: p.hairline }]}>
      {/* Each part is its own button (not one inside another), so a tap on the week action isn't swallowed. */}
      {/* The photo runs the card's full height, flush with its left edge; the card's corners round it off. */}
      <Pressable onPress={onOpen} accessible={false} style={[styles.cardPhoto, { backgroundColor: p.photoFallback }]}>
        <ExpoImage source={{ uri: r.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} cachePolicy="memory-disk" accessibilityIgnoresInvertColors />
      </Pressable>
      <View style={styles.cardText}>
        <Pressable onPress={onOpen} accessible={false} style={{ gap: 2 }}>
          <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
            {displayTitle(r)}
          </Text>
          <Text style={[t.small, { color: cooked ? p.greenDeep : p.muted }]} numberOfLines={1}>
            {meta}
          </Text>
        </Pressable>
        <View style={styles.cardActions}>
          <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${displayTitle(r)}, ${meta}. Open recipe`} hitSlop={8}>
            <Text style={[t.label, { color: p.greenDeep }]}>Open recipe →</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShownInWeek((v) => !v);
              // Save on the next tick, so the flip draws first instead of waiting for every screen to redraw.
              setTimeout(onWeek, 0);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: shownInWeek }}
            accessibilityLabel={shownInWeek ? `${displayTitle(r)} is on this week's list. Remove it` : `Add ${displayTitle(r)} to this week`}
            hitSlop={8}
          >
            <Text style={[t.label, { color: shownInWeek ? p.muted : p.greenDeep }]}>{shownInWeek ? '✓ This week' : '+ This week'}</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close preview" hitSlop={10} style={styles.cardClose}>
        <Text style={[t.label, { color: p.muted, fontSize: 18 }]}>×</Text>
      </Pressable>
    </View>
  );
}

/** A small ink compass rose in the map's corner. */
function Compass({ p }: { p: Palette }) {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" accessible={false}>
      <Circle cx={22} cy={22} r={15} stroke={p.ink} strokeWidth={1.6} fill="none" />
      <Path d="M22 5 L26 22 L22 39 L18 22 Z" stroke={p.ink} strokeWidth={1.6} strokeLinejoin="round" fill={p.ground} />
      <Path d="M22 5 L26 22 H18 Z" fill={p.harvest} stroke={p.ink} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M5 22 H11 M33 22 H39" stroke={p.ink} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

type RowProps = { hike: Region; slugs: string[]; p: Palette; behind: (slug: string) => boolean; summited: boolean; onPress: () => void };

function HikeRow({ hike, slugs, p, behind, summited, onPress }: RowProps) {
  const done = slugs.filter(behind).length;
  const open = slugs.length - done;
  const status = summited ? (open ? `Finished · ${open} open` : 'Finished') : done ? `${done} of ${slugs.length} cooked` : `${slugs.length} ${slugs.length === 1 ? 'stop' : 'stops'}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hike.trail}, ${gradeLabel(hike)} journey, ${status}`}
      style={({ pressed }) => [styles.row, { borderColor: p.hairline, opacity: pressed ? 0.85 : 1 }]}
    >
      <Blazes level={hike.grade} color={p.green} />
      <Text style={[t.rowTitle, { color: p.ink, flex: 1, fontSize: 16 }]} numberOfLines={2}>
        {hike.trail}
      </Text>
      <Text style={[t.small, { color: summited ? p.greenDeep : p.muted }]}>{status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingTop: space.l, gap: space.s, paddingBottom: 48 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m },
  area: { gap: space.s, marginTop: space.m },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.l },
  // The cat's paws sit just right of its stop.
  cat: { position: 'absolute', left: 6, top: -36 },
  // Every preview is as tall as one with a two-line title, so the photo always shows large.
  card: { position: 'absolute', left: space.l, right: space.l, minHeight: 104, borderRadius: 20, overflow: 'hidden', borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start' },
  // Square, as tall as the card: the recipe photos are square, so the whole photo shows with nothing cropped.
  cardPhoto: { aspectRatio: 1, alignSelf: 'stretch' },
  cardText: { flex: 1, gap: 2, paddingVertical: space.m, paddingLeft: space.m, justifyContent: 'center' },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.l, rowGap: 4, marginTop: 2 },
  cardClose: { padding: space.m, paddingLeft: space.s },
  closeBar: { position: 'absolute', left: space.l, right: space.l, bottom: space.l, flexDirection: 'row', justifyContent: 'space-between', gap: space.s },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.m, borderWidth: 1.5, borderRadius: 18 },
});
