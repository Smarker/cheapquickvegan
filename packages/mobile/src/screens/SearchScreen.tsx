import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StirringPot } from '../components/Doodles';
import { SearchIcon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { Pill } from '../components/Pill';
import { TimePicker } from '../components/TimePicker';
import { useDataVersion } from '../lib/data';
import { displayTitle, type TimeLimit } from '../lib/recipes';
import { popularIngredients, searchGuides, searchRecipes } from '../lib/search';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ Search: undefined; Recipe: { slug: string }; Guide: { slug: string } }, 'Search'>;

const RECENT_KEY = 'cqv:recent-searches:v1';

export function SearchScreen({ navigation }: Props) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const dataVersion = useDataVersion();
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState<TimeLimit>(null);
  const [recent, setRecent] = useState<string[]>([]);

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
                  <Pill key={s} label={s} onPress={() => setQuery(s)} />
                ))}
              </View>
            </View>
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
            <Text style={[t.hand, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {hits.length} {hits.length === 1 ? 'recipe' : 'recipes'}
              {guideHits.length ? ` and ${guideHits.length} ${guideHits.length === 1 ? 'guide' : 'guides'}` : ''}
            </Text>
            {hits.map(({ recipe: r, why }, i) => (
              <Animated.View key={r.slug} entering={reduce ? undefined : FadeIn.duration(220).delay(Math.min(i, 6) * 30)}>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    open(r.slug);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}${why ? `, has ${why}` : ''}`}
                  style={({ pressed }) => [styles.row, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : 1 }]}
                >
                  <Photo uri={r.image} width={72} radius={18} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                      {displayTitle(r)}
                    </Text>
                    <Text style={[t.small, { color: p.muted }]} numberOfLines={1}>
                      {why ? `Has ${why}` : [r.category, r.totalText].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Text style={[t.hand, { color: p.greenDeep, fontSize: 17, paddingRight: 4 }]} numberOfLines={1} textBreakStrategy="simple">
                    {r.totalMinutes != null ? `${r.totalMinutes} min` : ''}
                  </Text>
                </Pressable>
              </Animated.View>
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
                  <Text style={[t.hand, { color: p.greenDeep, fontSize: 16 }]}>Guide</Text>
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

const styles = StyleSheet.create({
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.m },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, borderRadius: 26, paddingHorizontal: space.l, borderWidth: 2 },
  input: { flex: 1, fontFamily: font.sans, fontSize: 17, paddingVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  empty: { alignItems: 'center', gap: space.m, paddingTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 10, borderRadius: 24 },
  band: { position: 'absolute', top: 0, left: 0, right: 0 },
});
