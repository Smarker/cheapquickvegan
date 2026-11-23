import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { StirringPot } from '../components/Doodles';
import { CookedStamp } from '../components/CookedStamp';
import { HeartButton } from '../components/HeartButton';
import { CookCat, type CatMood } from '../components/CookCat';
import { KitchenTimer, type RunningTimer } from '../components/KitchenTimer';
import { handsFreeAvailable, useHandsFree } from '../lib/handsFree';
import { convertInStep, linesIn } from '../lib/units';
import { usePrefs, useUnits } from '../lib/prefs';
import { findIngredient, type VoiceCommand } from '../lib/voice';
import { cookPages, ingredientAmounts, ingredientTerms, toolTerms, type CookPage } from '../lib/cook';
import { HighlightedText } from '../components/HighlightedText';
import { displayTitle, recipes } from '../lib/recipes';
import { useDataVersion } from '../lib/data';
import { useSaved } from '../lib/saved';
import { shareRecipe } from '../lib/share';
import { timersIn } from '../lib/timers';
import { cancelTimerDone, scheduleTimerDone } from '../lib/timerNotifications';
import { font, space, type as t } from '../theme/tokens';

// Cook mode keeps its own low-glare kitchen palette in both themes: warm charcoal, cream ink and garden greens.
/** The helper cat on the trail, in px wide. */
const CAT = 40;

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
  useDataVersion(); // re-render when live recipe data arrives
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotion();
  const saved = useSaved();
  const list = useRef<FlatList<CookPage>>(null);
  const r = recipes.find((x) => x.slug === route.params.slug);
  const pages = useMemo(() => (r ? cookPages(r) : []), [r]);
  const terms = useMemo(() => (r ? ingredientTerms(r.ingredients.flatMap((g) => g.items)) : []), [r]);
  // Amounts sit inline after each ingredient's first mention, so nobody taps a phone with messy hands.
  const tools = useMemo(() => (r ? toolTerms(r.equipment) : []), [r]);
  const { units } = useUnits();
  // Amounts follow the cups-or-grams choice made on the recipe page.
  const lines = useMemo(() => (r ? linesIn(r.ingredients.flatMap((g) => g.items), units) : []), [r, units]);
  const amounts = useMemo(() => ingredientAmounts(lines), [lines]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState<RunningTimer | null>(null);
  const notification = useRef<string | null>(null);

  // One timer at a time. Each change reschedules the background "time's up" notification.
  const runTimer = (next: RunningTimer | null) => {
    cancelTimerDone(notification.current);
    notification.current = null;
    setTimer(next);
    if (next && r) scheduleTimerDone(next.label, displayTitle(r), next.endsAt).then((id) => (notification.current = id));
  };

  // Leaving with a timer still running: it keeps going as a notification, so say so before leaving.
  const leave = () => {
    if (timer && timer.endsAt > Date.now()) {
      Alert.alert('Leave cook mode?', `Your ${timer.label} timer will keep running and ring as a notification.`, [
        { text: 'Keep cooking', style: 'cancel' },
        { text: 'Leave', onPress: () => navigation.goBack() },
      ]);
    } else navigation.goBack();
  };
  const [timesCooked, setTimesCooked] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [trailW, setTrailW] = useState(0);
  const [perk, setPerk] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const lastIndex = useRef(0);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  useEffect(() => {
    if (index !== lastIndex.current) setFacing(index > lastIndex.current ? 'right' : 'left');
    lastIndex.current = index;
  }, [index]);
  useEffect(() => {
    setTimerDone(false);
    if (!timer) return;
    const id = setTimeout(() => setTimerDone(true), Math.max(0, timer.endsAt - Date.now()));
    return () => clearTimeout(id);
  }, [timer]);
  const canVoice = useMemo(handsFreeAvailable, []);
  const prefs = usePrefs();

  const voice = useHandsFree({
    onCommand: (cmd) => handleVoice(cmd),
    onUnknown: (said) => setHeard(`Heard “${said}”. Try “next step”.`),
  });
  // Hands-free from the start, if the cook asked for that in Kitchen → Preferences.
  useEffect(() => {
    if (prefs.autoHandsFree && canVoice) voice.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!heard) return;
    const id = setTimeout(() => setHeard(null), 3000);
    return () => clearTimeout(id);
  }, [heard]);

  const progress = useAnimatedStyle(() => ({
    width: withTiming(`${((index + 1) / Math.max(pages.length, 1)) * 100}%`, { duration: reduce ? 0 : 400 }),
  }));

  if (!r) return null;
  const title = displayTitle(r);
  const page = pages[index];
  const last = index === pages.length - 1;
  const catMood: CatMood = timer && timerDone ? 'alert' : voice.on ? 'listening' : 'idle';

  const go = (to: number) => {
    Haptics.selectionAsync();
    list.current?.scrollToIndex({ index: to, animated: !reduce });
    setIndex(to);
  };

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimesCooked(saved.markCooked(r.slug));
    // A running timer stays: finishing the steps doesn't mean the oven is done.
    voice.stop();
    setDone(true);
  };

  const readPage = (i: number) => {
    const pg = pages[i];
    if (pg) voice.say([pg.title, ...pg.steps].join('. '));
  };

  // Hands-free: what a cook might ask with their hands full, answered out loud.
  function handleVoice(cmd: VoiceCommand) {
    if (!r) return;
    const allLines = lines;
    setHeard(null);
    setPerk((n) => n + 1);
    switch (cmd.type) {
      case 'next':
        if (last) return finish();
        go(index + 1);
        return readPage(index + 1);
      case 'back':
        if (index === 0) return voice.say("You're on the first step.");
        go(index - 1);
        return readPage(index - 1);
      case 'repeat':
        return readPage(index);
      case 'finish':
        return finish();
      case 'stopListening':
        voice.say('Okay, hands-free is off.');
        return voice.stop();
      case 'startTimer': {
        const found = cmd.minutes == null ? page?.steps.flatMap(timersIn)[0] : null;
        const minutes = cmd.minutes ?? found?.minutes;
        if (!minutes) return voice.say('How long? Say, set a timer for 5 minutes.');
        const label = found?.label ?? (minutes >= 1 ? `${Math.round(minutes)} min` : `${Math.round(minutes * 60)} sec`);
        const ms = Math.round(minutes * 60_000);
        runTimer({ label, endsAt: Date.now() + ms, totalMs: ms });
        return voice.say(`Timer started for ${label.replace(/\bmin\b/, 'minutes').replace(/\bsec\b/, 'seconds')}.`);
      }
      case 'stopTimer':
        if (!timer) return voice.say("There's no timer running.");
        runTimer(null);
        return voice.say('Timer stopped.');
      case 'timeLeft': {
        if (!timer) return voice.say("There's no timer running.");
        const secs = Math.max(0, Math.round((timer.endsAt - Date.now()) / 1000));
        const mins = Math.floor(secs / 60);
        const rest = secs % 60;
        return voice.say(mins ? `${mins} minute${mins === 1 ? '' : 's'}${rest ? ` and ${rest} seconds` : ''} left.` : `${secs} seconds left.`);
      }
      case 'amount': {
        const line = findIngredient(cmd.item, allLines);
        return voice.say(line ?? `I can't find ${cmd.item} in this recipe.`);
      }
      case 'ingredients': {
        const need = page?.ingredients.length ? linesIn(page.ingredients, units) : allLines;
        return voice.say(need.join('. '));
      }
    }
  }

  if (done) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + space.l, paddingBottom: insets.bottom + space.l }]}>
        <StatusBar style="light" />
        <Animated.View entering={reduce ? undefined : FadeIn.duration(400)} style={styles.finish}>
          <View style={styles.potRow}>
            <StirringPot color={k.ink} size={170} />
            {prefs.helper && <CookCat mood={timerDone || !timer ? 'happy' : 'idle'} outline={k.ink} size={72} style={{ marginLeft: -18, marginBottom: 4 }} />}
          </View>
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
        {timer && (
          <View style={{ paddingHorizontal: space.xl, marginBottom: space.m }}>
            <KitchenTimer
              timer={timer}
              colors={k}
              onAddMinute={() => runTimer({ ...timer, endsAt: timer.endsAt + 60_000, totalMs: timer.totalMs + 60_000 })}
              onStop={() => runTimer(null)}
            />
          </View>
        )}
        <View style={[styles.nav, { paddingHorizontal: space.xl }]}>
          <Pressable onPress={() => shareRecipe(r)} accessibilityRole="button" style={[styles.back, { borderColor: k.line }]}>
            <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Share it</Text>
          </Pressable>
          <Pressable onPress={leave} accessibilityRole="button" style={[styles.primary, { backgroundColor: k.accent, flex: 1 }]}>
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
        <Pressable onPress={leave} accessibilityRole="button" accessibilityLabel="Stop cooking" hitSlop={12} style={styles.close}>
          <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Done</Text>
        </Pressable>
        <Text style={[t.label, { color: k.soft }]} accessibilityLiveRegion="polite">
          {pages.length > 1 ? `${index + 1} of ${pages.length}` : title}
        </Text>
        {canVoice ? (
          <Pressable
            onPress={() => (voice.on ? voice.stop() : voice.start().then((ok) => ok && voice.say('Hands-free is on. Say next step, or how much garlic.')))}
            accessibilityRole="switch"
            accessibilityState={{ checked: voice.on }}
            accessibilityLabel="Hands-free voice commands"
            hitSlop={8}
            style={[styles.voice, { borderColor: voice.on ? k.green : k.line, backgroundColor: voice.on ? k.raised : 'transparent' }]}
          >
            <View style={[styles.voiceDot, { backgroundColor: voice.listening ? k.green : 'transparent', borderColor: voice.on ? k.green : k.soft }]} />
            <Text style={[t.label, { color: k.ink }]}>{voice.on ? 'Listening' : 'Hands-free'}</Text>
          </Pressable>
        ) : (
          <View style={styles.close} />
        )}
      </View>
      {voice.on && (
        <Text style={[t.hand, styles.voiceHint]} accessibilityLiveRegion="polite" numberOfLines={1} textBreakStrategy="simple">
          {heard ?? 'Say “next step”, “repeat” or “how much garlic?”'}
        </Text>
      )}

      <View style={styles.trail} onLayout={(e) => setTrailW(e.nativeEvent.layout.width)}>
        {trailW > 0 && prefs.helper && (
          <CookCat
            x={Math.min(Math.max(((index + 1) / Math.max(pages.length, 1)) * trailW - CAT * 0.8, 0), trailW - CAT)}
            facing={facing}
            mood={catMood}
            perkKey={perk}
            outline={k.ink}
            size={CAT}
            style={styles.cat}
          />
        )}
        <View style={styles.track} accessible={false}>
          <Svg width="100%" height={4} style={StyleSheet.absoluteFill}>
            <Line x1="2" y1="2" x2="100%" y2="2" stroke={k.line} strokeWidth={3} strokeDasharray="1 8" strokeLinecap="round" />
          </Svg>
          <Animated.View style={[styles.fill, { backgroundColor: k.green }, progress]} />
        </View>
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
                <HighlightedText
                  text={s}
                  terms={terms}
                  style={[styles.step, { color: si === 0 ? k.ink : k.soft }]}
                  highlight={{ fontFamily: font.sansBold, color: k.greenDeep }}
                  amounts={amounts}
                  amountStyle={styles.amountText}
                  amountTag={styles.amountTag}
                  tools={tools}
                  toolStyle={styles.tool}
                  convertAmount={(amount, after) => convertInStep(amount, after, units)}
                />
                {timersIn(s).map((tm) => (
                  <Pressable
                    key={tm.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      const ms = Math.round(tm.minutes * 60_000);
                      runTimer({ label: tm.label, endsAt: Date.now() + ms, totalMs: ms });
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
            onAddMinute={() => runTimer({ ...timer, endsAt: timer.endsAt + 60_000, totalMs: timer.totalMs + 60_000 })}
            onStop={() => runTimer(null)}
          />
        )}
        <View style={styles.nav}>
          {index > 0 && (
            <Pressable onPress={() => go(index - 1)} accessibilityRole="button" accessibilityLabel="Previous step" style={[styles.back, { borderColor: k.line }]}>
              <Text style={[t.label, { color: k.ink, fontSize: 16 }]}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (last) finish();
              else go(index + 1);
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
  voice: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1.5 },
  voiceDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  voiceHint: { color: k.greenDeep, fontSize: 17, paddingHorizontal: space.xl, paddingRight: space.xl + 6, marginTop: 2 },
  trail: { marginHorizontal: space.xl, height: 40, justifyContent: 'flex-end' },
  cat: { position: 'absolute', left: 0, bottom: 2 },
  potRow: { flexDirection: 'row', alignItems: 'flex-end' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', justifyContent: 'center' },
  fill: { height: 4, borderRadius: 2 },
  page: { paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.xxl, gap: space.l },
  step: { fontFamily: font.sans, fontSize: 26, lineHeight: 36 },
  // Amounts as tags: findable by shape (not colour), with even-width digits for quick scanning.
  amountTag: { backgroundColor: k.raised, borderColor: k.line, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1, transform: [{ translateY: 5 }] },
  // Tools read as underlined ink: different from ingredients (bold green) and numbers (tags) without relying on colour.
  tool: { fontFamily: font.sansMedium, color: k.ink, textDecorationLine: 'underline', textDecorationStyle: 'solid', textDecorationColor: k.green },
  amountText: { fontFamily: font.sansMedium, fontSize: 19, lineHeight: 26, color: k.ink, fontVariant: ['tabular-nums'] },
  timerChip: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 2, justifyContent: 'center' },
  bottom: { paddingHorizontal: space.xl, gap: space.m },
  nav: { flexDirection: 'row', gap: space.m },
  back: { minHeight: 56, paddingHorizontal: space.xl, borderRadius: 28, borderWidth: 2, justifyContent: 'center' },
  primary: { minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  primaryText: { fontFamily: font.sansBold, fontSize: 17, color: '#1D1E19' },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingHorizontal: space.xl },
  finishTitle: { color: k.ink, fontSize: 30, lineHeight: 36, textAlign: 'center' },
  finishRow: { flexDirection: 'row', alignItems: 'center', gap: space.l, marginTop: space.l, alignSelf: 'stretch' },
});
