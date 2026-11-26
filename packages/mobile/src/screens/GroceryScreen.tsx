import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyBowl } from '../components/Doodles';
import { CheckIcon } from '../components/Icons';
import { PencilStrike } from '../components/PencilStrike';
import { Hint } from '../components/Hint';
import { dismissHint } from '../lib/hints';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { AISLES, SHARED, useGrocery, type GroceryItem } from '../lib/grocery';
import { mergeLines } from '../lib/groceryMerge';
import { parsePastedList } from '../lib/pasteList';
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
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  // "for 2 recipes and a shared list": a pasted list isn't a recipe, so it's named on its own.
  const cooking = recipes.filter(([slug]) => slug !== SHARED);
  const hasShared = cooking.length < recipes.length;
  const forWhat =
    cooking.length > 1
      ? ` for ${cooking.length} recipes${hasShared ? ' and a shared list' : ''}`
      : cooking.length === 1
        ? `, for ${cooking[0][1]}${hasShared ? ' and a shared list' : ''}`
        : ', from a shared list';
  // Long-press a line to see the recipe's own wording ("1 C jasmine rice (cooked)").
  const [shown, setShown] = useState<Set<string>>(new Set());
  // Removing is quick to undo: the last removal can be put back for a few seconds.
  const [undo, setUndo] = useState<{ label: string; items: GroceryItem[] } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(id);
  }, [undo]);
  const [pasting, setPasting] = useState(false);
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
            <Pressable onPress={() => setPasting(true)} accessibilityRole="button" accessibilityHint="Add items from a list someone sent you" hitSlop={8} style={styles.pasteLink}>
              <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>Got a list from someone? Paste it</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[t.label, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {left === 0 ? 'All done. Happy cooking!' : `${left} to get${forWhat}`}
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
              <Pressable
                onPress={() => setPasting(true)}
                accessibilityRole="button"
                accessibilityHint="Add items from a list someone sent you"
                style={({ pressed }) => [styles.primary, styles.quiet, { borderColor: p.hairline, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              >
                <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: p.ink }}>Paste a list</Text>
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
              {/* Recipes first; pasted items aren't a recipe, so they're named for what they are, last. */}
              {[...cooking, ...recipes.filter(([slug]) => slug === SHARED)].map(([slug, title]) => (
                <View key={slug} style={styles.recipeRow}>
                  <Text style={[t.body, { color: slug === SHARED ? p.muted : p.ink, flex: 1 }]}>
                    {slug === SHARED ? `${plural(g.items.filter((i) => i.recipeSlug === SHARED).length, 'item')} you pasted in` : title}
                  </Text>
                  <Pressable
                    onPress={() => removeWithUndo(slug === SHARED ? 'Removed the pasted items' : `Removed ${title}`, g.items.filter((i) => i.recipeSlug === slug), () => g.removeRecipe(slug))}
                    accessibilityRole="button" accessibilityLabel={slug === SHARED ? 'Remove the items you pasted in' : `Remove ${title} from the list`} hitSlop={8} style={styles.remove}>
                    <Text style={[t.label, { color: p.greenDeep }]}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View pointerEvents="none" style={[styles.band, { height: insets.top, backgroundColor: p.ground }]} />
      <PasteList visible={pasting} onClose={() => setPasting(false)} onAdd={(found) => { g.addShared(found); setPasting(false); }} />
    </View>
  );
}

/**
 * Paste a list someone sent (from this app, Notes or a text). The phone's own Paste goes into
 * the box, so there's no clipboard permission to ask for; the items found show before adding.
 */
function PasteList({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (lines: string[]) => void }) {
  const p = usePalette();
  const [text, setText] = useState('');
  const found = parsePastedList(text);
  const close = () => {
    setText('');
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
        <View style={styles.sheetHead}>
          <Text style={[t.section, { color: p.ink }]} accessibilityRole="header">
            Paste a list
          </Text>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={10}>
            <Text style={[t.label, { color: p.greenDeep }]}>Cancel</Text>
          </Pressable>
        </View>
        <Text style={[t.body, { color: p.muted }]}>Copy the list from your messages or notes, then press and hold the box below and choose Paste.</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          placeholder={'2 red onions\n1 block firm tofu\nlimes'}
          placeholderTextColor={p.muted}
          accessibilityLabel="Pasted list"
          style={[t.body, styles.pasteBox, { color: p.ink, backgroundColor: p.sand, borderColor: p.hairline }]}
        />
        {found.length > 0 && (
          <Text style={[t.small, { color: p.muted }]} accessibilityLiveRegion="polite">
            Found {found.length} {found.length === 1 ? 'item' : 'items'}: {found.slice(0, 4).join(', ')}
            {found.length > 4 ? `, and ${found.length - 4} more` : ''}.
          </Text>
        )}
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onAdd(found);
            setText('');
          }}
          disabled={!found.length}
          accessibilityRole="button"
          accessibilityState={{ disabled: !found.length }}
          style={[styles.primary, { backgroundColor: p.accent, opacity: found.length ? 1 : 0.4 }]}
        >
          <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: '#2B2A24' }}>
            {found.length ? `Add ${found.length} to my list` : 'Add to my list'}
          </Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Quiet actions that change your data (mark cooked, undo, reset) wear a small outline; underlined text only ever navigates.
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  chipText: { fontFamily: font.sansMedium },
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.s },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m, marginTop: space.s },
  quiet: { borderWidth: 2 },
  pasteLink: { minHeight: 44, justifyContent: 'center' },
  sheet: { padding: space.xl, gap: space.l },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pasteBox: { borderWidth: 1.5, borderRadius: 16, padding: space.m, minHeight: 160, textAlignVertical: 'top' },
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
