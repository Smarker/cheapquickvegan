import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CookedStamp } from '../components/CookedStamp';
import { Cairn } from '../components/Cairn';
import { Pill } from '../components/Pill';
import { useCollections } from '../lib/collectionsStore';
import { useRecipeWatch } from '../lib/recipeWatch';
import { cairns } from '../lib/cairn';
import { EmptyBowl } from '../components/Doodles';
import { GroceryPicker, type PickerGroup } from '../components/GroceryPicker';
import { HeartButton } from '../components/HeartButton';
import { TrailPostcard } from '../components/TrailPostcard';
import { Photo } from '../components/Photo';
import { journey, openHikes, REGIONS } from '../lib/journeys';
import { displayTitle, recipes } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { isJustWater, useGrocery } from '../lib/grocery';
import { useUnits } from '../lib/prefs';
import { useSaved } from '../lib/saved';
import { linesIn } from '../lib/units';
import { planWords } from '../lib/plan';
import { usePrefs } from '../lib/prefs';
import { factorFor, scaleLine } from '../lib/scale';
import type { SavedStack } from '../navigation';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<SavedStack, 'Saved'>;

/** Your kitchen: what you've cooked, recipes you've hearted (newest first), and your preferences. All on the phone, so it works offline. */
export function SavedScreen({ navigation }: Props) {
  useDataVersion(); // re-render when live recipe data arrives
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const saved = useSaved();
  const words = planWords(usePrefs().planSpan);
  const allSaved = saved.slugs.map((s) => recipes.find((r) => r.slug === s)).filter((r): r is (typeof recipes)[number] => !!r);
  const { collections, rename, remove } = useCollections();
  const watch = useRecipeWatch();
  // Which collection the saved list is showing; null is everything saved.
  const [shelf, setShelf] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const current = collections.find((c) => c.id === shelf) ?? null;
  const list = current ? allSaved.filter((r) => current.slugs.includes(r.slug)) : allSaved;
  const cooks = recipes.reduce((n, r) => n + saved.cookedCount(r.slug), 0);
  const cookedRecipes = recipes.filter((r) => saved.cookedCount(r.slug) > 0).length;
  // Every hike a summit could have been recorded on: today's hikes plus the full list.
  const allHikes = [...openHikes(), ...REGIONS.filter((h) => !openHikes().some((o) => o.id === h.id))];
  const summits = allHikes.filter((region) => saved.summits[region.id]).length;
  const grocery = useGrocery();
  const { units } = useUnits();
  const [picking, setPicking] = useState(false);
  const week = saved.week.map((w) => recipes.find((r) => r.slug === w.slug)).filter((r): r is (typeof recipes)[number] => !!r);
  const toCook = week.filter((r) => !saved.cookedThisWeek(r.slug));
  const pickerGroups: PickerGroup[] = toCook.map((r) => ({ slug: r.slug, title: displayTitle(r), lines: linesIn(r.ingredients.flatMap((g) => g.items).filter((l) => !isJustWater(l)).map((l) => scaleLine(l, factorFor(r.slug, r.yieldText))), units) }));
  // Finished journeys, kept as postcards.
  const summitedRegions = allHikes.filter((region) => saved.summits[region.id]).map((region) => ({
    region,
    recipes: journey(region, saved.trailFor(region.id)).flatMap((s) => (s.kind === 'recipe' && saved.cookedCount(s.recipe.slug) > 0 ? [s.recipe] : [])),
  }));
  // A quiet record, not a scoreboard: one plain line, and nothing at all before the first cook.
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const record =
    cooks > 0
      ? `You've cooked ${plural(cooks, 'meal', 'meals')} from ${plural(cookedRecipes, 'recipe', 'recipes')}${summits > 0 ? ` and finished ${plural(summits, 'journey', 'journeys')}` : ''}.`
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={[styles.root, { paddingTop: insets.top + space.xl, flexGrow: 1 }]}>
      <View style={styles.head}>
        <Text style={[t.display, { color: p.ink, fontFamily: font.serif }]} accessibilityRole="header">
          Kitchen
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Preferences')}
          accessibilityRole="button"
          accessibilityHint="Measurements, equipment, things to avoid, cook mode and look"
          style={({ pressed }) => [styles.prefs, { borderColor: p.hairline, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[t.label, { color: p.ink }]}>Preferences</Text>
        </Pressable>
      </View>

      <Cairn stacks={cairns(recipes.filter((r) => saved.cookedCount(r.slug) > 0).map((r) => ({ slug: r.slug, firstCookedOn: saved.firstCookedOn(r.slug) })))} />
      {record && <Text style={[t.body, { color: p.muted }]}>{record}</Text>}

      <View style={styles.planHead}>
        <Text style={[t.section, { color: p.ink, fontSize: 20 }]} accessibilityRole="header">
          {words.title}
        </Text>
        <Pressable onPress={() => navigation.navigate('Planner')} accessibilityRole="link" hitSlop={10} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={[t.label, { color: p.greenDeep }]}>Plan by day</Text>
        </Pressable>
      </View>
      {week.length === 0 ? (
        <Text style={[t.body, { color: p.muted }]}>{words.empty}</Text>
      ) : (
        <>
          <Text style={[t.label, { color: p.greenDeep }]}>
            {toCook.length === 0 ? words.allCooked : `${toCook.length} to cook${week.length > toCook.length ? `, ${week.length - toCook.length} done` : ''}`}
          </Text>
          {week.map((r) => {
            const done = saved.cookedThisWeek(r.slug);
            return (
              <Pressable
                key={r.slug}
                onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                accessibilityRole="button"
                accessibilityLabel={`${displayTitle(r)}${done ? ', cooked' : ''}`}
                style={({ pressed }) => [styles.weekRow, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : done ? 0.7 : 1 }]}
              >
                <Photo uri={r.image} width={56} radius={16} />
                <Text style={[t.rowTitle, { color: p.ink, flex: 1, fontSize: 17 }]} numberOfLines={2}>
                  {displayTitle(r)}
                </Text>
                {done ? (
                  <Text style={[t.label, { color: p.greenDeep, paddingRight: 6 }]} numberOfLines={1} textBreakStrategy="simple">
                    cooked
                  </Text>
                ) : (
                  <Text style={[t.small, { color: p.muted, paddingRight: 4 }]}>{r.totalText}</Text>
                )}
              </Pressable>
            );
          })}
          <View style={styles.weekActions}>
            {toCook.length > 0 && (
              <Pressable onPress={() => setPicking(true)} accessibilityRole="button" style={({ pressed }) => [styles.weekBtn, { backgroundColor: p.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: '#2B2A24' }}>Add all to grocery list</Text>
              </Pressable>
            )}
            {week.length > toCook.length && (
              <Pressable onPress={saved.clearCookedFromWeek} accessibilityRole="button" style={[styles.weekBtn, { borderWidth: 2, borderColor: p.hairline }]}>
                <Text style={[t.label, { color: p.ink }]}>Clear cooked</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
      <GroceryPicker
        visible={picking}
        groups={pickerGroups}
        onClose={() => setPicking(false)}
        onAdd={(picked) => {
          picked.forEach((g) => {
            const r = recipes.find((x) => x.slug === g.slug);
            if (!r) return;
            if (grocery.hasRecipe(r.slug)) grocery.removeRecipe(r.slug);
            grocery.addRecipe(r, g.lines);
          });
          setPicking(false);
        }}
      />

      <Text style={[t.section, { color: p.ink, fontSize: 20, marginTop: space.l }]} accessibilityRole="header">
        Saved recipes
      </Text>
      {list.length === 0 ? (
        <View style={styles.empty}>
          <EmptyBowl color={p.ink} size={130} />
          <Text style={[t.hand, { color: p.ink, textAlign: 'center', fontSize: 22, lineHeight: 30, paddingHorizontal: 8 }]} textBreakStrategy="simple">
            Nothing saved yet. Tap the heart on any recipe and it'll be waiting here.
          </Text>
        </View>
      ) : (
        <>
          {collections.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s }}>
              <Pill label={`All · ${allSaved.length}`} selected={!current} onPress={() => setShelf(null)} />
              {collections.map((c) => (
                <Pill key={c.id} label={`${c.name} · ${c.slugs.length}`} selected={current?.id === c.id} onPress={() => setShelf(c.id)} />
              ))}
            </ScrollView>
          )}
          {current && (
            <View style={styles.shelfActions}>
              {renaming === current.id ? (
                <TextInput
                  defaultValue={current.name}
                  autoFocus
                  onSubmitEditing={(e) => { rename(current.id, e.nativeEvent.text); setRenaming(null); }}
                  onBlur={() => setRenaming(null)}
                  returnKeyType="done"
                  accessibilityLabel="Collection name"
                  style={[t.body, styles.renameInput, { color: p.ink, backgroundColor: p.sand, borderColor: p.hairline }]}
                />
              ) : (
                <Pressable onPress={() => setRenaming(current.id)} accessibilityRole="button" hitSlop={8} style={[styles.shelfChip, { borderColor: p.hairline }]}>
                  <Text style={[t.small, { color: p.greenDeep, fontFamily: font.sansMedium }]}>Rename</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => { remove(current.id); setShelf(null); }}
                accessibilityRole="button"
                accessibilityHint="Deletes the collection. The recipes stay saved."
                hitSlop={8}
                style={[styles.shelfChip, { borderColor: p.hairline }]}
              >
                <Text style={[t.small, { color: p.greenDeep, fontFamily: font.sansMedium }]}>Delete collection</Text>
              </Pressable>
            </View>
          )}
          <Text style={[t.label, { color: p.greenDeep }]}>
            {current
              ? list.length === 0
                ? 'Nothing in here yet. Open a saved recipe and tap "Add to a collection".'
                : `${list.length} in ${current.name}.`
              : list.length === 1
                ? '1 saved recipe, kept on your phone so it works offline.'
                : `${list.length} saved recipes, kept on your phone so they work offline.`}
          </Text>
          {list.map((r) => (
            <Animated.View key={r.slug} entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
              <Pressable
                onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                accessibilityRole="button"
                accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}${watch.changesFor(r.slug).length ? ', updated since you saved it' : ''}`}
                style={({ pressed }) => [styles.row, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : 1 }]}
              >
                <Photo uri={r.image} width={76} radius={18} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={3}>
                    {displayTitle(r)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
                    <Text style={[t.label, { color: p.greenDeep }]}>{r.totalText}</Text>
                    <CookedStamp count={saved.cookedCount(r.slug)} color={p.greenDeep} />
                    {watch.changesFor(r.slug).length > 0 && <Text style={[t.small, { color: p.ink, fontFamily: font.sansMedium, backgroundColor: p.greenSoft, paddingHorizontal: 8, borderRadius: 8, overflow: 'hidden' }]}>Updated</Text>}
                  </View>
                </View>
                <HeartButton saved onToggle={() => saved.toggle(r.slug)} label={displayTitle(r)} size={40} />
              </Pressable>
            </Animated.View>
          ))}
        </>
      )}

      {summitedRegions.length > 0 && (
        <>
          <Text style={[t.section, { color: p.ink, fontSize: 20, marginTop: space.l }]} accessibilityRole="header">
            Your journeys
          </Text>
          {summitedRegions.map(({ region, recipes: trail }) => (
            <TrailPostcard key={region.id} region={region} recipes={trail} onPress={() => navigation.navigate('Journey', { id: region.id })} />
          ))}
        </>
      )}
    </ScrollView>
      {/* Paper behind the status bar, like the other tabs, so scrolled content never runs under the clock. */}
      <View pointerEvents="none" style={[styles.band, { height: insets.top, backgroundColor: p.ground }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', top: 0, left: 0, right: 0 },
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.m },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefs: { minHeight: 44, paddingHorizontal: space.l, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center' },
  shelfActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, alignItems: 'center' },
  shelfChip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  renameInput: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: space.m, minHeight: 44, minWidth: 180 },
  planHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.s },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 8, borderRadius: 20 },
  weekActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.xs },
  weekBtn: { minHeight: 46, paddingHorizontal: space.l, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.l, padding: 10, borderRadius: 24 },
});
