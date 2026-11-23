import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StirringPot } from '../components/Doodles';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { CheckIcon, SearchIcon } from '../components/Icons';
import { allergenLabel } from '../lib/allergens';
import { usePrefs } from '../lib/prefs';
import { Photo } from '../components/Photo';
import { Pill } from '../components/Pill';
import { TimePicker } from '../components/TimePicker';
import { useDataVersion } from '../lib/data';
import type { Art } from '../lib/ingredientArt';
import { displayTitle, projects, type Recipe, type TimeLimit } from '../lib/recipes';
import { FRIDGE, fridgeMatches, fridgeOptions, popularIngredients, searchGuides, searchRecipes } from '../lib/search';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ Search: undefined; Recipe: { slug: string }; Guide: { slug: string } }, 'Search'>;

const RECENT_KEY = 'cqv:recent-searches:v1';

export function SearchScreen({ navigation }: Props) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const dataVersion = useDataVersion();
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<TimeLimit>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [picked, setPicked] = useState<Art[]>([]);
  // The fridge picker stays one tap away until it's wanted, so Search opens calm.
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => raw && setRecent(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const remember = (q: string) => {
    const clean = q.trim();
    if (clean.length < 2) return;
    const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  };

  const hits = useMemo(() => searchRecipes(query, limit), [query, limit, dataVersion]);
  const guideHits = useMemo(() => searchGuides(query), [query, dataVersion]);
  const suggestions = useMemo(() => popularIngredients(), [dataVersion]);
  const fridge = useMemo(() => fridgeOptions(), [dataVersion]);
  const prefs = usePrefs();
  const fridgeHits = useMemo(() => fridgeMatches(picked, limit).filter((h) => prefs.fits(h.recipe)), [picked, limit, dataVersion, prefs.fits]);
  /** "Contains soy" / "Needs a blender" beats why it matched: it's the thing to know first. */
  const caution = (r: Recipe) => {
    const w = prefs.warningsFor(r);
    if (w.contains.length) return `Contains ${w.contains.map((a) => allergenLabel(a).toLowerCase()).join(', ')}`;
    if (w.needs.length) return `Needs ${w.needs.map((n) => n.toLowerCase()).join(', ')}`;
    return undefined;
  };
  const labelOf = (a: Art) => FRIDGE.find((f) => f.art === a)?.label.toLowerCase() ?? a;
  const togglePick = (a: Art) => setPicked((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const searching = query.trim().length > 1;

  const open = (slug: string) => {
    remember(query);
    navigation.navigate('Recipe', { slug });
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.root, { paddingTop: insets.top + space.xl }]}
      >
        <Text style={[t.display, { color: p.ink, fontFamily: font.serif, fontSize: 36, lineHeight: 42 }]} accessibilityRole="header">
          Search
        </Text>
        <Text style={[t.hand, { color: p.muted }]}>Got something in the fridge? Type it in.</Text>

        <View style={[styles.field, { backgroundColor: p.mist, borderColor: query ? p.green : 'transparent' }]}>
          <SearchIcon color={p.muted} size={22} />
          <TextInput
            ref={input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => remember(query)}
            placeholder="Tofu, ramen, air fryer…"
            placeholderTextColor={p.muted}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search recipes and guides"
            style={[styles.input, { color: p.ink }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10}>
              <Text style={[t.label, { color: p.greenDeep }]}>Clear</Text>
            </Pressable>
          )}
        </View>

        <TimePicker value={limit} onChange={setLimit} />

        {!searching ? (
          <View style={{ gap: space.l, marginTop: space.s }}>
            {recent.length > 0 && (
              <View style={{ gap: space.s }}>
                <Text style={[t.section, { color: p.ink, fontSize: 18 }]}>Recent</Text>
                <View style={styles.chips}>
                  {recent.map((r) => (
                    <Pill key={r} label={r} onPress={() => setQuery(r)} />
                  ))}
                </View>
              </View>
            )}
            <View style={{ gap: space.s }}>
              <Text style={[t.section, { color: p.ink, fontSize: 18 }]}>Try an ingredient</Text>
              <View style={styles.chips}>
                {suggestions.map((s) => (
                  <Pill key={s} label={s} onPress={() => setQuery(s)} icon={<IngredientDoodle line={s} color={p.ink} size={22} />} />
                ))}
              </View>
            </View>

            {!fridgeOpen && picked.length === 0 ? (
              <Pressable
                onPress={() => setFridgeOpen(true)}
                accessibilityRole="button"
                accessibilityHint="Pick the ingredients you have to find recipes that use them"
                style={({ pressed }) => [styles.fridgeEntry, { backgroundColor: p.sand, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              >
                <View style={styles.fridgeArt}>
                  <IngredientDoodle art="tofu" color={p.ink} size={28} />
                  <IngredientDoodle art="greens" color={p.ink} size={28} />
                  <IngredientDoodle art="mushroom" color={p.ink} size={28} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.rowTitle, { color: p.ink }]}>What's in your fridge?</Text>
                  <Text style={[t.small, { color: p.muted }]}>Pick what you've got, and see what it makes.</Text>
                </View>
              </Pressable>
            ) : (
            <View style={{ gap: space.s }}>
              <Text style={[t.section, { color: p.ink, fontSize: 18 }]} accessibilityRole="header">
                What's in your fridge?
              </Text>
              <Text style={[t.hand, { color: p.muted }]}>Tap what you've got. I'll find what uses the most of it.</Text>
              <View style={styles.fridge}>
                {fridge.map(({ art, label }) => {
                  const on = picked.includes(art);
                  return (
                    <Pressable
                      key={art}
                      onPress={() => togglePick(art)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={label}
                      style={({ pressed }) => [
                        styles.tile,
                        { borderColor: on ? p.green : p.hairline, backgroundColor: on ? p.sageSoft : 'transparent', transform: [{ scale: pressed ? 0.96 : 1 }] },
                      ]}
                    >
                      {on && (
                        <View style={[styles.tick, { backgroundColor: p.green }]}>
                          <CheckIcon color="#FFFFFF" size={10} />
                        </View>
                      )}
                      <IngredientDoodle art={art} color={p.ink} size={36} />
                      <Text style={[t.small, { color: p.ink, textAlign: 'center' }]} numberOfLines={2}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {picked.length > 0 && (
                <View style={{ gap: space.m, marginTop: space.s }}>
                  <View style={styles.fridgeHead}>
                    <Text style={[t.label, { color: p.greenDeep, flex: 1 }]} accessibilityLiveRegion="polite">
                      {fridgeHits.length
                        ? `${fridgeHits.length} ${fridgeHits.length === 1 ? 'recipe uses' : 'recipes use'} what you have`
                        : limit != null
                          ? 'Nothing that quick. Try a longer time.'
                          : 'Nothing uses those yet.'}
                    </Text>
                    <Pressable onPress={() => setPicked([])} accessibilityRole="button" hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
                      <Text style={[t.label, { color: p.greenDeep }]}>Clear</Text>
                    </Pressable>
                  </View>
                  {fridgeHits.map(({ recipe, uses }, i) => (
                    <RecipeRow
                      key={recipe.slug}
                      recipe={recipe}
                      note={`Uses ${uses.map(labelOf).join(', ')}${picked.length > 1 ? ` (${uses.length} of ${picked.length})` : ''}`}
                      index={i}
                      onPress={() => navigation.navigate('Recipe', { slug: recipe.slug })}
                    />
                  ))}
                </View>
              )}
            </View>
            )}

            {/* Breads, soups and bigger cooks: off Discover on weekdays, always here. */}
            {!projectsOpen ? (
              <Pressable
                onPress={() => setProjectsOpen(true)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.fridgeEntry, { backgroundColor: p.sand, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              >
                <View style={styles.fridgeArt}>
                  <IngredientDoodle art="bread" color={p.ink} size={28} />
                  <IngredientDoodle art="dough" color={p.ink} size={28} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.rowTitle, { color: p.ink }]}>Weekend projects</Text>
                  <Text style={[t.small, { color: p.muted }]}>Breads, soups and bigger cooks. Worth the wait.</Text>
                </View>
              </Pressable>
            ) : (
              <View style={{ gap: space.s }}>
                <Text style={[t.section, { color: p.ink, fontSize: 18 }]} accessibilityRole="header">
                  Weekend projects
                </Text>
                {projects()
                  .filter(prefs.fits)
                  .map((recipe, i) => (
                    <RecipeRow key={recipe.slug} recipe={recipe} index={i} onPress={() => navigation.navigate('Recipe', { slug: recipe.slug })} />
                  ))}
              </View>
            )}
          </View>
        ) : hits.length === 0 && guideHits.length === 0 ? (
          <View style={styles.empty}>
            <StirringPot color={p.ink} size={120} />
            <Text style={[t.hand, { color: p.ink, textAlign: 'center', fontSize: 22, lineHeight: 28 }]}>
              Nothing with "{query.trim()}" yet.
            </Text>
            <Text style={[t.body, { color: p.muted, textAlign: 'center' }]}>
              {limit != null ? 'Try a longer time, or a different ingredient.' : 'Try a simpler word, like "tofu" or "rice".'}
            </Text>
            {limit != null && <Pill label="Any time" selected onPress={() => setLimit(null)} />}
          </View>
        ) : (
          <View style={{ gap: space.m }}>
            <Text style={[t.label, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {hits.length} {hits.length === 1 ? 'recipe' : 'recipes'}
              {guideHits.length ? ` and ${guideHits.length} ${guideHits.length === 1 ? 'guide' : 'guides'}` : ''}
            </Text>
            {hits.map(({ recipe: r, why }, i) => (
              <RecipeRow
                key={r.slug}
                recipe={r}
                note={caution(r) ?? (why ? `Has ${why}` : undefined)}
                index={i}
                onPress={() => {
                  Keyboard.dismiss();
                  open(r.slug);
                }}
              />
            ))}
            {guideHits.map((g) => (
              <Pressable
                key={g.slug}
                onPress={() => navigation.navigate('Guide', { slug: g.slug })}
                accessibilityRole="button"
                accessibilityLabel={`Guide: ${g.title}`}
                style={({ pressed }) => [styles.row, { backgroundColor: p.sand, opacity: pressed ? 0.85 : 1 }]}
              >
                <Photo uri={g.image} width={72} radius={18} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[t.label, { color: p.greenDeep }]}>Guide</Text>
                  <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                    {g.title.split(':')[0]}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <View pointerEvents="none" style={[styles.band, { height: insets.top, backgroundColor: p.ground }]} />
    </View>
  );
}

/** One recipe result: photo, short title, why it matched, and its time. */
function RecipeRow({ recipe: r, note, index, onPress }: { recipe: Recipe; note?: string; index: number; onPress: () => void }) {
  const p = usePalette();
  const reduce = useReducedMotion();
  return (
    <Animated.View entering={reduce ? undefined : FadeIn.duration(220).delay(Math.min(index, 6) * 30)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}${note ? `, ${note}` : ''}`}
        style={({ pressed }) => [styles.row, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : 1 }]}
      >
        <Photo uri={r.image} width={72} radius={18} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
            {displayTitle(r)}
          </Text>
          <Text style={[t.small, { color: p.muted }]} numberOfLines={1}>
            {note ?? [r.category, r.totalText].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text style={[t.label, { color: p.greenDeep, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple">
          {r.totalMinutes != null ? `${r.totalMinutes} min` : ''}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.m },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, borderRadius: 26, paddingHorizontal: space.l, borderWidth: 2 },
  input: { flex: 1, fontFamily: font.sans, fontSize: 17, paddingVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  fridge: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  fridgeEntry: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l, borderRadius: 24 },
  fridgeArt: { flexDirection: 'row', gap: 2 },
  tile: { width: '31%', minHeight: 92, borderWidth: 1.5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8 },
  tick: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fridgeHead: { flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center', gap: space.m, paddingTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 10, borderRadius: 24 },
  band: { position: 'absolute', top: 0, left: 0, right: 0 },
});
