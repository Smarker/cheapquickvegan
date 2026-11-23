import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyBowl } from '../components/Doodles';
import { CheckIcon } from '../components/Icons';
import { PencilStrike } from '../components/PencilStrike';
import { Hint } from '../components/Hint';
import { dismissHint } from '../lib/hints';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { AISLES, useGrocery, type GroceryItem } from '../lib/grocery';
import { mergeLines } from '../lib/groceryMerge';
import { font, space, type as t, usePalette } from '../theme/tokens';

/** The grocery list: grouped by store section, ticked off with a pencil line, sent as plain text. */
export function GroceryScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const g = useGrocery();
  // One line per ingredient, even when several recipes need it.
  const byAisle = AISLES.map((aisle) => ({ aisle, lines: mergeLines(g.items.filter((i) => i.aisle === aisle)) }));
  const left = byAisle.reduce((n, a) => n + a.lines.filter((l) => !l.checked).length, 0);
  const tick = (ids: string[], checked: boolean) => ids.forEach((id) => g.items.find((i) => i.id === id)?.checked === checked && g.toggle(id));
  const recipes = [...new Map(g.items.map((i) => [i.recipeSlug, i.recipeTitle])).entries()];
  // Long-press a line to see the recipe's own wording ("1 C jasmine rice (cooked)").
  const [shown, setShown] = useState<Set<string>>(new Set());
  // Removing is quick to undo: the last removal can be put back for a few seconds.
  const [undo, setUndo] = useState<{ label: string; items: GroceryItem[] } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(id);
  }, [undo]);
  const removeWithUndo = (label: string, gone: GroceryItem[], run: () => void) => {
    run();
    setUndo({ label, items: gone });
  };

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
            <Text style={[t.label, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {left === 0 ? 'All done. Happy cooking!' : `${left} to get${recipes.length > 1 ? ` for ${recipes.length} recipes` : `, for ${recipes[0][1]}`}`}
            </Text>

            <Hint id="grocery-long-press">Lines are written for the shop. Long-press any item to see how the recipe writes it.</Hint>

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
                <Pressable
                  onPress={() => {
                    const gone = g.items.filter((i) => i.checked);
                    removeWithUndo(`Cleared ${gone.length} ticked`, gone, g.clearChecked);
                  }}
                  accessibilityRole="button"
                  style={[styles.secondary, { borderColor: p.hairline }]}
                >
                  <Text style={[t.label, { color: p.ink }]}>Clear ticked</Text>
                </Pressable>
              )}
            </View>

            {undo && (
              <Animated.View entering={reduce ? undefined : FadeIn} exiting={reduce ? undefined : FadeOut} style={[styles.undo, { backgroundColor: p.sand }]} accessibilityLiveRegion="polite">
                <Text style={[t.small, { color: p.ink, flex: 1 }]}>{undo.label}.</Text>
                <Pressable
                  onPress={() => {
                    g.restore(undo.items);
                    setUndo(null);
                  }}
                  accessibilityRole="button"
                  hitSlop={10}
                  style={[styles.chip, { borderColor: p.hairline }]}
                >
                  <Text style={[t.label, { color: p.greenDeep }]}>Undo</Text>
                </Pressable>
              </Animated.View>
            )}

            {byAisle.map(({ aisle, lines: rows }) => {
              if (!rows.length) return null;
              return (
                <View key={aisle} style={{ gap: 2 }}>
                  <Text style={[t.section, { color: p.ink, fontSize: 18, marginTop: space.m }]} accessibilityRole="header">
                    {aisle}
                  </Text>
                  {rows.map((item) => (
                    <Animated.View key={item.key} entering={reduce ? undefined : FadeIn} exiting={reduce ? undefined : FadeOut} layout={reduce ? undefined : LinearTransition}>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          tick(item.ids, item.checked);
                        }}
                        onLongPress={() => {
                          dismissHint('grocery-long-press');
                          setShown((prev) => {
                            const next = new Set(prev);
                            next.has(item.key) ? next.delete(item.key) : next.add(item.key);
                            return next;
                          });
                        }}
                        accessibilityHint="Long-press to see how the recipe writes it"
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
                          {item.note && <Text style={[t.small, { color: p.muted }]}>{item.note[0].toUpperCase() + item.note.slice(1)}</Text>}
                          {shown.has(item.key) && (
                            <Text style={[t.small, { color: p.muted }]}>Recipe says: {item.originals.join('; ')}</Text>
                          )}
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
                  <Pressable
                    onPress={() => removeWithUndo(`Removed ${title}`, g.items.filter((i) => i.recipeSlug === slug), () => g.removeRecipe(slug))}
                    accessibilityRole="button" accessibilityLabel={`Remove ${title} from the list`} hitSlop={8} style={styles.remove}>
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
  // Quiet actions that change your data (mark cooked, undo, reset) wear a small outline; underlined text only ever navigates.
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  chipText: { fontFamily: font.sansMedium },
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
  undo: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: 18, paddingLeft: space.l, paddingRight: space.s, minHeight: 48, marginTop: space.s },
  undoButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s },
});
