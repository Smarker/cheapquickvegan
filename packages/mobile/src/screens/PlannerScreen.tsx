import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GroceryPicker, type PickerGroup } from '../components/GroceryPicker';
import { Photo } from '../components/Photo';
import { isJustWater, useGrocery } from '../lib/grocery';
import { useJournal } from '../lib/journal';
import {
  addDays,
  dayLabel,
  daysOf,
  isoDay,
  mondayOf,
  moveMeal,
  nextDinner,
  planMyWeek,
  repeatWeek,
  setSlot,
  slugsIn,
  weekLabel,
  type Slot,
  type Taste,
} from '../lib/planner';
import { usePlanner } from '../lib/plannerStore';
import { usePrefs, useUnits } from '../lib/prefs';
import { displayTitle, recipes, type Recipe } from '../lib/recipes';
import { useSaved } from '../lib/saved';
import { factorFor, scaleLine } from '../lib/scale';
import { linesIn } from '../lib/units';
import type { SavedStack } from '../navigation';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<SavedStack, 'Planner'>;

const SLOT_LABEL: Record<Slot, string> = { dinner: 'Dinner', extra: 'Extra' };
const ADD_LABEL: Record<Slot, string> = { dinner: 'Add dinner', extra: 'Add an extra: lunch, a side or dessert' };

/** A dinner each day, plus one optional extra, week by week. Kept on the phone. */
export function PlannerScreen({ navigation }: Props) {
  const p = usePalette();
  const saved = useSaved();
  const journal = useJournal();
  const prefs = usePrefs();
  const grocery = useGrocery();
  const { units } = useUnits();
  const { plan, setPlan } = usePlanner();

  const today = isoDay(new Date());
  const thisMonday = mondayOf(new Date());
  const [monday, setMonday] = useState(thisMonday);
  const days = daysOf(monday);
  const lastDays = daysOf(addDays(monday, -7));

  const [open, setOpen] = useState<{ day: string; slot: Slot } | null>(null);
  const [moving, setMoving] = useState<{ day: string; slot: Slot } | null>(null);
  const [adding, setAdding] = useState<{ day: string; slot: Slot } | null>(null);
  const [picking, setPicking] = useState(false);

  const byslug = (slug: string) => recipes.find((r) => r.slug === slug);
  const dinners = recipes.filter((r) => r.category === 'Meal' && prefs.fits(r));
  const taste: Taste = {
    loved: journal.withVerdict('loved'),
    good: journal.withVerdict('good'),
    tweak: journal.withVerdict('tweak'),
    wanted: [...saved.slugs, ...saved.week.map((w) => w.slug)],
  };
  // The two weeks before this one: kept for later rather than repeated straight away.
  const recent = slugsIn(plan, [...daysOf(addDays(monday, -14)), ...lastDays], 'dinner');
  const lovedCuisines = taste.loved.map((s) => byslug(s)?.cuisine).filter((c): c is string => !!c);

  const planned = slugsIn(plan, days);
  const emptyDinners = days.filter((d) => !plan[d]?.dinner).length;
  // Dinners that fit this cook and aren't in the week yet: what "Plan my week" can still use.
  const unused = dinners.filter((r) => !planned.includes(r.slug)).length;
  const lastWeekHasMeals = slugsIn(plan, lastDays).length > 0;
  const canRepeat = lastWeekHasMeals && days.some((d, i) => (['dinner', 'extra'] as Slot[]).some((s) => !plan[d]?.[s] && plan[lastDays[i]]?.[s]));

  const groups: PickerGroup[] = [...new Set(planned)]
    .map(byslug)
    .filter((r): r is Recipe => !!r)
    .map((r) => ({
      slug: r.slug,
      title: displayTitle(r),
      lines: linesIn(r.ingredients.flatMap((g) => g.items).filter((l) => !isJustWater(l)).map((l) => scaleLine(l, factorFor(r.slug, r.yieldText))), units),
    }));

  const change = (fn: Parameters<typeof setPlan>[0]) => {
    Haptics.selectionAsync();
    setPlan(fn);
  };

  const planWeek = () =>
    change((pl) => planMyWeek({ days, plan: pl, dinners, taste, recent, lovedCuisines, cookedCount: saved.cookedCount }));

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.weekBar}>
          <Pressable onPress={() => setMonday(addDays(monday, -7))} accessibilityRole="button" accessibilityLabel="Previous week" hitSlop={10} style={styles.arrow}>
            <Text style={[t.section, { color: p.ink }]}>‹</Text>
          </Pressable>
          <Text style={[t.section, { color: p.ink }]} accessibilityRole="header" accessibilityLiveRegion="polite">
            {weekLabel(monday, thisMonday)}
          </Text>
          <Pressable onPress={() => setMonday(addDays(monday, 7))} accessibilityRole="button" accessibilityLabel="Next week" hitSlop={10} style={styles.arrow}>
            <Text style={[t.section, { color: p.ink }]}>›</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          {emptyDinners > 0 && unused > 0 && (
            <Pressable onPress={planWeek} accessibilityRole="button" accessibilityHint="Fills the empty dinners with recipes that fit your time, tastes and what you'll already buy" style={[styles.btn, { backgroundColor: p.accent }]}>
              <Text style={styles.btnText}>{emptyDinners === 7 ? 'Plan my week' : `Fill ${emptyDinners} ${emptyDinners === 1 ? 'dinner' : 'dinners'}`}</Text>
            </Pressable>
          )}
          {canRepeat && (
            <Pressable onPress={() => change((pl) => repeatWeek(pl, addDays(monday, -7), monday, saved.cookedCount))} accessibilityRole="button" style={[styles.btn, styles.quiet, { borderColor: p.hairline }]}>
              <Text style={[styles.btnText, { color: p.ink }]}>Repeat last week</Text>
            </Pressable>
          )}
          {groups.length > 0 && (
            <Pressable onPress={() => setPicking(true)} accessibilityRole="button" style={[styles.btn, styles.quiet, { borderColor: p.hairline }]}>
              <Text style={[styles.btnText, { color: p.ink }]}>Add to grocery list</Text>
            </Pressable>
          )}
        </View>

        {emptyDinners > 0 && unused === 0 && (
          <Text style={[t.small, { color: p.muted }]}>
            Every dinner that fits your allergens and gear is already this week. Add the rest yourself, or change what you avoid in Preferences.
          </Text>
        )}

        {moving && (
          <Text style={[t.body, { color: p.greenDeep }]} accessibilityLiveRegion="polite">
            Tap where {(() => { const r = byslug(plan[moving.day]?.[moving.slot]?.slug ?? ''); return r ? displayTitle(r) : 'it'; })()} should go.
          </Text>
        )}

        {days.map((day) => (
          <View key={day} style={[styles.day, { borderColor: day === today ? p.green : p.hairline }]}>
            <Text style={[t.label, { color: day === today ? p.greenDeep : p.ink }]}>{dayLabel(day, today)}</Text>
            {(['dinner', 'extra'] as Slot[]).map((slot) => {
              const item = plan[day]?.[slot];
              const r = item && byslug(item.slug);
              const here = { day, slot };
              const isOpen = open?.day === day && open.slot === slot;
              if (moving) {
                const isSource = moving.day === day && moving.slot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => {
                      if (!isSource) change((pl) => moveMeal(pl, moving, here));
                      setMoving(null);
                      setOpen(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={isSource ? 'Cancel moving' : `Move to ${dayLabel(day, today)}, ${SLOT_LABEL[slot]}${r ? `, trades places with ${displayTitle(r)}` : ''}`}
                    style={[styles.target, { borderColor: isSource ? p.control : p.green }]}
                  >
                    <Text style={[t.small, { color: p.muted }]}>
                      {isSource ? 'Tap to cancel' : `${SLOT_LABEL[slot]}${r ? `: trade with ${displayTitle(r)}` : ': move here'}`}
                    </Text>
                  </Pressable>
                );
              }
              if (!r) {
                // The extra stays quiet until the dinner is planned.
                if (slot === 'extra' && !plan[day]?.dinner) return null;
                return (
                  <Pressable key={slot} onPress={() => setAdding(here)} accessibilityRole="button" hitSlop={4} style={styles.add}>
                    <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>+ {ADD_LABEL[slot]}</Text>
                  </Pressable>
                );
              }
              const cooked = saved.cookedCount(r.slug) > item!.cookedAtAdd;
              const swap = slot === 'dinner' ? nextDinner({ day, days, plan, dinners, taste, recent }) : null;
              return (
                <View key={slot} style={{ gap: space.s }}>
                  <Pressable
                    onPress={() => setOpen(isOpen ? null : here)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    accessibilityLabel={`${SLOT_LABEL[slot]}: ${displayTitle(r)}${cooked ? ', cooked' : ''}`}
                    style={[styles.meal, { backgroundColor: tintFor(p, r.category), opacity: cooked ? 0.7 : 1 }]}
                  >
                    <Photo uri={r.image} width={52} radius={14} />
                    <View style={{ flex: 1 }}>
                      <Text style={[t.small, { color: p.muted }]}>{SLOT_LABEL[slot]}{cooked ? ' · cooked' : ''}</Text>
                      <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                        {displayTitle(r)}
                      </Text>
                    </View>
                    <Text style={[t.label, { color: p.greenDeep }]}>{r.totalText}</Text>
                  </Pressable>
                  {isOpen && (
                    <View style={styles.mealActions}>
                      <Chip label="Open" onPress={() => navigation.navigate('Recipe', { slug: r.slug })} />
                      {swap && <Chip label="Swap" a11y={`Swap for ${displayTitle(swap)}`} onPress={() => change((pl) => setSlot(pl, day, 'dinner', { slug: swap.slug, cookedAtAdd: saved.cookedCount(swap.slug) }))} />}
                      <Chip label="Move" onPress={() => setMoving(here)} />
                      <Chip label="Remove" onPress={() => { change((pl) => setSlot(pl, day, slot, null)); setOpen(null); }} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <AddMeal
        target={adding}
        onClose={() => setAdding(null)}
        onPick={(r) => {
          if (adding) change((pl) => setSlot(pl, adding.day, adding.slot, { slug: r.slug, cookedAtAdd: saved.cookedCount(r.slug) }));
          setAdding(null);
        }}
        fits={prefs.fits}
        inWeek={planned}
      />
      <GroceryPicker
        visible={picking}
        groups={groups}
        onClose={() => setPicking(false)}
        onAdd={(picked) => {
          picked.forEach((g) => {
            const r = byslug(g.slug);
            if (!r) return;
            if (grocery.hasRecipe(r.slug)) grocery.removeRecipe(r.slug);
            grocery.addRecipe(r, g.lines);
          });
          setPicking(false);
        }}
      />
    </View>
  );
}

function Chip({ label, onPress, a11y }: { label: string; onPress: () => void; a11y?: string }) {
  const p = usePalette();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y ?? label} hitSlop={6} style={[styles.chip, { borderColor: p.hairline }]}>
      <Text style={[t.small, { fontFamily: font.sansMedium, color: p.greenDeep }]}>{label}</Text>
    </Pressable>
  );
}

/** Pick a recipe for a slot: dinners for dinner, everything else for the extra. Ones that clash with the cook's prefs go last. */
function AddMeal({ target, onClose, onPick, fits, inWeek }: { target: { day: string; slot: Slot } | null; onClose: () => void; onPick: (r: Recipe) => void; fits: (r: Recipe) => boolean; inWeek: string[] }) {
  const p = usePalette();
  const forSlot = target?.slot === 'dinner' ? recipes.filter((r) => r.category === 'Meal') : recipes.filter((r) => r.category !== 'Meal');
  const list = [...forSlot].sort((a, b) => Number(!fits(a)) - Number(!fits(b)) || (a.totalMinutes ?? 0) - (b.totalMinutes ?? 0));
  return (
    <Modal visible={!!target} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: p.ground }}>
        <View style={styles.sheetHead}>
          <Text style={[t.section, { color: p.ink }]} accessibilityRole="header">
            {target?.slot === 'dinner' ? 'Pick a dinner' : 'Pick an extra'}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={10}>
            <Text style={[t.label, { color: p.greenDeep }]}>Cancel</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: 0, gap: space.s }}>
          {list.map((r) => (
            <Pressable
              key={r.slug}
              onPress={() => onPick(r)}
              accessibilityRole="button"
              accessibilityLabel={`${displayTitle(r)}, ${r.totalText ?? ''}${inWeek.includes(r.slug) ? ', already this week' : ''}`}
              style={({ pressed }) => [styles.meal, { backgroundColor: tintFor(p, r.category), opacity: pressed ? 0.85 : fits(r) ? 1 : 0.6 }]}
            >
              <Photo uri={r.image} width={52} radius={14} />
              <View style={{ flex: 1 }}>
                <Text style={[t.rowTitle, { color: p.ink }]} numberOfLines={2}>
                  {displayTitle(r)}
                </Text>
                {inWeek.includes(r.slug) && <Text style={[t.small, { color: p.muted }]}>Already this week</Text>}
              </View>
              <Text style={[t.label, { color: p.greenDeep }]}>{r.totalText}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingTop: space.s, gap: space.l },
  weekBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  btn: { minHeight: 46, paddingHorizontal: space.l, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  quiet: { borderWidth: 2 },
  btnText: { fontFamily: font.sansBold, fontSize: 15, color: '#2B2A24' },
  day: { borderWidth: 1.5, borderRadius: 20, padding: space.m, gap: space.s },
  meal: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 8, borderRadius: 18 },
  mealActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  add: { minHeight: 44, justifyContent: 'center' },
  target: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, minHeight: 48, justifyContent: 'center', paddingHorizontal: space.m },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.xl },
});
