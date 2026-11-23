import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CookedStamp } from '../components/CookedStamp';
import { HeartButton } from '../components/HeartButton';
import { CheckIcon, ClockIcon, PanIcon, ServesIcon, ShareIcon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { HighlightedText } from '../components/HighlightedText';
import { PencilStrike } from '../components/PencilStrike';
import { IngredientDoodle } from '../components/IngredientDoodle';
import { Pill } from '../components/Pill';
import { displayTitle, recipes } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { ingredientTerms } from '../lib/cook';
import { useGrocery } from '../lib/grocery';
import { useSaved } from '../lib/saved';
import { shareRecipe } from '../lib/share';
import { font, space, tintFor, type as t, usePalette } from '../theme/tokens';

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
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const r = recipes.find((x) => x.slug === route.params.slug);
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

  if (!r) return null;
  const title = displayTitle(r);
  const photo = width - 48;
  const ingredientCount = r.ingredients.reduce((n, g) => n + g.items.length, 0);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'ingredients', label: `Ingredients · ${ingredientCount}` },
    { key: 'steps', label: 'Directions' },
    ...(r.tips.length ? [{ key: 'tips' as Tab, label: 'Tips' }] : []),
  ];
  const facts = [
    r.totalText && { icon: ClockIcon, text: r.totalText },
    r.yieldText && { icon: ServesIcon, text: r.yieldText },
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
        <View>
          <Photo uri={r.image.replace('-1x1', '-4x3')} width={photo} height={photo * 0.75} radius={28} floating />
          <View style={styles.heart}>
            <HeartButton saved={saved.isSaved(r.slug)} onToggle={() => saved.toggle(r.slug)} label={title} size={48} />
          </View>
        </View>
        <Text style={[t.title, { color: p.ink }]} accessibilityRole="header">
          {title}
        </Text>
        <CookedStamp count={saved.cookedCount(r.slug)} color={p.greenDeep} />
        <View style={styles.facts}>
          {facts.map(({ icon: Icon, text }) => (
            <View key={text} style={styles.fact}>
              <Icon color={p.green} />
              <Text style={[t.small, { color: p.ink, textAlign: 'center' }]} numberOfLines={2}>
                {text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.sheet, { backgroundColor: p.ground }]}>
        <View style={[styles.grabber, { backgroundColor: p.hairline }]} />
        {!!r.description && <Text style={[t.body, { color: p.muted }]}>{r.description}</Text>}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s }} accessibilityRole="tablist">
          {tabs.map((x) => (
            <Pill key={x.key} label={x.label} selected={tab === x.key} onPress={() => setTab(x.key)} role="tab" />
          ))}
        </ScrollView>

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
                    <PencilStrike text={item} done={done} style={{ ...t.body, color: p.ink }} doneColor={p.muted} lineColor={p.ink} />
                  </Pressable>
                );
              })}
            </View>
          ))}

        {tab === 'ingredients' && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              grocery.addRecipe(r);
            }}
            accessibilityRole="button"
            accessibilityHint="Adds this recipe's ingredients to your grocery list"
            style={({ pressed }) => [styles.addList, { borderColor: p.green, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <Text style={[t.label, { color: p.greenDeep, fontFamily: font.sansBold }]}>
              {grocery.hasRecipe(r.slug) ? 'On your grocery list' : 'Add to grocery list'}
            </Text>
            {grocery.hasRecipe(r.slug) && <CheckIcon color={p.greenDeep} size={16} />}
          </Pressable>
        )}

        {tab === 'steps' &&
          r.steps.map((g, gi) => (
            <View key={gi} style={styles.group}>
              {g.name && <Text style={[t.section, { color: p.ink }]}>{g.name}</Text>}
              {g.items.map((step) => {
                stepNo += 1;
                return (
                  <View key={stepNo} style={styles.step}>
                    <Text style={[t.caps, { color: p.green, width: 22, fontFamily: font.sansBold, lineHeight: 24 }]}>{stepNo}</Text>
                    <HighlightedText
                      text={step}
                      terms={ingredientTerms(r.ingredients.flatMap((g) => g.items))}
                      style={[t.body, { flex: 1, color: p.ink }]}
                      highlight={{ fontFamily: font.sansBold, color: p.greenDeep }}
                    />
                  </View>
                );
              })}
            </View>
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

const styles = StyleSheet.create({
  top: { paddingHorizontal: space.xl, paddingTop: space.s, paddingBottom: space.xl, gap: space.l },
  heart: { position: 'absolute', right: 12, bottom: -18 },
  facts: { flexDirection: 'row', gap: space.s },
  fact: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: space.m, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)' },
  addList: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: space.xl, borderRadius: 24, borderWidth: 2, marginTop: space.s },
  cookBar: { paddingHorizontal: space.xl, paddingVertical: space.m, borderTopWidth: StyleSheet.hairlineWidth },
  cookBtn: { minHeight: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl },
  sheet: { flexGrow: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: space.xl, paddingTop: space.m, gap: space.l },
  grabber: { alignSelf: 'center', width: 64, height: 5, borderRadius: 3, marginBottom: space.s },
  group: { gap: space.s },
  ing: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 44 },
  art: { width: 28, alignItems: 'center' },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
});
