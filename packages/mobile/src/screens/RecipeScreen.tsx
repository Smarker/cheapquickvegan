import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CookedStamp } from '../components/CookedStamp';
import { HeartButton } from '../components/HeartButton';
import { CalendarIcon, CheckIcon, ListIcon, ClockIcon, PanIcon, ServesIcon, ShareIcon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { HighlightedText } from '../components/HighlightedText';
import { StepBadge } from '../components/StepBadge';
import { PencilStrike } from '../components/PencilStrike';
import { GroceryPicker } from '../components/GroceryPicker';
import { RecipeGone } from '../components/RecipeGone';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { Pill } from '../components/Pill';
import { displayTitle, recipes } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { ingredientAmounts, ingredientTerms, toolTerms } from '../lib/cook';
import { canConvert, convertInStep, convertLine, linesIn, writtenIn } from '../lib/units';
import { scaleInStep, scaleLine, scaleYield, useScale } from '../lib/scale';
import { planWords } from '../lib/plan';
import { allergenLabel } from '../lib/allergens';
import { usePrefs, useUnits } from '../lib/prefs';
import { isJustWater, useGrocery } from '../lib/grocery';
import { useSaved } from '../lib/saved';
import { shareRecipe } from '../lib/share';
import { font, lift, space, tintFor, type as t, usePalette } from '../theme/tokens';

/** Shared by the Discover and Saved stacks; both define Recipe with the same params. */
type Props = NativeStackScreenProps<{ Recipe: { slug: string }; Cook: { slug: string } }, 'Recipe'>;
type Tab = 'ingredients' | 'steps' | 'tips';

export function RecipeScreen({ route, navigation }: Props) {
  useDataVersion(); // re-render when live recipe data arrives
  const p = usePalette();
  const { width } = useWindowDimensions();
  const saved = useSaved();
  const grocery = useGrocery();
  const [tab, setTab] = useState<Tab>('ingredients');
  const { units, setUnits } = useUnits();
  const prefs = usePrefs();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [picking, setPicking] = useState(false);
  // Cooked it without cook mode (from Directions, or from memory): one tap counts it, and it can be undone.
  const [justMarked, setJustMarked] = useState(false);
  // Tapping the cooked stamp offers to take one off, for a cook counted by mistake.
  const [fixing, setFixing] = useState(false);
  const r = recipes.find((x) => x.slug === route.params.slug);
  // How many it's being made for. Every amount below follows it, then the grams/cups choice.
  const scale = useScale(route.params.slug, r?.yieldText, r ? r.ingredients.flatMap((g) => g.items) : []);
  const tint = tintFor(p, r?.category ?? null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: tint },
      headerRight: () =>
        r ? (
          <Pressable onPress={() => shareRecipe(r)} accessibilityRole="button" accessibilityLabel="Share this recipe" hitSlop={12} style={{ padding: 6 }}>
            <ShareIcon color={p.ink} size={24} />
          </Pressable>
        ) : null,
    });
  }, [navigation, tint, r, p.ink]);

  if (!r) return <RecipeGone slug={route.params.slug} onBack={() => navigation.goBack()} />;
  const title = displayTitle(r);
  const photo = width - 48;
  const ingredientCount = r.ingredients.reduce((n, g) => n + g.items.length, 0);
  // Directions read like cook mode: amounts after each ingredient, times and temperatures as tags,
  // tools underlined, all in the cook's units.
  const sized = (l: string) => scaleLine(l, scale.factor);
  const allLines = r.ingredients.flatMap((g) => g.items);
  const stepTerms = ingredientTerms(allLines);
  const stepAmounts = ingredientAmounts(linesIn(allLines.map(sized), units));
  const stepTools = toolTerms(r.equipment);
  // What can go on a grocery list (never plain water). The picker asks which ones the cook needs.
  const shoppable = r.ingredients.flatMap((g) => g.items).filter((l) => !isJustWater(l)).map(sized).map((l) => (units ? convertLine(l, units) : l));
  const tabs: { key: Tab; label: string }[] = [
    { key: 'ingredients', label: `Ingredients · ${ingredientCount}` },
    { key: 'steps', label: 'Directions' },
    ...(r.tips.length ? [{ key: 'tips' as Tab, label: 'Tips' }] : []),
  ];
  const facts = [
    r.totalText && { icon: ClockIcon, text: r.totalText },
    r.yieldText && { icon: ServesIcon, text: scaleYield(r.yieldText, scale.factor) },
    r.equipment[0] && { icon: PanIcon, text: r.equipment.slice(0, 2).join(', ') },
  ].filter(Boolean) as { icon: typeof ClockIcon; text: string }[];

  const toggle = (key: string) => {
    Haptics.selectionAsync();
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  let stepNo = 0;

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
    <ScrollView style={{ backgroundColor: tint }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.top}>
        <Photo uri={r.image.replace('-1x1', '-4x3')} width={photo} height={photo * 0.75} radius={28} floating />
        <Text style={[t.title, { color: p.ink }]} accessibilityRole="header">
          {title}
        </Text>
        {/* A note on the title, not a stray chip: only there once it's been cooked. */}
        {saved.cookedCount(r.slug) > 0 && (
          <View style={styles.stampRow}>
            <Pressable
              onPress={() => setFixing((f) => !f)}
              accessibilityRole="button"
              accessibilityLabel={`Cooked ${saved.cookedCount(r.slug)} ${saved.cookedCount(r.slug) === 1 ? 'time' : 'times'}`}
              accessibilityHint="Shows how to take one off if it was counted by mistake"
              hitSlop={8}
            >
              <CookedStamp count={saved.cookedCount(r.slug)} color={p.greenDeep} />
            </Pressable>
            {fixing && (
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  saved.unmarkCooked(r.slug);
                  if (saved.cookedCount(r.slug) <= 1) setFixing(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Take one cook off"
                hitSlop={10}
                style={[styles.chip, { borderColor: p.hairline }]}
              >
                <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Take one off</Text>
              </Pressable>
            )}
          </View>
        )}
        <View style={styles.facts}>
          {facts.map(({ icon: Icon, text }) => (
            <View key={text} style={styles.fact}>
              <Icon color={p.green} size={18} />
              <Text style={[t.small, { color: p.ink }]}>{text}</Text>
            </View>
          ))}
        </View>
        {/* Keep it for later, plan it, shop for it: three quiet actions. Cooking is the one big button. */}
        <View style={styles.actions}>
          <View style={styles.action}>
            <HeartButton saved={saved.isSaved(r.slug)} onToggle={() => saved.toggle(r.slug)} label={title} size={48} />
            <Text style={[t.small, { color: p.ink }]}>{saved.isSaved(r.slug) ? 'Saved' : 'Save'}</Text>
          </View>
          <ActionButton
            label={planWords(prefs.planSpan).title}
            on={saved.inWeek(r.slug)}
            onPress={() => saved.toggleWeek(r.slug)}
            a11y={saved.inWeek(r.slug) ? planWords(prefs.planSpan).remove : planWords(prefs.planSpan).add}
            Icon={CalendarIcon}
          />
          <ActionButton
            label={grocery.hasRecipe(r.slug) ? 'On your list' : 'Grocery list'}
            on={grocery.hasRecipe(r.slug)}
            onPress={() => setPicking(true)}
            a11y={grocery.hasRecipe(r.slug) ? 'Update what this recipe adds to your grocery list' : 'Choose ingredients to add to your grocery list'}
            Icon={ListIcon}
          />
        </View>
      </View>

      <View style={[styles.sheet, { backgroundColor: p.ground }]}>
        <View style={[styles.grabber, { backgroundColor: p.hairline }]} />
        {!!r.description && <Text style={[t.body, { color: p.muted }]}>{r.description}</Text>}
        <RecipeWarning warnings={prefs.warningsFor(r)} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s }} accessibilityRole="tablist">
          {tabs.map((x) => (
            <Pill key={x.key} label={x.label} selected={tab === x.key} onPress={() => setTab(x.key)} role="tab" />
          ))}
        </ScrollView>

        {tab === 'ingredients' && (
          <View style={styles.sizeRow}>
          <Servings
            label={r.yieldText ? scaleYield(r.yieldText, scale.factor) : `${scale.target} ${scale.target === 1 ? 'batch' : 'batches'}`}
            canLess={scale.canLess}
            canMore={scale.canMore}
            onLess={scale.less}
            onMore={scale.more}
            changed={scale.target !== scale.base}
            onReset={() => scale.setTarget(scale.base)}
          />
          {scale.limit && scale.target < scale.base && (
            <Text style={[t.small, { color: p.muted, flexBasis: '100%' }]}>
              Smallest batch: {scaleLine(scale.limit, scale.factor).replace(/,.*$/, '')} can't go smaller.
            </Text>
          )}
          {canConvert(r.ingredients.flatMap((g) => g.items)) && (() => {
          const shown = units ?? writtenIn(r.ingredients.flatMap((g) => g.items));
          const other = shown === 'grams' ? 'volume' : 'grams';
          return (
            <Pressable onPress={() => setUnits(other)} accessibilityRole="button" hitSlop={8} style={styles.units}>
              <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>
                {other === 'grams' ? 'Show in grams' : 'Show in cups & spoons'}
              </Text>
            </Pressable>
          );
          })()}
          </View>
        )}
        {tab === 'ingredients' &&
          r.ingredients.map((g, gi) => (
            <View key={gi} style={styles.group}>
              {g.name && <Text style={[t.section, { color: p.ink }]}>{g.name}</Text>}
              {g.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const done = checked.has(key);
                return (
                  <Pressable key={key} onPress={() => toggle(key)} accessibilityRole="checkbox" accessibilityState={{ checked: done }} style={styles.ing}>
                    <View style={[styles.box, { borderColor: done ? p.green : p.control, backgroundColor: done ? p.green : 'transparent' }]}>
                      {done && <CheckIcon color="#FFFFFF" size={14} />}
                    </View>
                    <View style={[styles.art, { opacity: done ? 0.4 : 1 }]}>
                      <IngredientDoodle line={item} color={p.ink} size={26} />
                    </View>
                    <PencilStrike text={units ? convertLine(sized(item), units) : sized(item)} done={done} style={{ ...t.body, color: p.ink }} doneColor={p.muted} lineColor={p.ink} />
                  </Pressable>
                );
              })}
            </View>
          ))}


        {tab === 'steps' &&
          r.steps.map((g, gi) => (
            <View key={gi} style={styles.group}>
              {g.name && <Text style={[t.section, { color: p.ink }]}>{g.name}</Text>}
              {g.items.map((step) => {
                stepNo += 1;
                return (
                  <View key={stepNo} style={styles.step}>
                    <StepBadge n={stepNo} colors={{ ink: p.ink, green: p.green, line: p.hairline }} size={26} />
                    <HighlightedText
                      text={step}
                      terms={stepTerms}
                      style={[t.body, { flex: 1, color: p.ink }]}
                      highlight={{ fontFamily: font.sansBold, color: p.greenDeep }}
                      amounts={stepAmounts}
                      amountStyle={StyleSheet.flatten([styles.amountText, { color: p.ink }])}
                      amountTag={StyleSheet.flatten([styles.amountTag, { backgroundColor: p.sand, borderColor: p.hairline }])}
                      tools={stepTools}
                      toolStyle={{ fontFamily: font.sansMedium, textDecorationLine: 'underline', textDecorationColor: p.green }}
                      convertAmount={(amount, after) => convertInStep(scaleInStep(amount, scale.factor), after, units)}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        {/* At the end of the steps, where it's true: counts a cook done from Directions or memory, with Undo. */}
        {tab === 'steps' &&
          (justMarked ? (
            <View style={styles.marked}>
              <Text style={[t.small, { color: p.greenDeep }]}>Marked as cooked.</Text>
              <Pressable
                onPress={() => {
                  saved.unmarkCooked(r.slug);
                  setJustMarked(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Undo marking as cooked"
                hitSlop={10}
                style={[styles.chip, { borderColor: p.hairline }]}
              >
                <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Undo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                saved.markCooked(r.slug);
                setJustMarked(true);
              }}
              accessibilityRole="button"
              accessibilityHint="Counts this recipe as cooked without going through cook mode"
              hitSlop={10}
              style={[styles.marked, styles.chip, { borderColor: p.hairline }]}
            >
              <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Made it? Mark it cooked</Text>
            </Pressable>
          ))}

        {tab === 'tips' &&
          r.tips.map((tip, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.dot, { backgroundColor: p.green }]} />
              <Text style={[t.body, { flex: 1, color: p.ink }]}>{tip}</Text>
            </View>
          ))}
      </View>
    </ScrollView>
      <GroceryPicker
        visible={picking}
        groups={[{ slug: r.slug, title: scale.factor !== 1 && r.yieldText ? `${title} · ${scaleYield(r.yieldText, scale.factor)}` : title, lines: shoppable }]}
        onClose={() => setPicking(false)}
        onAdd={(picked) => {
          if (grocery.hasRecipe(r.slug)) grocery.removeRecipe(r.slug);
          picked.forEach((g) => grocery.addRecipe(r, g.lines));
          setPicking(false);
        }}
      />
      <View style={[styles.cookBar, { backgroundColor: p.ground, borderTopColor: p.hairline }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Cook', { slug: r.slug });
          }}
          accessibilityRole="button"
          accessibilityHint="Opens step-by-step cooking and keeps your screen on"
          style={({ pressed }) => [styles.cookBtn, { backgroundColor: p.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <Text style={{ fontFamily: font.sansBold, fontSize: 17, color: '#2B2A24' }}>Start cooking</Text>
          <Text style={[t.hand, { color: '#2B2A24', fontSize: 17 }]}>screen stays on</Text>
        </Pressable>
      </View>
    </View>
  );
}

const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** "Contains soy and gluten" / "Needs a blender", for the things this cook said to avoid or doesn't have. */
function RecipeWarning({ warnings }: { warnings: ReturnType<ReturnType<typeof usePrefs>['warningsFor']> }) {
  const p = usePalette();
  if (!warnings.contains.length && !warnings.needs.length) return null;
  return (
    <View style={[styles.warn, { backgroundColor: p.sand, borderColor: p.hairline }]} accessibilityRole="alert">
      {warnings.contains.length > 0 && (
        <Text style={[t.body, { color: p.ink }]}>
          Seems to contain {list(warnings.contains.map((a) => allergenLabel(a).toLowerCase()))}. That's from the ingredient list, so check labels too.
        </Text>
      )}
      {warnings.needs.length > 0 && (
        <Text style={[t.body, { color: p.ink }]}>Needs {list(warnings.needs.map((n) => n.toLowerCase()))}, which you said you don't have.</Text>
      )}
    </View>
  );
}

/** A round action with a label under it, matching the heart: ground when off, green when on. */
function ActionButton({ label, on, onPress, a11y, Icon }: { label: string; on: boolean; onPress: () => void; a11y: string; Icon: (p: { color: string; size?: number }) => React.ReactElement }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [styles.action, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
    >
      <View style={[styles.actionCircle, { backgroundColor: on ? p.green : p.ground }, lift(p)]}>
        <Icon color={on ? '#FFFFFF' : p.green} size={22} />
      </View>
      <Text style={[t.small, { color: p.ink }]}>{label}</Text>
    </Pressable>
  );
}

type ServingsProps = { label: string; canLess: boolean; canMore: boolean; onLess: () => void; onMore: () => void; changed: boolean; onReset: () => void };

/** "Makes − 4 servings +": scale the recipe up or down. Every amount, step and grocery line follows. */
function Servings({ label, canLess, canMore, onLess, onMore, changed, onReset }: ServingsProps) {
  const p = usePalette();
  const step = (on: boolean, sign: '−' | '+', onPress: () => void, a11y: string) => (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      disabled={!on}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: !on }}
      hitSlop={6}
      style={({ pressed }) => [styles.stepper, { borderColor: p.control, opacity: on ? 1 : 0.35, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
    >
      <Text style={[t.label, { color: p.ink, fontSize: 20, lineHeight: 22 }]}>{sign}</Text>
    </Pressable>
  );
  return (
    <View style={styles.servings} accessible={false}>
      <Text style={[t.label, { color: p.muted }]}>Makes</Text>
      {step(canLess, '−', onLess, 'Fewer servings')}
      <Text style={[t.label, { color: p.ink, minWidth: 96, textAlign: 'center' }]} accessibilityLiveRegion="polite">
        {label}
      </Text>
      {step(canMore, '+', onMore, 'More servings')}
      {changed && (
        <Pressable onPress={onReset} accessibilityRole="button" accessibilityLabel="Back to the original amount" hitSlop={8} style={[styles.chip, { borderColor: p.hairline }]}>
          <Text style={[t.small, styles.chipText, { color: p.greenDeep }]}>Reset</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Quiet actions that change your data (mark cooked, undo, reset) wear a small outline; underlined text only ever navigates.
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, minHeight: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  chipText: { fontFamily: font.sansMedium },
  marked: { flexDirection: 'row', alignItems: 'center', gap: space.s, alignSelf: 'flex-start', minHeight: 44, marginTop: space.s },
  servings: { flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' },
  stampRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginTop: -space.s },
  fix: { minHeight: 44, justifyContent: 'center' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: space.s, marginTop: space.l },
  stepper: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  warn: { borderWidth: 1.5, borderRadius: 16, padding: space.m, gap: space.xs },
  top: { paddingHorizontal: space.xl, paddingTop: space.s, paddingBottom: space.xl, gap: space.l },
  facts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.l, rowGap: space.s },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: space.xs },
  action: { alignItems: 'center', gap: 6, minWidth: 88 },
  actionCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  addList: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: space.xl, borderRadius: 24, borderWidth: 2, marginTop: space.s },
  cookBar: { paddingHorizontal: space.xl, paddingVertical: space.m, borderTopWidth: StyleSheet.hairlineWidth },
  cookBtn: { minHeight: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl },
  sheet: { flexGrow: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: space.xl, paddingTop: space.m, gap: space.l },
  grabber: { alignSelf: 'center', width: 64, height: 5, borderRadius: 3, marginBottom: space.s },
  group: { gap: space.s },
  ing: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 44 },
  art: { width: 28, alignItems: 'center' },
  units: { minHeight: 44, justifyContent: 'center' },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  amountTag: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 0, transform: [{ translateY: 4 }] },
  amountText: { fontFamily: font.sansMedium, fontSize: 15, lineHeight: 21, fontVariant: ['tabular-nums'] },
  step: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
});
