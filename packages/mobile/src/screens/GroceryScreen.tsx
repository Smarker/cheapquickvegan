import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyBowl } from '../components/Doodles';
import { CheckIcon } from '../components/Icons';
import { PencilStrike } from '../components/PencilStrike';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { AISLES, useGrocery } from '../lib/grocery';
import { font, space, type as t, usePalette } from '../theme/tokens';

/** The grocery list: grouped by store section, ticked off with a pencil line, sent as plain text. */
export function GroceryScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const g = useGrocery();
  const left = g.items.filter((i) => !i.checked).length;
  const recipes = [...new Map(g.items.map((i) => [i.recipeSlug, i.recipeTitle])).entries()];

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <ScrollView contentContainerStyle={[styles.root, { paddingTop: insets.top + space.xl, flexGrow: 1 }]}>
        <Text style={[t.display, { color: p.ink, fontFamily: font.serif, fontSize: 36, lineHeight: 42 }]} accessibilityRole="header">
          Grocery list
        </Text>

        {g.items.length === 0 ? (
          <View style={styles.empty}>
            <EmptyBowl color={p.ink} size={130} />
            <Text style={[t.hand, { color: p.ink, textAlign: 'center', fontSize: 22, lineHeight: 28 }]}>
              Your list is empty.{'\n'}Open a recipe and tap "Add to grocery list".
            </Text>
          </View>
        ) : (
          <>
            <Text style={[t.hand, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {left === 0 ? 'All done. Happy cooking!' : `${left} to get, for ${recipes.map(([, title]) => title).join(', ')}`}
            </Text>

            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  g.send();
                }}
                accessibilityRole="button"
                accessibilityHint="Opens the share sheet with your list as text"
                style={({ pressed }) => [styles.primary, { backgroundColor: p.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              >
                <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: '#2B2A24' }}>Send list</Text>
              </Pressable>
              {g.items.some((i) => i.checked) && (
                <Pressable onPress={g.clearChecked} accessibilityRole="button" style={[styles.secondary, { borderColor: p.hairline }]}>
                  <Text style={[t.label, { color: p.ink }]}>Clear ticked</Text>
                </Pressable>
              )}
            </View>

            {AISLES.map((aisle) => {
              const rows = g.items.filter((i) => i.aisle === aisle);
              if (!rows.length) return null;
              return (
                <View key={aisle} style={{ gap: 2 }}>
                  <Text style={[t.section, { color: p.ink, fontSize: 18, marginTop: space.m }]} accessibilityRole="header">
                    {aisle}
                  </Text>
                  {rows.map((item) => (
                    <Animated.View key={item.id} entering={reduce ? undefined : FadeIn} exiting={reduce ? undefined : FadeOut} layout={reduce ? undefined : LinearTransition}>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          g.toggle(item.id);
                        }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: item.checked }}
                        style={styles.item}
                      >
                        <View style={[styles.box, { borderColor: item.checked ? p.green : p.control, backgroundColor: item.checked ? p.green : 'transparent' }]}>
                          {item.checked && <CheckIcon color="#FFFFFF" size={14} />}
                        </View>
                        <View style={[styles.art, { opacity: item.checked ? 0.4 : 1 }]}>
                          <IngredientDoodle line={item.text} color={p.ink} size={26} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <PencilStrike text={item.text} done={item.checked} style={{ ...t.body, color: p.ink }} doneColor={p.muted} lineColor={p.ink} />
                          {recipes.length > 1 && <Text style={[t.small, { color: p.muted }]}>{item.recipeTitle}</Text>}
                        </View>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              );
            })}

            <View style={{ marginTop: space.xl, gap: space.s }}>
              <Text style={[t.section, { color: p.ink, fontSize: 18 }]}>On this list</Text>
              {recipes.map(([slug, title]) => (
                <View key={slug} style={styles.recipeRow}>
                  <Text style={[t.body, { color: p.ink, flex: 1 }]}>{title}</Text>
                  <Pressable onPress={() => g.removeRecipe(slug)} accessibilityRole="button" accessibilityLabel={`Remove ${title} from the list`} hitSlop={8} style={styles.remove}>
                    <Text style={[t.label, { color: p.greenDeep }]}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View pointerEvents="none" style={[styles.band, { height: insets.top, backgroundColor: p.ground }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.s },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
  actions: { flexDirection: 'row', gap: space.m, marginTop: space.s },
  primary: { minHeight: 48, paddingHorizontal: space.xl, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  secondary: { minHeight: 48, paddingHorizontal: space.l, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 48, paddingVertical: 4 },
  art: { width: 28, alignItems: 'center' },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  recipeRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s },
  band: { position: 'absolute', top: 0, left: 0, right: 0 },
});
