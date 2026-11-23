import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

// The cook-mode helper: a small tuxedo cat after the CheapQuickVegan tab icon.
// A stand-in built in code; each moving part is its own layer, so a Rive file (or Stephanie's
// drawing) can replace it later while keeping the same moods.

export type CatMood = 'idle' | 'listening' | 'alert' | 'happy';

type Props = {
  /** Where along the trail to sit, in px from the left of the parent. */
  x?: number;
  /** Which way it last walked, so it faces where it's going. */
  facing?: 'right' | 'left';
  mood?: CatMood;
  /** Bump to make the ears perk once ("I heard you"). */
  perkKey?: number;
  size?: number;
  outline: string;
  style?: ViewStyle;
};

const W = 60;
const H = 48;
const FUR = '#141412';
const CREAM = '#F6F1E4';
const EYES = '#9FD27F';
const PINK = '#E9A3AE';
const COLLAR = '#6FAE5B';

export function CookCat({ x = 0, facing = 'right', mood = 'idle', perkKey = 0, size = 46, outline, style }: Props) {
  const reduce = useReducedMotion();
  const h = (size / W) * H;
  /** A point in the 60×48 drawing, in px, for rotating a layer about it. */
  const origin = (px: number, py: number): [number, number, number] => [Math.round((px / W) * size * 10) / 10, Math.round((py / H) * h * 10) / 10, 0];
  const line = { stroke: outline, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

  const posX = useSharedValue(x);
  const bob = useSharedValue(0);
  const tail = useSharedValue(0);
  const blink = useSharedValue(1);
  const ears = useSharedValue(0);
  const paw = useSharedValue(0);
  const hop = useSharedValue(0);

  // Walk: trot to the new spot with a little bob.
  useEffect(() => {
    if (reduce) {
      posX.value = x;
      return;
    }
    if (Math.abs(posX.value - x) < 1) return;
    posX.value = withTiming(x, { duration: 650, easing: Easing.inOut(Easing.quad) });
    bob.value = withSequence(
      withRepeat(withSequence(withTiming(-2.5, { duration: 110 }), withTiming(0, { duration: 110 })), 3, false),
      withTiming(0, { duration: 1 }),
    );
    tail.value = withSequence(withTiming(14, { duration: 300 }), withSpring(0));
  }, [x, reduce, posX, bob, tail]);

  // Idle life: a slow blink and an occasional tail flick, never constant.
  useEffect(() => {
    if (reduce) return;
    blink.value = withRepeat(
      withSequence(withDelay(4200, withTiming(0.1, { duration: 90 })), withTiming(1, { duration: 120 })),
      -1,
      false,
    );
    tail.value = withRepeat(
      withSequence(withDelay(6500, withTiming(12, { duration: 260, easing: Easing.out(Easing.quad) })), withTiming(-4, { duration: 300 }), withSpring(0)),
      -1,
      false,
    );
    return () => {
      cancelAnimation(blink);
      cancelAnimation(tail);
    };
  }, [reduce, blink, tail]);

  // Moods.
  useEffect(() => {
    if (reduce) {
      ears.value = mood === 'listening' ? 1 : 0;
      return;
    }
    cancelAnimation(paw);
    cancelAnimation(hop);
    ears.value = withSpring(mood === 'listening' || mood === 'alert' ? 1 : 0);
    paw.value = 0;
    hop.value = 0;
    if (mood === 'alert') {
      // Paw-tap toward the timer.
      paw.value = withRepeat(withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 220 })), -1, false);
    }
    if (mood === 'happy') {
      hop.value = withRepeat(withSequence(withDelay(900, withTiming(-5, { duration: 160 })), withSpring(0, { damping: 8 })), -1, false);
    }
  }, [mood, reduce, ears, paw, hop]);

  // Heard a voice command: ears perk once.
  useEffect(() => {
    if (!perkKey || reduce) return;
    ears.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(mood === 'listening' ? 1 : 0));
  }, [perkKey, reduce, ears, mood]);

  const whole = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value }, { translateY: bob.value + hop.value }, { scaleX: facing === 'left' ? -1 : 1 }],
  }));
  const tailStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tail.value}deg` }] }));
  const earStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -ears.value * 1.6 }, { scaleY: 1 + ears.value * 0.08 }] }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const pawStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -paw.value * 5 }, { rotate: `${-paw.value * 25}deg` }] }));

  const layer = { position: 'absolute' as const, left: 0, top: 0, width: size, height: h };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={h} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </Svg>
  );

  return (
    <Animated.View style={[{ width: size, height: h }, whole, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      {/* tail, behind the body */}
      <Animated.View style={[layer, { transformOrigin: origin(15, 40) }, tailStyle]}>
        {svg(<Path d="M15 40 C6 40 3 33 5 26 C6 22 9 20 10 16" fill="none" {...line} strokeWidth={4.2} stroke={outline} />)}
      </Animated.View>
      <Animated.View style={[layer, { transformOrigin: origin(15, 40) }, tailStyle]}>
        {svg(<Path d="M15 40 C6 40 3 33 5 26 C6 22 9 20 10 16" fill="none" stroke={FUR} strokeWidth={2.4} strokeLinecap="round" />)}
      </Animated.View>

      {/* body, bib, back paw, collar */}
      <View style={layer}>
        {svg(
          <>
            <Path d="M13 43 C7 43 7 33 12 28 C17 23 24 21 30 21 C35 21 38 25 39 31 L41 43 Z" fill={FUR} {...line} />
            <Path d="M34 27 C37 30 39 36 39.5 43 L34 43 C34 37 33 32 34 27 Z" fill={CREAM} />
            <Ellipse cx="15" cy="43" rx="4" ry="1.8" fill={CREAM} {...line} strokeWidth={1.2} />
            <Ellipse cx="34.5" cy="43" rx="3" ry="1.7" fill={CREAM} {...line} strokeWidth={1.2} />
          </>,
        )}
      </View>

      {/* front paw (taps when the timer's done) */}
      <Animated.View style={[layer, { transformOrigin: origin(39, 36) }, pawStyle]}>
        {svg(<Ellipse cx="40.5" cy="43" rx="3" ry="1.7" fill={CREAM} {...line} strokeWidth={1.2} />)}
      </Animated.View>

      {/* ears */}
      <Animated.View style={[layer, { transformOrigin: origin(40, 12) }, earStyle]}>
        {svg(
          <>
            <Path d="M32.5 12 L32 2.5 L38 8 Z" fill={FUR} {...line} />
            <Path d="M33.6 9.5 L33.4 5.2 L36.2 7.9 Z" fill={PINK} />
            <Path d="M42.5 8 L48 2.5 L48 12 Z" fill={FUR} {...line} />
            <Path d="M44 7.9 L46.8 5.2 L46.7 9.5 Z" fill={PINK} />
          </>,
        )}
      </Animated.View>

      {/* head, muzzle, collar */}
      <View style={layer}>
        {svg(
          <>
            <Path d="M31 17 C31 10.5 35 7.5 40 7.5 C45 7.5 49 10.5 49 17 C49 22 45 25 40 25 C35 25 31 22 31 17 Z" fill={FUR} {...line} />
            <Path d="M37 19 C37 16.5 43 16.5 43 19 C43 22 41.5 23.2 40 23.2 C38.5 23.2 37 22 37 19 Z" fill={CREAM} />
            <Path d="M39.2 18.4 H40.8 L40 19.4 Z" fill={PINK} />
            <Path d="M33 22.5 C36 25.5 44 25.5 47 22" fill="none" stroke={COLLAR} strokeWidth={2.2} strokeLinecap="round" />
            <Circle cx="40" cy="26.6" r="1.4" fill={CREAM} />
          </>,
        )}
      </View>

      {/* eyes (blink) */}
      <Animated.View style={[layer, { transformOrigin: origin(40, 14.5) }, eyeStyle]}>
        {svg(
          <>
            <Ellipse cx="36.5" cy="14.5" rx="1.9" ry="2.1" fill={EYES} />
            <Ellipse cx="43.5" cy="14.5" rx="1.9" ry="2.1" fill={EYES} />
            <Ellipse cx="36.7" cy="14.6" rx="0.6" ry="1.5" fill={FUR} />
            <Ellipse cx="43.7" cy="14.6" rx="0.6" ry="1.5" fill={FUR} />
          </>,
        )}
      </Animated.View>
    </Animated.View>
  );
}
