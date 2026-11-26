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

// The cook-mode helper: a small tuxedo cat after the CheapQuickVegan tab icon, drawn in code.
// Cute-cat rules it follows: a big round head, eyes set low with a catch-light, a tiny nose, a bean
// body, the tail wrapped round the feet when sitting, and motion that eases in and out, never constant.
//
// Its day: sits and watches (blinks, flicks its tail tip, tilts its head at the recipe), licks a paw
// now and then, kneads and settles into a loaf when things go quiet, then naps curled up. Anything
// happening wakes it, and waking from a nap comes with a stretch and a yawn.
// On the finish screen it hops, and now and then chases its tail.

export type CatMood = 'idle' | 'listening' | 'alert' | 'happy';
type Pose = 'sit' | 'walk' | 'lick' | 'knead' | 'loaf' | 'sleep' | 'stretch' | 'leap';
type Eyes = 'open' | 'closed' | 'sleepy' | 'none';

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
  /** Seconds without anything happening before it naps (it loafs at a bit over half that). */
  napAfter?: number;
  /** A still drawing: no idle life, no moods. For keepsakes like the trail postcard, where the cat isn't the live helper. */
  still?: boolean;
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

const Paw = ({ cx, cy, outline }: { cx: number; cy: number; outline: string }) => (
  <>
    <Ellipse cx={cx} cy={cy} rx={2.6} ry={1.7} fill={CREAM} stroke={outline} strokeWidth={0.9} />
    <Path d={`M${cx - 0.8} ${cy - 0.9} v1.1 M${cx + 0.8} ${cy - 0.9} v1.1`} stroke={FUR} strokeWidth={0.35} strokeOpacity={0.6} strokeLinecap="round" />
  </>
);

/** Fur texture: soft curved strokes just lighter than the fur, so the coat reads as fluffy, not spiky. */
const FUR_LIGHT = '#3B3B37';
const Texture = ({ d }: { d: string }) => <Path d={d} stroke={FUR_LIGHT} strokeWidth={0.75} strokeLinecap="round" fill="none" />;

/** The fluffy white ruff under the chin. */
const Ruff = () => (
  <Path d="M34.6 26.6 L35.8 29.4 L37.2 27.8 L38.4 30.6 L40 28.6 L42 31.2 L44 28.6 L45.6 30.6 L46.8 27.8 L48.2 29.4 L49.4 26.6 Z" fill={CREAM} />
);

const OpenEyes = () => (
  <>
    <Ellipse cx={37.6} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
    <Ellipse cx={46.4} cy={16.8} rx={2.6} ry={2.9} fill={EYES} />
    <Ellipse cx={37.8} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
    <Ellipse cx={46.6} cy={17.1} rx={1.25} ry={2.3} fill={FUR} />
    <Ellipse cx={38.6} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
    <Ellipse cx={47.4} cy={15.6} rx={0.75} ry={0.75} fill={CREAM} />
  </>
);

/** Head, drawn around (42, 17). */
function Head({ outline, eyes = 'open', tongue, yawn }: { outline: string; eyes?: Eyes; tongue?: boolean; yawn?: boolean }) {
  const line = { stroke: outline, strokeWidth: 1.3, strokeLinejoin: 'round' as const };
  return (
    <>
      <Path d="M32.6 12 C31.6 7 32.6 3 34 1.6 C36.4 3.2 38.6 5.4 39.8 7.6 Z" fill={FUR} {...line} />
      <Path d="M34.2 9.6 C33.8 7 34.2 5 34.8 4.2 C36 5.2 37.2 6.4 37.8 7.6 Z" fill={PINK} />
      <Path d="M44.2 7.6 C45.4 5.4 47.6 3.2 50 1.6 C51.4 3 52.4 7 51.4 12 Z" fill={FUR} {...line} />
      <Path d="M46.2 7.6 C46.8 6.4 48 5.2 49.2 4.2 C49.8 5 50.2 7 49.8 9.6 Z" fill={PINK} />
      <Path d="M35.4 9 L34.6 6.4 M36.6 8.6 L36.4 6.2 M48.6 9 L49.4 6.4 M47.4 8.6 L47.6 6.2" stroke={CREAM} strokeWidth={0.5} strokeLinecap="round" />
      <Path
        d="M31 18 C31 10.6 35.6 6.6 40 6.3 L41 5 L42 6.2 L43.2 5.2 L44 6.4 C48.4 6.9 53 10.6 53 18 L53.9 20.4 L52.4 21.1 L53.5 23.2 L51.7 23.6 L52.1 25.7 L49.8 25.5 L48.6 27.3 C46.6 27.7 44.4 28 42 28 C39.6 28 37.4 27.7 35.4 27.3 L34.2 25.5 L31.9 25.7 L32.3 23.6 L30.5 23.2 L31.6 21.1 L30.1 20.4 Z"
        fill={FUR}
        {...line}
      />
      <Path d="M38.4 21.6 C38.4 19.2 40.4 18.6 42 19.6 C43.6 18.6 45.6 19.2 45.6 21.6 C45.6 24.6 43.8 26.4 42 26.4 C40.2 26.4 38.4 24.6 38.4 21.6 Z" fill={CREAM} />
      {eyes === 'open' && <OpenEyes />}
      {eyes === 'closed' && (
        <>
          <Path d="M35.6 17.4 C36.6 18.8 38.6 18.8 39.6 17.4" fill="none" stroke={EYES} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M44.4 17.4 C45.4 18.8 47.4 18.8 48.4 17.4" fill="none" stroke={EYES} strokeWidth={1.3} strokeLinecap="round" />
        </>
      )}
      {eyes === 'sleepy' && (
        <>
          {/* heavy lids: only the lower half of each eye shows */}
          <Path d="M35 17.2 C35 19.6 40.2 19.6 40.2 17.2 Z" fill={EYES} />
          <Path d="M43.8 17.2 C43.8 19.6 49 19.6 49 17.2 Z" fill={EYES} />
          <Path d="M37.2 17.2 C37.2 18.8 38.4 18.8 38.4 17.2 Z M46 17.2 C46 18.8 47.2 18.8 47.2 17.2 Z" fill={FUR} />
          <Path d="M34.8 17.2 H40.4 M43.6 17.2 H49.2" stroke={outline} strokeWidth={0.8} strokeLinecap="round" />
        </>
      )}
      <Path d="M41 21 H43 L42 22.2 Z" fill={PINK} />
      {yawn ? (
        <Path d="M40 23 C40 26.6 44 26.6 44 23 C44 22.2 40 22.2 40 23 Z" fill={PINK} stroke={FUR} strokeWidth={0.7} />
      ) : (
        <Path d="M40.4 23 C41 23.8 41.8 23.6 42 22.6 C42.2 23.6 43 23.8 43.6 23" fill="none" stroke={FUR} strokeWidth={0.6} strokeLinecap="round" />
      )}
      {tongue && <Ellipse cx={42} cy={24.6} rx={0.9} ry={1.1} fill={PINK} />}
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

export function CookCat({ x = 0, facing = 'right', mood = 'idle', perkKey = 0, size = 48, outline, style, napAfter = 45, still = false }: Props) {
  const reduce = useReducedMotion() || still;
  const h = (size / W) * H;
  const origin = (px: number, py: number): [number, number, number] => [Math.round((px / W) * size * 10) / 10, Math.round((py / H) * h * 10) / 10, 0];
  const line = { stroke: outline, strokeWidth: 1.3, strokeLinejoin: 'round' as const };

  const [pose, setPoseState] = useState<Pose>('sit');
  const poseRef = useRef<Pose>('sit');
  const setPose = (p: Pose) => {
    poseRef.current = p;
    setPoseState(p);
  };
  const lastActivity = useRef(Date.now());
  const busy = useRef(false); // mid-walk, lick or stretch: no other idle behaviour starts

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
  const reach = useSharedValue(0);
  const knead = useSharedValue(0);
  const orbit = useSharedValue(0);
  const squash = useSharedValue(1); // body squash and stretch for jumps (1 = normal)

  /** Something happened: reset the quiet clock, and get up if lying down (with a stretch after a nap). */
  const wake = (stretch = true) => {
    lastActivity.current = Date.now();
    const p = poseRef.current;
    if (p === 'loaf') setPose('sit');
    if (p === 'knead') {
      cancelAnimation(knead);
      knead.value = 0;
      busy.current = false;
      setPose('sit');
    }
    if (p === 'sleep') {
      if (!stretch || reduce) return setPose('sit');
      busy.current = true;
      setPose('stretch');
      reach.value = withSequence(withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }), withDelay(700, withTiming(0, { duration: 400 })));
      setTimeout(() => {
        if (poseRef.current === 'stretch') setPose('sit');
        busy.current = false;
      }, 1700);
    }
  };

  // Walk to each new step: legs step in diagonal pairs, the body bobs, then it sits.
  useEffect(() => {
    wake(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, reduce]);

  // Moods: ears, paws, and a cocked head while listening.
  useEffect(() => {
    if (mood !== 'idle') wake();
    else lastActivity.current = Date.now();
    if (reduce) {
      ears.value = mood === 'listening' ? 1 : 0;
      return;
    }
    cancelAnimation(paw);
    cancelAnimation(hop);
    cancelAnimation(squash);
    squash.value = 1;
    ears.value = withSpring(mood === 'listening' || mood === 'alert' ? 1 : 0);
    tilt.value = withSpring(mood === 'listening' ? -9 : 0);
    paw.value = withTiming(0, { duration: 150 });
    hop.value = 0;
    if (mood !== 'happy' && poseRef.current === 'leap') setPose('sit');
    if (mood === 'alert') paw.value = withRepeat(withSequence(withTiming(0.45, { duration: 180 }), withTiming(0, { duration: 220 })), -1, false);
    if (mood === 'happy' && !reduce) setPose('leap');
    if (mood === 'happy') {
      // A real little jump, standing on all four paws: crouch, spring up stretched, hang at the top, drop faster than it rose,
      // land with a squash, settle. Height and squash run on the same timeline.
      const easeOut = Easing.out(Easing.quad);
      const easeIn = Easing.in(Easing.quad);
      hop.value = withRepeat(
        withSequence(
          withDelay(1600, withTiming(1.2, { duration: 220, easing: easeOut })), // crouch
          withTiming(-11, { duration: 230, easing: easeOut }), // take off
          withTiming(-12, { duration: 90 }), // hang
          withTiming(0, { duration: 210, easing: easeIn }), // fall
          withTiming(0.8, { duration: 60, easing: easeOut }), // land
          withTiming(0, { duration: 180, easing: easeOut }), // settle
        ),
        -1,
        false,
      );
      squash.value = withRepeat(
        withSequence(
          withDelay(1600, withTiming(0.86, { duration: 220, easing: easeOut })),
          withTiming(1.1, { duration: 140, easing: easeOut }),
          withTiming(1, { duration: 180 }),
          withTiming(1.04, { duration: 210, easing: easeIn }),
          withTiming(0.84, { duration: 60, easing: easeOut }),
          withTiming(1, { duration: 180, easing: easeOut }),
        ),
        -1,
        false,
      );
      let chase: ReturnType<typeof setTimeout> | undefined;
      const id = setInterval(() => {
        if (busy.current) return;
        busy.current = true;
        setPose('walk');
        stride.value = withRepeat(withTiming(1, { duration: 140, easing: Easing.inOut(Easing.sin) }), 14, true);
        // Round and round a little loop after its tail, three times.
        orbit.value = 0;
        orbit.value = withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.sin) });
        chase = setTimeout(() => {
          stride.value = withTiming(0, { duration: 120 });
          orbit.value = 0;
          setPose('leap');
          busy.current = false;
        }, 2100);
      }, 7000);
      return () => {
        clearInterval(id);
        if (chase) clearTimeout(chase);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, reduce]);

  // Heard a voice command: ears perk once, and it wakes.
  useEffect(() => {
    if (!perkKey) return;
    wake();
    if (reduce) return;
    ears.value = withSequence(withTiming(1.4, { duration: 120 }), withSpring(mood === 'listening' ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perkKey]);

  // Idle life while sitting: blink, flick the tail tip, tilt the head at the recipe, lick a paw now and
  // then. When it's been quiet a while: loaf, then nap.
  useEffect(() => {
    if (reduce) return;
    blink.value = withRepeat(withSequence(withDelay(3800, withTiming(0.1, { duration: 80 })), withTiming(1, { duration: 120 })), -1, false);
    tail.value = withRepeat(
      withSequence(withDelay(5200, withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) })), withTiming(-0.4, { duration: 320 }), withSpring(0)),
      -1,
      false,
    );
    let lastLick = Date.now();
    let lastTilt = Date.now();
    const id = setInterval(() => {
      if (busy.current) return;
      const quiet = (Date.now() - lastActivity.current) / 1000;
      const p = poseRef.current;
      if (mood === 'idle' && quiet > napAfter) {
        if (p !== 'sleep') setPose('sleep');
        return;
      }
      if (mood === 'idle' && quiet > napAfter * 0.55) {
        if (p === 'sit') {
          // Knead a few times, then settle into a loaf.
          busy.current = true;
          setPose('knead');
          knead.value = withRepeat(withTiming(1, { duration: 330, easing: Easing.inOut(Easing.sin) }), 8, true);
          setTimeout(() => {
            if (poseRef.current === 'knead') setPose('loaf');
            busy.current = false;
          }, 2700);
        }
        return;
      }
      if (p !== 'sit') return;
      if (Date.now() - lastLick > 14000 && quiet > 6 && mood !== 'alert') {
        lastLick = Date.now();
        busy.current = true;
        setPose('lick');
        paw.value = withSequence(withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }), withDelay(2000, withTiming(0, { duration: 300 })));
        tilt.value = withSequence(
          withTiming(8, { duration: 320 }),
          withRepeat(withSequence(withTiming(13, { duration: 230 }), withTiming(8, { duration: 230 })), 4, false),
          withTiming(mood === 'listening' ? -9 : 0, { duration: 300 }),
        );
        setTimeout(() => {
          if (poseRef.current === 'lick') setPose('sit');
          busy.current = false;
        }, 2700);
        return;
      }
      // A curious little tilt toward the recipe below.
      if (mood === 'idle' && Date.now() - lastTilt > 9000) {
        lastTilt = Date.now();
        tilt.value = withSequence(withTiming(7, { duration: 450, easing: Easing.inOut(Easing.quad) }), withDelay(1300, withTiming(0, { duration: 450 })));
      }
    }, 1000);
    return () => {
      clearInterval(id);
      cancelAnimation(blink);
      cancelAnimation(tail);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, mood, napAfter]);

  // Lying down: slow breaths; asleep, a drifting "z" too.
  useEffect(() => {
    const lying = pose === 'sleep' || pose === 'loaf';
    if (!lying || reduce) {
      cancelAnimation(breathe);
      cancelAnimation(zz);
      breathe.value = 0;
      zz.value = 0;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: pose === 'sleep' ? 1800 : 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
    if (pose === 'sleep') zz.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose, reduce]);

  const whole = useAnimatedStyle(() => {
    // Chasing its tail: once round the loop per unit of orbit. Side to side with x, a little up and
    // smaller on the far side, and it turns at the ends of the loop, where it's narrowest.
    const a = orbit.value * Math.PI * 2;
    const chasing = orbit.value > 0 && orbit.value < 3;
    const far = chasing ? (1 - Math.cos(a)) / 2 : 0;
    const c = Math.cos(a);
    const turn = chasing ? Math.sign(c || 1) * (0.62 + 0.38 * Math.abs(c)) : 1;
    return {
      transform: [
        { translateX: posX.value + (chasing ? Math.sin(a) * size * 0.14 : 0) },
        { translateY: bob.value + hop.value - far * 3 },
        { scale: 1 - far * 0.1 },
        { scaleX: (facing === 'left' ? -1 : 1) * turn * (2 - squash.value) },
        { scaleY: squash.value },
      ],
    };
  });
  const rot = (v: SharedValue<number>, k: number) => useAnimatedStyle(() => ({ transform: [{ rotate: `${v.value * k}deg` }] }));
  const tipStyle = rot(tail, -28);
  const tiltStyle = rot(tilt, 1);
  const earStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -ears.value * 1.4 }, { scaleY: 1 + ears.value * 0.08 }] }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const pawStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -(1 - knead.value) * 2.2 * (knead.value > 0 ? 1 : 0) }, { rotate: `${-paw.value * 150}deg` }] }));
  const farPawStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -knead.value * 2.2 }] }));
  const legA = rot(stride, 24);
  const legB = rot(stride, -24);
  const walkTail = rot(stride, 6);
  // Leaping: crouched paws gather under the body, then in the air the front legs reach forward,
  // the back legs push out behind and the tail streams back. All read from the jump height.
  const leapFront = useAnimatedStyle(() => {
    const air = Math.max(0, -hop.value) / 12;
    const crouch = Math.max(0, hop.value) / 1.2;
    return { transform: [{ rotate: `${-air * 42 + crouch * 12}deg` }] };
  });
  const leapBack = useAnimatedStyle(() => {
    const air = Math.max(0, -hop.value) / 12;
    const crouch = Math.max(0, hop.value) / 1.2;
    return { transform: [{ rotate: `${air * 48 - crouch * 14}deg` }] };
  });
  const leapTail = useAnimatedStyle(() => ({ transform: [{ rotate: `${(Math.max(0, -hop.value) / 12) * 28}deg` }] }));
  // Nose up on the way up, level at the top, nose down to land.
  const leapPitch = useAnimatedStyle(() => ({ transform: [{ rotate: `${hop.value < 0 ? -Math.sin((-hop.value / 12) * Math.PI) * 6 : 0}deg` }] }));
  const breath = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + breathe.value * 0.04 }] }));
  const zStyle = useAnimatedStyle(() => ({ opacity: zz.value < 0.15 ? zz.value / 0.15 : 1 - (zz.value - 0.15) / 0.85, transform: [{ translateY: -zz.value * 10 }, { translateX: zz.value * 4 }] }));
  // Stretch: front legs reach forward and the rear lifts a touch.
  const reachStyle = useAnimatedStyle(() => ({ transform: [{ translateX: reach.value * 2.5 }] }));
  const rearStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -reach.value * 1.5 }] }));

  const L = { position: 'absolute' as const, left: 0, top: 0, width: size, height: h };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={h} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </Svg>
  );
  const fade = reduce ? undefined : FadeIn.duration(180);
  const fadeOut = reduce ? undefined : FadeOut.duration(140);

  return (
    <Animated.View style={[{ width: size, height: h, transformOrigin: [size / 2, h, 0] }, whole, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      {(pose === 'sit' || pose === 'lick' || pose === 'knead') && (
        <Animated.View key="sit" entering={fade} exiting={fadeOut} style={L}>
          {/* body, haunch, far front leg, bib, back paw */}
          <View style={L}>
            {svg(
              <>
                <Path
                  d="M15 46.4 C10.2 46.4 7.4 43 7.6 39.4 Q6.6 38 7.8 36.6 Q7.4 34.8 9 33.8 Q9 31.8 10.9 31.2 Q11.5 29.3 13.4 29.1 Q14.5 27.5 16.4 27.7 Q17.8 26.1 19.7 26.5 Q21.3 25.1 23.1 25.7 Q24.9 24.5 26.7 25.3 Q28.4 24.6 30 25.3 C34.8 25.9 38.6 29.4 39.8 35 L40.6 46.4 Z"
                  fill={FUR}
                  {...line}
                />
                <Texture d="M11.6 35.2 q1.6 -0.9 2.8 0.1 M10.8 40 q1.6 -0.6 2.6 0.4 M17 30 q1.4 -1 2.8 -0.3 M22.4 28.4 q1.4 -0.8 2.6 -0.1 M27.6 28 q1.2 -0.6 2.4 0 M16.6 34.4 q1.2 -0.7 2.2 0" />
                <Path d="M18 37 C14 37 12.6 41 13.4 44" fill="none" stroke={outline} strokeWidth={0.8} strokeOpacity={0.3} strokeLinecap="round" />
                <Path d="M33.2 28.8 C37 31.4 39.2 37 39.8 46.4 L34.4 46.4 L34.8 44 L33.6 42.4 L34.4 40 L33 38.4 L33.8 36 L32.6 34.4 L33.4 32 L32.6 30.4 Z" fill={CREAM} />
                <Paw cx={14.8} cy={46} outline={outline} />
              </>,
            )}
          </View>
          {/* far front leg, its own layer so it can knead */}
          <Animated.View style={[L, farPawStyle]}>
            {svg(<Limb d="M36.2 33 L36.2 44.6" w={4.4} outline={outline} end={<Paw cx={36} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          {/* head: tilts to look at the recipe, dips to lick; ears and eyes move on their own */}
          <Animated.View style={[L, { transformOrigin: origin(40, 27) }, tiltStyle]}>
            <Animated.View style={[L, { transformOrigin: origin(42, 9) }, earStyle]}>
              {svg(
                <>
                  <Head outline={outline} eyes={pose === 'lick' ? 'closed' : pose === 'knead' ? 'sleepy' : 'none'} tongue={pose === 'lick'} />
                  <Ruff />
                  <Collar />
                </>,
              )}
            </Animated.View>
            {pose === 'sit' && <Animated.View style={[L, { transformOrigin: origin(42, 17) }, eyeStyle]}>{svg(<OpenEyes />)}</Animated.View>}
          </Animated.View>
          {/* near front leg, close beside the other: lifts to lick, taps for the timer */}
          <Animated.View style={[L, { transformOrigin: origin(39, 33) }, pawStyle]}>
            {svg(<Limb d="M39 33 L39.2 44.6" w={4.4} outline={outline} end={<Paw cx={39.6} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          {/* tail wrapped round the front of the feet; only the tip flicks */}
          <View style={L}>
            {svg(
              <>
                <Limb d="M13.6 45.8 C19 47.6 30 47.8 37.4 46.9" w={4.2} outline={outline} />
              </>,
            )}
          </View>
          <Animated.View style={[L, { transformOrigin: origin(37.4, 46.9) }, tipStyle]}>
            {svg(
              <>
                <Limb d="M37.4 46.9 C40.6 46.6 43 45.4 43.6 42.8" w={4} outline={outline} />
              </>,
            )}
          </Animated.View>
        </Animated.View>
      )}

      {pose === 'walk' && (
        <Animated.View key="walk" entering={fade} exiting={fadeOut} style={L}>
          <Animated.View style={[L, { transformOrigin: origin(13, 30) }, walkTail]}>
            {svg(<Limb d="M14 30 C8 28 6.5 20 9 14 C10.2 11 13.2 11 12.6 14" w={4.2} outline={outline} />)}
          </Animated.View>
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
                <Texture d="M18 27.4 q1.6 -0.9 2.8 0 M24 26.2 q1.4 -0.8 2.8 -0.1 M30 26 q1.4 -0.7 2.6 0 M20 31.6 q1.4 -0.6 2.4 0.2" />
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

      {pose === 'leap' && (
        <Animated.View key="leap" entering={fade} exiting={fadeOut} style={[L, { transformOrigin: origin(28, 34) }, leapPitch]}>
          {/* standing on all fours, same body as walking; legs and tail follow the jump */}
          <Animated.View style={[L, { transformOrigin: origin(13, 30) }, leapTail]}>
            {svg(<Limb d="M14 30 C8 28 6.5 20 9 14 C10.2 11 13.2 11 12.6 14" w={4.2} outline={outline} />)}
          </Animated.View>
          <Animated.View style={[L, { transformOrigin: origin(20, 34) }, leapBack]}>
            {svg(<Limb d="M20 34 L20 44.8" w={3.4} outline={outline} end={<Paw cx={20.2} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <Animated.View style={[L, { transformOrigin: origin(40, 34) }, leapFront]}>
            {svg(<Limb d="M40 34 L40 44.8" w={3.4} outline={outline} end={<Paw cx={40.2} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <View style={L}>
            {svg(
              <>
                <Path d="M13 31 C13 25 20 22.4 29 22.4 C37 22.4 43 23.4 45 28 C46 31 44.6 36 38 36.4 C31 36.8 22 36.8 17.4 36.2 C14.4 35.8 13 34 13 31 Z" fill={FUR} {...line} />
                <Texture d="M18 27.4 q1.6 -0.9 2.8 0 M24 26.2 q1.4 -0.8 2.8 -0.1 M30 26 q1.4 -0.7 2.6 0 M20 31.6 q1.4 -0.6 2.4 0.2" />
                <Path d="M38 27 C42 28 44 31 43 35.6 C41 36.2 39 36.4 37.6 36.4 C38.4 33 38.4 30 38 27 Z" fill={CREAM} />
                <G transform="translate(6 2) scale(0.92)">
                  <Head outline={outline} />
                  <Collar />
                </G>
              </>,
            )}
          </View>
          <Animated.View style={[L, { transformOrigin: origin(16.5, 33) }, leapBack]}>
            {svg(<Limb d="M16.5 33 L16.5 44.8" w={3.6} outline={outline} end={<Paw cx={16.7} cy={45.6} outline={outline} />} />)}
          </Animated.View>
          <Animated.View style={[L, { transformOrigin: origin(36.5, 34) }, leapFront]}>
            {svg(<Limb d="M36.5 34 L36.5 44.8" w={3.6} outline={outline} end={<Paw cx={36.7} cy={45.6} outline={outline} />} />)}
          </Animated.View>
        </Animated.View>
      )}

      {pose === 'stretch' && (
        <Animated.View key="stretch" entering={fade} exiting={fadeOut} style={L}>
          {/* rear up, chest down, front legs reaching forward, a big yawn */}
          <Animated.View style={[L, rearStyle]}>
            {svg(
              <>
                <Limb d="M11 26 C6 22 6 14 9.4 9.6" w={4.2} outline={outline} />
                <Limb d="M14.4 33 L14 44.8" w={3.6} outline={outline} end={<Paw cx={14} cy={45.6} outline={outline} />} />
                <Limb d="M19 34 L19.4 44.8" w={3.6} outline={outline} end={<Paw cx={19.6} cy={45.6} outline={outline} />} />
                <Path d="M9.6 29 C9.6 23.4 15.6 21.6 21 23.6 C28 26.4 35 32 41 37 C43.4 39 42.6 43 39.6 43.2 L31 43.2 C25 40.8 19 38 14.4 36.4 C11.2 35.2 9.6 32.4 9.6 29 Z" fill={FUR} {...line} />
              </>,
            )}
          </Animated.View>
          <Animated.View style={[L, reachStyle]}>
            {svg(
              <>
                <Limb d="M36 41.6 L52 45.2" w={3.4} outline={outline} end={<Paw cx={53} cy={45.6} outline={outline} />} />
                <Limb d="M39 41 L55.4 44.6" w={3.6} outline={outline} end={<Paw cx={56.4} cy={45.2} outline={outline} />} />
                <G transform="translate(13 18) scale(0.85)">
                  <Head outline={outline} eyes="closed" yawn />
                  <Collar />
                </G>
              </>,
            )}
          </Animated.View>
        </Animated.View>
      )}

      {(pose === 'loaf' || pose === 'sleep') && (
        <Animated.View key={pose} entering={reduce ? undefined : FadeIn.duration(500)} exiting={fadeOut} style={L}>
          <Animated.View style={[L, { transformOrigin: origin(32, 46) }, breath]}>
            {svg(
              pose === 'loaf' ? (
                <>
                  {/* loaf: paws tucked under, head up, sleepy eyes */}
                  <Path
                    d="M12 40 Q11 38.4 12.4 37 Q12.2 35 14 34 Q14.4 31.9 16.6 31.5 Q17.6 29.7 19.8 29.8 Q21.2 28.4 23.3 28.8 Q25 27.7 26.9 28.4 Q28.6 27.6 30.4 28.5 C40 28.6 47 31 48 37.6 C48.6 43 45 46.4 37 46.4 L19 46.4 C15 46.4 12 44 12 40 Z"
                    fill={FUR}
                    {...line}
                  />
                  <Texture d="M16 36 q1.6 -0.9 2.8 0.1 M21 32.6 q1.4 -0.9 2.8 -0.2 M26.4 31.4 q1.4 -0.8 2.6 0 M20 38.6 q1.4 -0.6 2.4 0.2" />
                  <Path d="M40 31 C44 32.4 46.4 35.6 46.4 40 C44.4 41.6 41.6 42 39.6 41.4 C40.6 38 40.8 34 40 31 Z" fill={CREAM} />
                  <Ellipse cx={42.4} cy={46} rx={2.2} ry={1.2} fill={CREAM} stroke={outline} strokeWidth={0.8} />
                  <G transform="translate(1 6) scale(0.95)">
                    <Head outline={outline} eyes="sleepy" />
                    <Ruff />
                    <Collar />
                  </G>
                  <Limb d="M13 43.6 C16 47 28 47.4 36 46.2" w={4.2} outline={outline} />
                </>
              ) : (
                <>
                  {/* curled up asleep, head tucked onto its paws */}
                  <Path d="M12 41 C12 33 20 29.6 30 29.6 C40 29.6 48 32.6 49 38.6 C49.6 43 46 46.4 38 46.4 L18 46.4 C14 46.4 12 44.4 12 41 Z" fill={FUR} {...line} />
                  <Texture d="M17 36.4 q1.6 -0.9 2.8 0.1 M23 33.6 q1.4 -0.9 2.8 -0.2 M29 33 q1.4 -0.8 2.6 0 M21 40 q1.4 -0.6 2.4 0.2" />
                  <G transform="translate(4 17) scale(0.82)">
                    <Head outline={outline} eyes="closed" />
                  </G>
                  <Paw cx={44.6} cy={45.4} outline={outline} />
                  <Limb d="M13 43.4 C16 47 30 47.4 40.4 45.6" w={4.2} outline={outline} />
                </>
              ),
            )}
          </Animated.View>
          {pose === 'sleep' && (
            <Animated.View style={[L, zStyle]}>
              {svg(<Path d="M50 20 H54 L50 24 H54 M55.5 14.5 H58 L55.5 17 H58" fill="none" stroke={outline} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />)}
            </Animated.View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}
