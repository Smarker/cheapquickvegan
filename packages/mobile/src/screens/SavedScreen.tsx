import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CookedStamp } from '../components/CookedStamp';
import { EmptyBowl } from '../components/Doodles';
import { HeartButton } from '../components/HeartButton';
import { Photo } from '../components/Photo';
import { journey, REGIONS } from '../lib/journeys';
import { displayTitle, recipes } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { useSaved } from '../lib/saved';
import type { SavedStack } from '../navigation';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<SavedStack, 'Saved'>;

/** Your kitchen: what you've cooked, recipes you've hearted (newest first), and your preferences. All on the phone, so it works offline. */
export function SavedScreen({ navigation }: Props) {
  useDataVersion(); // re-render when live recipe data arrives
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const saved = useSaved();
  const list = saved.slugs.map((s) => recipes.find((r) => r.slug === s)).filter((r): r is (typeof recipes)[number] => !!r);
  const cooks = recipes.reduce((n, r) => n + saved.cookedCount(r.slug), 0);
  const cookedRecipes = recipes.filter((r) => saved.cookedCount(r.slug) > 0).length;
  const summits = REGIONS.filter((region) => {
    const stops = journey(region).filter((s) => s.kind === 'recipe');
    return stops.length > 0 && stops.every((s) => s.kind === 'recipe' && saved.cookedCount(s.recipe.slug) > 0);
  }).length;
  const stats = [
    { n: cooks, label: cooks === 1 ? 'meal cooked' : 'meals cooked' },
    { n: cookedRecipes, label: cookedRecipes === 1 ? 'recipe tried' : 'recipes tried' },
    { n: summits, label: summits === 1 ? 'journey summited' : 'journeys summited' },
  ];

  return (
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

      <View style={[styles.stats, { backgroundColor: p.sand }]} accessible accessibilityLabel={stats.map((s) => `${s.n} ${s.label}`).join(', ')}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={[t.display, { color: p.ink, fontFamily: font.serif, fontSize: 30, lineHeight: 36 }]}>{s.n}</Text>
            <Text style={[t.small, { color: p.muted, textAlign: 'center' }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[t.section, { color: p.ink, fontSize: 20, marginTop: space.s }]} accessibilityRole="header">
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
          <Text style={[t.hand, { color: p.greenDeep }]}>
            {list.length === 1 ? '1 saved recipe. It opens even without signal.' : `${list.length} saved recipes. They open even without signal.`}
          </Text>
          {list.map((r) => (
            <Animated.View key={r.slug} entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
              <Pressable
                onPress={() => navigation.navigate('Recipe', { slug: r.slug })}
                accessibilityRole="button"
                accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}`}
                style={({ pressed }) => [styles.row, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : 1 }]}
              >
                <Photo uri={r.image} width={76} radius={18} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                    {displayTitle(r)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
                    <Text style={[t.hand, { color: p.greenDeep, fontSize: 18, lineHeight: 20 }]}>{r.totalText}</Text>
                    <CookedStamp count={saved.cookedCount(r.slug)} color={p.greenDeep} />
                  </View>
                </View>
                <HeartButton saved onToggle={() => saved.toggle(r.slug)} label={displayTitle(r)} size={40} />
              </Pressable>
            </Animated.View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.m },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefs: { minHeight: 44, paddingHorizontal: space.l, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center' },
  stats: { flexDirection: 'row', borderRadius: 24, paddingVertical: space.l, paddingHorizontal: space.s },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.l, padding: 10, borderRadius: 24 },
});
