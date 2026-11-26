import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { formatClock } from '../lib/timers';
import { font, type as t } from '../theme/tokens';

export type RunningTimer = { label: string; endsAt: number; totalMs: number };

type Props = {
  timer: RunningTimer;
  onAddMinute: () => void;
  onStop: () => void;
  colors: { raised: string; ink: string; soft: string; green: string; accent: string; line: string };
};

/**
 * A little ink kitchen timer that winds down while you cook. It runs off a fixed
 * end time, so it stays right if the screen sleeps or you switch apps; when time's
 * up it rings: the dial shakes and the phone buzzes a few times.
 */
export function KitchenTimer({ timer, onAddMinute, onStop, colors: c }: Props) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState(Date.now());
  const rang = useRef(false);
  const shake = useSharedValue(0);
  const remaining = timer.endsAt - now;
  const done = remaining <= 0;

  useEffect(() => {
    rang.current = false;
    const id = setInterval(() => setNow(Date.now()), 250);
    const sub = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [timer.endsAt]);

  useEffect(() => {
    if (!done || rang.current) return;
    rang.current = true;
    [0, 450, 900].forEach((ms) => setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), ms));
    if (!reduce) {
      shake.value = withRepeat(withSequence(withTiming(-10, { duration: 60 }), withTiming(10, { duration: 60 })), 8, true, () => {
        shake.value = withTiming(0, { duration: 80 });
      });
    }
    return () => cancelAnimation(shake);
  }, [done, reduce, shake]);

  const dialStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));
  const progress = Math.min(1, Math.max(0, 1 - remaining / timer.totalMs));
  // The pointer starts at the top and sweeps once around as time runs out.
  const angle = progress * 2 * Math.PI;
  const hx = 28 + Math.sin(angle) * 15;
  const hy = 30 - Math.cos(angle) * 15;

  return (
    <Animated.View
      entering={reduce ? undefined : FadeInDown.springify().damping(16)}
      exiting={reduce ? undefined : FadeOutDown.duration(200)}
      style={[styles.bar, { backgroundColor: done ? c.accent : c.raised }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={done ? `Time's up for ${timer.label}` : `${timer.label} timer, ${formatClock(remaining)} left`}
    >
      <Animated.View style={dialStyle}>
        <Svg width={56} height={60} viewBox="0 0 56 60">
          {/* bell knob */}
          <Path d="M23 6 C23 2 33 2 33 6" stroke={done ? '#1D1E19' : c.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <Circle cx="28" cy="30" r="21" stroke={done ? '#1D1E19' : c.ink} strokeWidth={2.4} fill="none" />
          {/* elapsed wedge, drawn as a thick arc */}
          <Circle
            cx="28"
            cy="30"
            r="15"
            stroke={done ? '#1D1E19' : c.green}
            strokeWidth={8}
            fill="none"
            strokeDasharray={`${2 * Math.PI * 15}`}
            strokeDashoffset={`${2 * Math.PI * 15 * (1 - progress)}`}
            transform="rotate(-90 28 30)"
            opacity={0.55}
          />
          <Line x1="28" y1="30" x2={hx} y2={hy} stroke={done ? '#1D1E19' : c.ink} strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx="28" cy="30" r="2.6" fill={done ? '#1D1E19' : c.ink} />
          {done && <Path d="M6 12 L2 8 M50 12 L54 8 M4 24 L0 23 M52 24 L56 23" stroke="#1D1E19" strokeWidth={2} strokeLinecap="round" />}
        </Svg>
      </Animated.View>

      <View style={{ flex: 1 }}>
        <Text style={[t.label, { color: done ? '#1D1E19' : c.soft, paddingRight: 6 }]} numberOfLines={2} textBreakStrategy="simple">
          {done ? "Time's up! Go check it." : timer.label}
        </Text>
        <Text style={[styles.clock, { color: done ? '#1D1E19' : c.ink }]}>{done ? '0:00' : formatClock(remaining)}</Text>
      </View>

      {!done && (
        <Pressable onPress={onAddMinute} accessibilityRole="button" accessibilityLabel="Add one minute" hitSlop={6} style={[styles.small, { borderColor: c.line }]}>
          <Text style={[t.label, { color: c.ink }]}>+1 min</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onStop}
        accessibilityRole="button"
        accessibilityLabel={done ? 'Dismiss timer' : 'Stop timer'}
        hitSlop={6}
        style={[styles.small, { borderColor: done ? '#1D1E19' : c.line }]}
      >
        <Text style={[t.label, { color: done ? '#1D1E19' : c.ink }]}>{done ? 'Got it' : 'Stop'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 24, paddingVertical: 8, paddingHorizontal: 12 },
  clock: { fontFamily: font.sansBold, fontSize: 26, lineHeight: 30, fontVariant: ['tabular-nums'] },
  small: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
