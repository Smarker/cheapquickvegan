import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { StirringPot } from '../components/Doodles';
import { CookedStamp } from '../components/CookedStamp';
import { HeartButton } from '../components/HeartButton';
import { KitchenTimer, type RunningTimer } from '../components/KitchenTimer';
import { cookPages, type CookPage } from '../lib/cook';
import { displayTitle, recipes } from '../lib/recipes';
import { useSaved } from '../lib/saved';
import { shareRecipe } from '../lib/share';
import { timersIn } from '../lib/timers';
import { font, space, type as t } from '../theme/tokens';

// Cook mode keeps its own low-glare kitchen palette in both themes: warm charcoal, cream ink and garden greens.
const k = {
  ground: '#1D1E19',
  raised: '#2A2B24',
  ink: '#F3EFE3',
  soft: '#CFCABC',
  green: '#8FC27A',
  greenDeep: '#B6DBA2',
  accent: '#9CC488',
  line: 'rgba(243,239,227,0.14)',
};

type Props = NativeStackScreenProps<{ Cook: { slug: string } }, 'Cook'>;

export function CookScreen({ route, navigation }: Props) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotion();
  const saved = useSaved();
  const list = useRef<FlatList<CookPage>>(null);
  const r = recipes.find((x) => x.slug === route.params.slug);
  const pages = useMemo(() => (r ? cookPages(r) : []), [r]);
  const [index, setIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState<RunningTimer | null>(null);
  const [timesCooked, setTimesCooked] = useState(0);

  const progress = useAnimatedStyle(() => ({
    width: withTiming(`${((index + 1) / Math.max(pages.length, 1)) * 100}%`, { duration: reduce ? 0 : 400 }),
  }));

  if (!r) return null;
  const title = displayTitle(r);
  const page = pages[index];
  const last = index === pages.length - 1;

  const go = (to: number) => {
    Haptics.selectionAsync();
    setSheetOpen(false);
    list.current?.scrollToIndex({ index: to, animated: !reduce });
    setIndex(to);
  };

  if (done) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + space.l, paddingBottom: insets.bottom + space.l }]}>
        <StatusBar style="light" />
        <Animated.View entering={reduce ? undefined : FadeIn.duration(400)} style={styles.finish}>
          <StirringPot color={k.ink} size={170} />
          <Text style={[t.hand, styles.finishTitle]}>{title} is ready.</Text>
          <Text style={[t.body, { color: k.soft, textAlign: 'center' }]}>
            {timesCooked > 1 ? `That's time number ${timesCooked} for this one. Must be a keeper!` : 'Time to dig in. I hope it hits the spot!'}
          </Text>
          <CookedStamp count={timesCooked} color={k.greenDeep} style={{ alignSelf: 'center' }} />
          <View style={styles.finishRow}>
            <HeartButton saved={saved.isSaved(r.slug)} onToggle={() => saved.toggle(r.slug)} label={title} size={56} />
            <Text style={[t.hand, { color: k.greenDeep, flex: 1 }]}>
              {saved.isSaved(r.slug) ? "Saved. It'll be in your Saved tab for next time." : 'Liked it? Save it for next time.'}
            </Text>
          </View>
        </Animated.View>
        <View style={[styles.nav, { paddingHorizontal: space.xl }]}>
          <Pressable onPress={() => shareRecipe(r)} accessibilityRole="button" style={[styles.back, { borderColor: k.line }]}>
            <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Share it</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" style={[styles.primary, { backgroundColor: k.accent, flex: 1 }]}>
            <Text style={styles.primaryText}>Back to the recipe</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.s }]}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Stop cooking" hitSlop={12} style={styles.close}>
          <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Done</Text>
        </Pressable>
        <Text style={[t.label, { color: k.soft }]} accessibilityLiveRegion="polite">
          {pages.length > 1 ? `${index + 1} of ${pages.length}` : title}
        </Text>
        <View style={styles.close} />
      </View>

      <View style={styles.track} accessible={false}>
        <Svg width="100%" height={4} style={StyleSheet.absoluteFill}>
          <Line x1="2" y1="2" x2="100%" y2="2" stroke={k.line} strokeWidth={3} strokeDasharray="1 8" strokeLinecap="round" />
        </Svg>
        <Animated.View style={[styles.fill, { backgroundColor: k.green }, progress]} />
      </View>

      <FlatList
        ref={list}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== index) {
            Haptics.selectionAsync();
            setSheetOpen(false);
            setIndex(i);
          }
        }}
        renderItem={({ item, index: i }) => (
          <ScrollView style={{ width }} contentContainerStyle={styles.page}>
            <Text style={[t.hand, { color: k.greenDeep, fontSize: 22 }]} accessibilityRole="header">
              {item.title}
            </Text>
            {item.steps.map((s: string, si: number) => (
              <Animated.View key={si} entering={reduce || i !== index ? undefined : FadeInDown.duration(350).delay(si * 70)} style={{ gap: space.s }}>
                <Text style={[styles.step, { color: si === 0 ? k.ink : k.soft }]}>{s}</Text>
                {timersIn(s).map((tm) => (
                  <Pressable
                    key={tm.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      const ms = Math.round(tm.minutes * 60_000);
                      setTimer({ label: tm.label, endsAt: Date.now() + ms, totalMs: ms });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Start a ${tm.label} timer`}
                    style={[styles.timerChip, { borderColor: k.green }]}
                  >
                    <Text style={[t.label, { color: k.greenDeep }]}>Start {tm.label} timer</Text>
                  </Pressable>
                ))}
              </Animated.View>
            ))}
          </ScrollView>
        )}
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.m }]}>
        {timer && (
          <KitchenTimer
            timer={timer}
            colors={k}
            onAddMinute={() => setTimer((tm) => tm && { ...tm, endsAt: tm.endsAt + 60_000, totalMs: tm.totalMs + 60_000 })}
            onStop={() => setTimer(null)}
          />
        )}
        {page && page.ingredients.length > 0 && (
          <Pressable
            onPress={() => setSheetOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: sheetOpen }}
            style={[styles.sheet, { backgroundColor: k.raised }]}
          >
            <View style={styles.sheetHead}>
              <Text style={[t.label, { color: k.ink }]}>
                {page.ingredients.length === r.ingredients.flatMap((g) => g.items).length ? 'All ingredients' : 'You need for this step'}
              </Text>
              <Text style={[t.hand, { color: k.greenDeep, fontSize: 18, paddingRight: 6 }]} numberOfLines={1} textBreakStrategy="simple">
                {sheetOpen ? 'hide' : `${page.ingredients.length} ${page.ingredients.length === 1 ? 'item' : 'items'}`}
              </Text>
            </View>
            {sheetOpen &&
              page.ingredients.map((ing) => (
                <Animated.Text key={ing} entering={reduce ? undefined : FadeIn.duration(200)} style={[t.body, { color: k.soft }]}>
                  • {ing}
                </Animated.Text>
              ))}
          </Pressable>
        )}
        <View style={styles.nav}>
          {index > 0 && (
            <Pressable onPress={() => go(index - 1)} accessibilityRole="button" accessibilityLabel="Previous step" style={[styles.back, { borderColor: k.line }]}>
              <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (last) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimesCooked(saved.markCooked(r.slug));
                setTimer(null);
                setDone(true);
              } else go(index + 1);
            }}
            accessibilityRole="button"
            style={[styles.primary, { backgroundColor: k.accent, flex: 1 }]}
          >
            <Text style={styles.primaryText}>{last ? "I'm done!" : 'Next step'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: k.ground },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, minHeight: 44 },
  close: { minWidth: 56 },
  track: { height: 4, marginHorizontal: space.xl, marginTop: space.s, borderRadius: 2, overflow: 'hidden', justifyContent: 'center' },
  fill: { height: 4, borderRadius: 2 },
  page: { paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.xxl, gap: space.l },
  step: { fontFamily: font.sans, fontSize: 26, lineHeight: 36 },
  timerChip: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 2, justifyContent: 'center' },
  bottom: { paddingHorizontal: space.xl, gap: space.m },
  sheet: { borderRadius: 22, padding: space.l, gap: 6 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28 },
  nav: { flexDirection: 'row', gap: space.m },
  back: { minHeight: 56, paddingHorizontal: space.xl, borderRadius: 28, borderWidth: 2, justifyContent: 'center' },
  primary: { minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  primaryText: { fontFamily: font.sansBold, fontSize: 17, color: '#1D1E19' },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingHorizontal: space.xl },
  finishTitle: { color: k.ink, fontSize: 30, lineHeight: 36, textAlign: 'center' },
  finishRow: { flexDirection: 'row', alignItems: 'center', gap: space.l, marginTop: space.l, alignSelf: 'stretch' },
});
