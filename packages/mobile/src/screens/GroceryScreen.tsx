import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyBowl } from '../components/Doodles';
import { CheckIcon, ChevronDownIcon, PlusIcon } from '../components/Icons';
import { PencilStrike } from '../components/PencilStrike';
import { Hint } from '../components/Hint';
import { dismissHint } from '../lib/hints';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { AISLES, SHARED, useGrocery, type GroceryItem } from '../lib/grocery';
import { mergeLines } from '../lib/groceryMerge';
import { parsePastedList } from '../lib/pasteList';
import { font, space, type as t, usePalette } from '../theme/tokens';

/** How a line is drawn and ticked, so every group on the list behaves the same. */
type Line = ReturnType<typeof mergeLines>[number];

// The cupboard aisles: what you may well have already, checked before the shop rather than in it.
const PANTRY = new Set<string>(['Pantry', 'Spices & oils']);
const isOptional = (l: Line) => /^optional$/i.test(l.note ?? '');

/**
 * The grocery list, built for the shop: add anything by typing it, check the cupboard first, then the
 * aisles. Ticked items step out of the way into one group at the bottom, and optional extras wait
 * folded up, so the list gets shorter as you go. The screen stays on while it's open.
 */
export function GroceryScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const g = useGrocery();
  // One line per ingredient, even when several recipes need it.
  const byAisle = AISLES.map((aisle) => ({ aisle, lines: mergeLines(g.items.filter((i) => i.aisle === aisle)) }));
  const all = byAisle.flatMap((a) => a.lines);
  const left = all.filter((l) => !l.checked).length;
  const ticked = all.filter((l) => l.checked);
  const extras = all.filter((l) => !l.checked && isOptional(l));
  // Still to get, optional extras aside: the cupboard check first, then the shop's aisles.
  const toGet = (aisles: { aisle: string; lines: Line[] }[]) => aisles.map((a) => ({ ...a, lines: a.lines.filter((l) => !l.checked && !isOptional(l)) })).filter((a) => a.lines.length);
  const pantry = toGet(byAisle.filter((a) => PANTRY.has(a.aisle))).flatMap((a) => a.lines);
  const aisles = toGet(byAisle.filter((a) => !PANTRY.has(a.aisle)));
  const tick = (ids: string[], checked: boolean) => ids.forEach((id) => g.items.find((i) => i.id === id)?.checked === checked && g.toggle(id));
  const recipes = [...new Map(g.items.map((i) => [i.recipeSlug, { title: i.recipeTitle, servings: i.recipeServings }])).entries()];
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const cooking = recipes.filter(([slug]) => slug !== SHARED);
  // Long-press a line to see the recipe's own wording ("1 C jasmine rice (cooked)").
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [openExtras, setOpenExtras] = useState(false);
  const [openTicked, setOpenTicked] = useState(false);
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
  // Typing one thing in: it lands in its aisle like anything pasted. The box stays open for the next one.
  const [adding, setAdding] = useState('');
  const addTyped = () => {
    const found = parsePastedList(adding);
    if (!found.length) return;
    Haptics.selectionAsync();
    g.addShared(found);
    setAdding('');
  };
  // Shopping is phone-in-one-hand: while this tab is open the screen stays on, as it does in cook mode.
  useFocusEffect(
    useCallback(() => {
      activateKeepAwakeAsync('grocery').catch(() => {});
      return () => {
        deactivateKeepAwake('grocery').catch(() => {});
      };
    }, []),
  );

  const row = (item: Line) => (
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
        accessibilityHint="Long-press to see how the recipe writes it, or to remove it"
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
          {item.note && !isOptional(item) && <Text style={[t.small, { color: p.muted }]}>{item.note[0].toUpperCase() + item.note.slice(1)}</Text>}
          {/* Long-press opens a line: how the recipe wrote it (for recipe lines), and a way to take it off the list. */}
          {shown.has(item.key) && (
            <View style={styles.detail}>
              {item.ids.some((id) => g.items.find((i) => i.id === id)?.recipeSlug !== SHARED) && (
                <Text style={[t.small, { color: p.muted }]}>Recipe says: {item.originals.join('; ')}</Text>
              )}
              <Pressable
                onPress={() => {
                  const gone = g.items.filter((i) => item.ids.includes(i.id));
                  removeWithUndo(`Removed ${item.text}`, gone, () => g.removeItems(item.ids));
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.text} from the list`}
                hitSlop={8}
                style={[styles.chip, { borderColor: p.hairline }]}
              >
                <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Remove</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
  // A group that folds away: optional extras, and what's already ticked off.
  const fold = (label: string, open: boolean, setOpen: (v: boolean) => void, lines: Line[]) =>
    lines.length > 0 && (
      <View style={{ gap: 2, marginTop: space.m }}>
        <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.foldHead}>
          <Text style={[t.section, { color: p.ink, fontSize: 18, flex: 1 }]}>{label}</Text>
          <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
            <ChevronDownIcon color={p.muted} size={18} />
          </View>
        </Pressable>
        {open && lines.map(row)}
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <ScrollView contentContainerStyle={[styles.root, { paddingTop: insets.top + space.xl, flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text style={[t.display, { color: p.ink, fontFamily: font.serif, fontSize: 36, lineHeight: 42, flexShrink: 1 }]} accessibilityRole="header">
            Grocery list
          </Text>
          {g.items.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                g.send();
              }}
              accessibilityRole="button"
              accessibilityHint="Opens the share sheet with your list as text"
              style={({ pressed }) => [styles.send, { backgroundColor: p.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            >
              <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: '#2B2A24' }}>Send list</Text>
            </Pressable>
          )}
        </View>

        {/* Anything at all, typed in: it's filed into its aisle. A whole list can be pasted instead. */}
        <View style={[styles.addRow, { backgroundColor: p.sand, borderColor: p.hairline }]}>
          <TextInput
            value={adding}
            onChangeText={setAdding}
            onSubmitEditing={addTyped}
            submitBehavior="submit"
            returnKeyType="done"
            placeholder="Add an item"
            placeholderTextColor={p.muted}
            accessibilityLabel="Add an item to the list"
            style={[t.body, styles.addInput, { color: p.ink }]}
          />
          {adding.trim() ? (
            <Pressable onPress={addTyped} accessibilityRole="button" accessibilityLabel={`Add ${adding.trim()}`} hitSlop={8} style={styles.addBtn}>
              <PlusIcon color={p.greenDeep} size={22} />
            </Pressable>
          ) : (
            <Pressable onPress={() => setPasting(true)} accessibilityRole="button" accessibilityHint="Add items from a list someone sent you" hitSlop={8} style={styles.addBtn}>
              <Text style={[t.label, { color: p.greenDeep }]}>Paste a list</Text>
            </Pressable>
          )}
        </View>


        {g.items.length === 0 ? (
          <View style={styles.empty}>
            <EmptyBowl color={p.ink} size={130} />
            <Text style={[t.hand, { color: p.ink, textAlign: 'center', fontSize: 22, lineHeight: 28 }]}>
              Your list is empty.{'\n'}Type anything above, or open a recipe and tap "Grocery list".
            </Text>
          </View>
        ) : (
          <>
            <Text style={[t.label, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
              {left === 0 ? 'All done. Happy cooking!' : `${left} to get`}
            </Text>
            <Hint id="grocery-long-press">Lines are written for the shop. Long-press any item to see how the recipe writes it, or to remove it.</Hint>

            {pantry.length > 0 && (
              <View style={{ gap: 2 }}>
                <Text style={[t.section, { color: p.ink, fontSize: 18, marginTop: space.m }]} accessibilityRole="header">
                  Check your pantry first
                </Text>
                <Text style={[t.small, { color: p.muted, marginBottom: 2 }]}>Already have these? Tick them off.</Text>
                {pantry.map(row)}
              </View>
            )}

            {aisles.map(({ aisle, lines }) => (
              <View key={aisle} style={{ gap: 2 }}>
                <Text style={[t.section, { color: p.ink, fontSize: 18, marginTop: space.m }]} accessibilityRole="header">
                  {aisle}
                </Text>
                {lines.map(row)}
              </View>
            ))}

            {fold(`${plural(extras.length, 'optional extra')}`, openExtras, setOpenExtras, extras)}
            {fold(`Ticked off · ${ticked.length}`, openTicked, setOpenTicked, ticked)}
            {ticked.length > 0 && (
              <Pressable
                onPress={() => {
                  const gone = g.items.filter((i) => i.checked);
                  removeWithUndo(`Cleared ${gone.length} ticked`, gone, g.clearChecked);
                }}
                accessibilityRole="button"
                style={[styles.chip, { borderColor: p.hairline, marginTop: space.xs }]}
              >
                <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Clear ticked</Text>
              </Pressable>
            )}

            <View style={{ marginTop: space.xl, gap: space.s }}>
              <Text style={[t.section, { color: p.ink, fontSize: 18 }]}>On this list</Text>
              {/* Recipes first, with the size they were added at; things you typed or pasted are named for what they are, last. */}
              {[...cooking, ...recipes.filter(([slug]) => slug === SHARED)].map(([slug, { title, servings }]) => (
                <View key={slug} style={styles.recipeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.body, { color: slug === SHARED ? p.muted : p.ink }]}>
                      {slug === SHARED ? `${plural(g.items.filter((i) => i.recipeSlug === SHARED).length, 'item')} you added` : title}
                    </Text>
                    {slug !== SHARED && servings && <Text style={[t.small, { color: p.muted }]}>Makes {servings}</Text>}
                  </View>
                  <Pressable
                    onPress={() => removeWithUndo(slug === SHARED ? 'Removed the items you added' : `Removed ${title}`, g.items.filter((i) => i.recipeSlug === slug), () => g.removeRecipe(slug))}
                    accessibilityRole="button"
                    accessibilityLabel={slug === SHARED ? 'Remove the items you added' : `Remove ${title} from the list`}
                    hitSlop={8}
                    style={styles.remove}
                  >
                    <Text style={[t.label, { color: p.greenDeep }]}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      {/* Undo floats at the foot of the screen, so it's in reach wherever on the list you removed something. */}
      {undo && (
        <Animated.View entering={reduce ? undefined : FadeIn} exiting={reduce ? undefined : FadeOut} style={[styles.undo, { backgroundColor: p.sand, borderColor: p.hairline }]} accessibilityLiveRegion="polite">
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
  // Quiet actions that change your data (mark cooked, undo, reset) wear a small outline; green text links only ever navigate. No underlines anywhere.
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  chipText: { fontFamily: font.sansMedium },
  root: { paddingHorizontal: space.xl, paddingBottom: 48, gap: space.s },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m, marginTop: space.s },
  quiet: { borderWidth: 2 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.m },
  send: { minHeight: 44, paddingHorizontal: space.l, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, paddingLeft: space.l, marginTop: space.s },
  addInput: { flex: 1, minHeight: 48, paddingVertical: space.s },
  addBtn: { minHeight: 48, paddingHorizontal: space.l, justifyContent: 'center', alignItems: 'center' },
  detail: { gap: space.xs, marginTop: 2 },
  foldHead: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
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
  undo: { position: 'absolute', left: space.l, right: space.l, bottom: space.l, flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: 18, borderWidth: 1, paddingLeft: space.l, paddingRight: space.s, minHeight: 52 },
  undoButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s },
});
