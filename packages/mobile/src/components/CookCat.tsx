import { useEffect, useRef, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

// The cook-mode helper: a small tuxedo cat after the CheapQuickVegan tab icon.
// A stand-in built in code (a Rive file or Stephanie's drawing can replace it with the same moods).
// Cute-cat rules it follows: a big round head, eyes set low with a catch-light, a tiny nose,
// a bean-shaped body, and motion that eases in and out, never constant.

export type CatMood = 'idle' | 'listening' | 'alert' | 'happy';
type Pose = 'sit' | 'walk' | 'lick' | 'sleep';

type Props = {
  /** Where along the trail to sit, in px from the left of the parent. */
  x?: number;
  facing?: 'right' | 'left';
  mood?: CatMood;
  /** Bump to make the ears perk once ("I heard you"). */
  perkKey?: number;
  size?: number;
  outline: string;
  style?: ViewStyle;
  /** Seconds without anything happening before it curls up for a nap. */
  napAfter?: number;
};

const W = 64;
const H = 48;
const FUR = '#1B1B19';
const CREAM = '#F7F2E6';
const EYES = '#A6D684';
const PINK = '#EBA7B3';
const COLLAR = '#6FAE5B';

/** An outlined limb or tail: a cream stroke with black fur on top, so it reads on a dark screen. */
const Limb = ({ d, w, outline, end }: { d: string; w: number; outline: string; end?: React.ReactNode }) => (
  <>
    <Path d={d} stroke={outline} strokeWidth={w + 2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d={d} stroke={FUR} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {end}
  </>
);

/** White paw at the end of a leg. */
const Paw = ({ cx, cy, outline }: { cx: number; cy: number; outline: string }) => (
  <Ellipse cx={cx} cy={cy} rx={2.6} ry={1.7} fill={CREAM} stroke={outline} strokeWidth={0.9} />
);

/** Head, drawn around (42, 17). Eyes open with catch-lights, or closed in content little arcs. */
function Head({ outline, closed, tongue, ears = true, noEyes }: { outline: string; closed?: boolean; tongue?: boolean; ears?: boolean; noEyes?: boolean }) {
  const line = { stroke: outline, strokeWidth: 1.3, strokeLinejoin: 'round' as const };
  return (
    <>
      {ears && (
        <>
          <Path d="M32.6 12 C31.6 7 32.6 3 34 1.6 C36.4 3.2 38.6 5.4 39.8 7.6 Z" fill={FUR} {...line} />
          <Path d="M34.2 9.6 C33.8 7 34.2 5 34.8 4.2 C36 5.2 37.2 6.4 37.8 7.6 Z" fill={PINK} />
          <Path d="M44.2 7.6 C45.4 5.4 47.6 3.2 50 1.6 C51.4 3 52.4 7 51.4 12 Z" fill={FUR} {...line} />
          <Path d="M46.2 7.6 C46.8 6.4 48 5.2 49.2 4.2 C49.8 5 50.2 7 49.8 9.6 Z" fill={PINK} />
        </>
      )}
      {/* round head with soft cheeks */}
      <Path d="M31 18 C31 10.5 36 6.4 42 6.4 C48 6.4 53 10.5 53 18 C53 22 51.4 24.6 48.6 26.2 C46.6 27.4 44.4 27.8 42 27.8 C39.6 27.8 37.4 27.4 35.4 26.2 C32.6 24.6 31 22 31 18 Z" fill={FUR} {...line} />
      {/* white muzzle and chin */}
      <Path d="M38.4 21.6 C38.4 19.2 40.4 18.6 42 19.6 C43.6 18.6 45.6 19.2 45.6 21.6 C45.6 24.6 43.8 26.4 42 26.4 C40.2 26.4 38.4 24.6 38.4 21.6 Z" fill={CREAM} />
      {closed ? (
        <>
          <Path d="M35.6 17.4 C36.6 18.8 38.6 18.8 39.6 17.4" fill="none" stroke={EYES} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M44.4 17.4 C45.4 18.8 47.4 18.8 48.4 17.4" fill="none" stroke={EYES} strokeWidth={1.3} strokeLinecap="round" />
        </>
      ) : noEyes ? null : (
        <>
          <Ellipse cx={37.6} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
          <Ellipse cx={46.4} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
          <Ellipse cx={37.8} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
          <Ellipse cx={46.6} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
          <Ellipse cx={38.6} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
          <Ellipse cx={47.4} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
        </>
      )}
      {/* tiny nose and mouth */}
      <Path d="M41 21 H43 L42 22.2 Z" fill={PINK} />
      <Path d="M40.4 23 C41 23.8 41.8 23.6 42 22.6 C42.2 23.6 43 23.8 43.6 23" fill="none" stroke={FUR} strokeWidth={0.6} strokeLinecap="round" />
      {tongue && <Ellipse cx={42} cy={24.6} rx={0.9} ry={1.1} fill={PINK} />}
      {/* whiskers */}
      <Path d="M38.4 22 L33.4 21 M38.6 23.2 L33.8 23.8 M45.6 22 L50.6 21 M45.4 23.2 L50.2 23.8" stroke={outline} strokeWidth={0.45} strokeOpacity={0.75} strokeLinecap="round" />
    </>
  );
}

const Collar = () => (
  <>
    <Path d="M34.4 25.6 C38 28.6 46 28.6 49.6 25.2" fill="none" stroke={COLLAR} strokeWidth={2} strokeLinecap="round" />
    <Ellipse cx={42} cy={29.2} rx={1.3} ry={1.3} fill={CREAM} />
  </>
);

export function CookCat({ x = 0, facing = 'right', mood = 'idle', perkKey = 0, size = 48, outline, style, napAfter = 45 }: Props) {
  const reduce = useReducedMotion();
  const h = (size / W) * H;
  const origin = (px: number, py: number): [number, number, number] => [Math.round((px / W) * size * 10) / 10, Math.round((py / H) * h * 10) / 10, 0];
  const line = { stroke: outline, strokeWidth: 1.3, strokeLinejoin: 'round' as const };

  const [pose, setPose] = useState<Pose>('sit');
  const lastActivity = useRef(Date.now());
  const busy = useRef(false); // walking or licking: don't interrupt with another idle behaviour

  const posX = useSharedValue(x);
  const bob = useSharedValue(0);
  const stride = useSharedValue(0);
  const tail = useSharedValue(0);
  const blink = useSharedValue(1);
  const ears = useSharedValue(0);
  const paw = useSharedValue(0);
  const hop = useSharedValue(0);
  const tilt = useSharedValue(0);
  const breathe = useSharedValue(0);
  const zz = useSharedValue(0);

  const wake = () => {
    lastActivity.current = Date.now();
  };

  // Walk to each new step: legs step in diagonal pairs, the body bobs, then it sits.
  useEffect(() => {
    wake();
    if (reduce) {
      posX.value = x;
      return;
    }
    if (Math.abs(posX.value - x) < 1) return;
    busy.current = true;
    setPose('walk');
    posX.value = withTiming(x, { duration: 900, easing: Easing.inOut(Easing.quad) });
    stride.value = withRepeat(withTiming(1, { duration: 150, easing: Easing.inOut(Easing.sin) }), 6, true);
    bob.value = withRepeat(withSequence(withTiming(-1.6, { duration: 150 }), withTiming(0, { duration: 150 })), 3, false);
    const id = setTimeout(() => {
      stride.value = withTiming(0, { duration: 120 });
      setPose('sit');
      busy.current = false;
    }, 950);
    return () => clearTimeout(id);
  }, [x, reduce, posX, stride, bob]);

  // Moods wake it up and set the ears and paws.
  useEffect(() => {
    wake();
    if (mood !== 'idle' && pose === 'sleep') setPose('sit');
    if (reduce) {
      ears.value = mood === 'listening' ? 1 : 0;
      return;
    }
    cancelAnimation(paw);
    cancelAnimation(hop);
    ears.value = withSpring(mood === 'listening' || mood === 'alert' ? 1 : 0);
    paw.value = withTiming(0, { duration: 150 });
    hop.value = 0;
    if (mood === 'alert') paw.value = withRepeat(withSequence(withTiming(0.45, { duration: 180 }), withTiming(0, { duration: 220 })), -1, false);
    if (mood === 'happy') hop.value = withRepeat(withSequence(withDelay(1400, withTiming(-5, { duration: 170 })), withSpring(0, { damping: 8 })), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, reduce]);

  // Heard a voice command: ears perk once, and it wakes.
  useEffect(() => {
    if (!perkKey) return;
    wake();
    if (pose === 'sleep') setPose('sit');
    if (reduce) return;
    ears.value = withSequence(withTiming(1.4, { duration: 120 }), withSpring(mood === 'listening' ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perkKey]);

  // Idle life: blink and the odd tail flick while sitting; now and then a paw lick;
  // after a quiet while, a nap.
  useEffect(() => {
    if (reduce) return;
    blink.value = withRepeat(withSequence(withDelay(3800, withTiming(0.1, { duration: 80 })), withTiming(1, { duration: 120 })), -1, false);
    tail.value = withRepeat(
      withSequence(withDelay(5200, withTiming(10, { duration: 260, easing: Easing.out(Easing.quad) })), withTiming(-4, { duration: 320 }), withSpring(0)),
      -1,
      false,
    );
    let lastLick = Date.now();
    const id = setInterval(() => {
      if (busy.current) return;
      const quiet = (Date.now() - lastActivity.current) / 1000;
      if (mood === 'idle' && quiet > napAfter) {
        setPose((p) => (p === 'sleep' ? p : 'sleep'));
        return;
      }
      if (Date.now() - lastLick > 14000 && quiet > 6 && mood !== 'alert') {
        lastLick = Date.now();
        busy.current = true;
        setPose('lick');
        // Paw up to the mouth, head dips, four little licks, paw down.
        paw.value = withSequence(withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }), withDelay(2000, withTiming(0, { duration: 300 })));
        tilt.value = withSequence(
          withTiming(8, { duration: 320 }),
          withRepeat(withSequence(withTiming(13, { duration: 230 }), withTiming(8, { duration: 230 })), 4, false),
          withTiming(0, { duration: 300 }),
        );
        setTimeout(() => {
          setPose((p) => (p === 'lick' ? 'sit' : p));
          busy.current = false;
        }, 2700);
      }
    }, 1000);
    return () => {
      clearInterval(id);
      cancelAnimation(blink);
      cancelAnimation(tail);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, mood, napAfter]);

  // Sleeping: slow breaths and a drifting "z".
  useEffect(() => {
    if (pose !== 'sleep' || reduce) {
      cancelAnimation(breathe);
      cancelAnimation(zz);
      breathe.value = 0;
      zz.value = 0;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
    zz.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pose, reduce, breathe, zz]);

  const whole = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value }, { translateY: bob.value + hop.value }, { scaleX: facing === 'left' ? -1 : 1 }],
  }));
  const rot = (v: SharedValue<number>, k: number) => useAnimatedStyle(() => ({ transform: [{ rotate: `${v.value * k}deg` }] }));
  const tailStyle = rot(tail, 1);
  const tiltStyle = rot(tilt, 1);
  const earStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -ears.value * 1.4 }, { scaleY: 1 + ears.value * 0.08 }] }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  // The near front paw: up to the mouth for licking (1), a little tap for the timer (~0.45).
  const pawStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-paw.value * 150}deg` }] }));
  const legA = rot(stride, 24);
  const legB = rot(stride, -24);
  const walkTail = rot(stride, 6);
  const breath = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + breathe.value * 0.04 }] }));
  const zStyle = useAnimatedStyle(() => ({ opacity: zz.value < 0.15 ? zz.value / 0.15 : 1 - (zz.value - 0.15) / 0.85, transform: [{ translateY: -zz.value * 10 }, { translateX: zz.value * 4 }] }));

  const L = { position: 'absolute' as const, left: 0, top: 0, width: size, height: h };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={h} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </Svg>
  );
  const fade = reduce ? undefined : FadeIn.duration(160);
  const fadeOut = reduce ? undefined : FadeOut.duration(120);

  return (
    <Animated.View style={[{ width: size, height: h }, whole, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      {(pose === 'sit' || pose === 'lick') && (
        <Animated.View key="sit" entering={fade} exiting={fadeOut} style={L}>
          {/* tail curling up behind */}
          <Animated.View style={[L, { transformOrigin: origin(15, 42) }, tailStyle]}>
            {svg(<Limb d="M15 43 C7.5 43 5 36 7.5 29.5 C8.8 26.4 11.6 25.6 12.4 27.6" w={3.4} outline={outline} />)}
          </Animated.View>
          {/* body, haunch, far front leg, bib, back paw, collar */}
          <View style={L}>
            {svg(
              <>
                <Limb d="M35.4 33 L35.2 44.6" w={4.4} outline={outline} end={<Paw cx={35.2} cy={45.6} outline={outline} />} />
                <Path d="M15 46.4 C7.2 46.4 6.6 35.4 12.4 30.2 C17 26 23.6 24.6 29.4 25 C34.6 25.4 38.6 29 39.8 35 L40.6 46.4 Z" fill={FUR} {...line} />
                <Path d="M18 37 C14 37 12.6 41 13.4 44" fill="none" stroke={outline} strokeWidth={0.8} strokeOpacity={0.3} strokeLinecap="round" />
                <Path d="M33.2 28.8 C37 31.4 39.2 37 39.8 46.4 L34.4 46.4 C34.4 40 32.6 34.6 33.2 28.8 Z" fill={CREAM} />
                <Paw cx={14.8} cy={46} outline={outline} />
              </>,
            )}
          </View>
          {/* head: tilts down to lick; ears and eyes move on their own */}
          <Animated.View style={[L, { transformOrigin: origin(40, 27) }, tiltStyle]}>
            <Animated.View style={[L, { transformOrigin: origin(42, 9) }, earStyle]}>
              {svg(
                <>
                  <Head outline={outline} closed={pose === 'lick'} tongue={pose === 'lick'} noEyes={pose === 'sit'} />
                  <Collar />
                </>,
              )}
            </Animated.View>
            {pose === 'sit' && (
              <Animated.View style={[L, { transformOrigin: origin(42, 17) }, eyeStyle]}>
                {svg(
                  <G>
                    <Ellipse cx={37.6} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
                    <Ellipse cx={46.4} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
                    <Ellipse cx={37.8} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
                    <Ellipse cx={46.6} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
                    <Ellipse cx={38.6} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
                    <Ellipse cx={47.4} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
                  </G>,
                )}
              </Animated.View>
            )}
          </Animated.View>
          {/* near front leg: lifts to lick, taps for the timer */}
          <Animated.View style={[L, { transformOrigin: origin(38.8, 33) }, pawStyle]}>
            {svg(<Limb d="M38.8 33 L39.2 44.6" w={4.4} outline={outline} end={<Paw cx={39.6} cy={45.6} outline={outline} />} />)}
          </Animated.View>
        </Animated.View>
      )}

      {pose === 'walk' && (
        <Animated.View key="walk" entering={fade} exiting={fadeOut} style={L}>
          <Animated.View style={[L, { transformOrigin: origin(13, 30) }, walkTail]}>
            {svg(<Limb d="M14 30 C8 28 6.5 20 9 14 C10.2 11 13.2 11 12.6 14" w={3.2} outline={outline} />)}
          </Animated.View>
          {/* far legs (drawn first), then body, then near legs */}
          <Animated.View style={[L, { transformOrigin: origin(20, 34) }, legB]}>
            {svg(<Limb d="M20 34 L20 44.8" w={3.4} outline={outline} end={<Paw cx={20.2} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <Animated.View style={[L, { transformOrigin: origin(40, 34) }, legA]}>
            {svg(<Limb d="M40 34 L40 44.8" w={3.4} outline={outline} end={<Paw cx={40.2} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <View style={L}>
            {svg(
              <>
                <Path d="M13 31 C13 25 20 22.4 29 22.4 C37 22.4 43 23.4 45 28 C46 31 44.6 36 38 36.4 C31 36.8 22 36.8 17.4 36.2 C14.4 35.8 13 34 13 31 Z" fill={FUR} {...line} />
                <Path d="M38 27 C42 28 44 31 43 35.6 C41 36.2 39 36.4 37.6 36.4 C38.4 33 38.4 30 38 27 Z" fill={CREAM} />
                <G transform="translate(6 2) scale(0.92)">
                  <Head outline={outline} />
                  <Collar />
                </G>
              </>,
            )}
          </View>
          <Animated.View style={[L, { transformOrigin: origin(16.5, 33) }, legA]}>
            {svg(<Limb d="M16.5 33 L16.5 44.8" w={3.6} outline={outline} end={<Paw cx={16.7} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <Animated.View style={[L, { transformOrigin: origin(36.5, 34) }, legB]}>
            {svg(<Limb d="M36.5 34 L36.5 44.8" w={3.6} outline={outline} end={<Paw cx={36.7} cy={45.6} outline={outline} />} />)}
          </Animated.View>
        </Animated.View>
      )}

      {pose === 'sleep' && (
        <Animated.View key="sleep" entering={reduce ? undefined : FadeIn.duration(500)} exiting={fadeOut} style={L}>
          <Animated.View style={[L, { transformOrigin: origin(32, 46) }, breath]}>
            {svg(
              <>
                {/* curled loaf */}
                <Path d="M12 41 C12 33 20 29.6 30 29.6 C40 29.6 48 32.6 49 38.6 C49.6 43 46 46.4 38 46.4 L18 46.4 C14 46.4 12 44.4 12 41 Z" fill={FUR} {...line} />
                {/* head tucked onto its paws, eyes shut, ears soft */}
                <G transform="translate(4 17) scale(0.82)">
                  <Head outline={outline} closed />
                </G>
                <Paw cx={44.6} cy={45.4} outline={outline} />
                {/* tail wrapped round the front */}
                <Limb d="M13 43.4 C16 47 30 47.4 40.4 45.6" w={3.2} outline={outline} />
              </>,
            )}
          </Animated.View>
          <Animated.View style={[L, zStyle]}>
            {svg(<Path d="M50 20 H54 L50 24 H54 M55.5 14.5 H58 L55.5 17 H58" fill="none" stroke={outline} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />)}
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}
