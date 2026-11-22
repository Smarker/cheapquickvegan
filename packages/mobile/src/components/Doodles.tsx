import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// Ink line drawings, slightly wobbly, one stroke weight. Placeholders until Stephanie's own drawings land.
const ink = { fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** A pot with a spoon that stirs. Used for loading. Still under Reduce Motion. */
export function StirringPot({ color, size = 150 }: { color: string; size?: number }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    v.value = withRepeat(
      withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 700, easing: Easing.inOut(Easing.sin) })),
      -1,
      true,
    );
  }, [reduce, v]);
  const spoon = useAnimatedStyle(() => ({ transform: [{ translateX: v.value * size * 0.05 }, { rotate: `${v.value * 6}deg` }] }));
  const h = size * 0.82;
  return (
    <View style={{ width: size, height: h }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: h }, spoon]}>
        <Svg width={size} height={h} viewBox="0 0 150 123">
          {/* spoon */}
          <Path d="M96 64 C104 46 113 28 121 12 C123 8 128 9 127 14 C121 30 112 48 103 66" stroke={color} {...ink} />
          <Path d="M90 62 C92 72 106 72 108 64 C106 58 94 56 90 62Z" stroke={color} {...ink} />
          {/* stir marks */}
          <Path d="M58 34 C62 31 66 31 70 33 M54 42 C59 39 64 39 68 41" stroke={color} {...ink} strokeWidth={1.8} />
          <Path d="M124 30 C127 33 128 37 127 41 M131 26 C135 30 136 35 135 40" stroke={color} {...ink} strokeWidth={1.8} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={h} viewBox="0 0 150 123" style={{ position: 'absolute' }}>
        {/* rim */}
        <Path d="M30 62 C30 52 120 51 121 61 C121 71 31 73 30 62Z" stroke={color} {...ink} />
        <Path d="M38 62 C40 56 111 55 113 61" stroke={color} {...ink} strokeWidth={1.6} />
        {/* body */}
        <Path d="M31 64 C31 80 31 96 38 106 C48 116 104 116 113 106 C120 96 121 80 121 63" stroke={color} {...ink} />
        {/* handles */}
        <Path d="M31 70 C22 67 15 70 16 75 C17 80 24 80 31 79" stroke={color} {...ink} />
        <Path d="M121 70 C130 67 137 70 136 75 C135 80 128 80 121 79" stroke={color} {...ink} />
      </Svg>
    </View>
  );
}

/** A loose hand-drawn underline that draws itself in once. */
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function Squiggle({ color, width = 120 }: { color: string; width?: number }) {
  const reduce = useReducedMotion();
  const progress = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!reduce) progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [reduce, progress]);
  const LEN = 140;
  const props = useAnimatedProps(() => ({ strokeDashoffset: LEN * (1 - progress.value) }));
  return (
    <Svg width={width} height={width * 0.12} viewBox="0 0 130 16">
      <AnimatedPath
        d="M3 10 C20 5 34 12 50 8 C66 4 80 12 96 7 C108 4 118 7 127 5"
        stroke={color}
        {...ink}
        strokeWidth={3}
        strokeDasharray={LEN}
        animatedProps={props}
      />
    </Svg>
  );
}

/** An empty bowl with a little steam curl, for empty states. */
export function EmptyBowl({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 120 96">
      <Path d="M14 46 C14 40 106 39 106 45" stroke={color} {...ink} />
      <Path d="M14 46 C16 68 34 82 60 82 C86 82 104 68 106 45" stroke={color} {...ink} />
      <Path d="M44 86 C50 90 70 90 76 86" stroke={color} {...ink} />
      <Path d="M52 32 C46 26 58 22 52 14 M66 32 C60 26 72 22 66 14" stroke={color} {...ink} strokeWidth={1.8} />
    </Svg>
  );
}

/** A little mountain hut: a rest stop on a journey. */
export function Hut({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 64 58">
      <Path d="M6 30 L32 8 L58 30" stroke={color} {...ink} />
      <Path d="M12 26 V52 H52 V26" stroke={color} {...ink} />
      <Path d="M27 52 V38 H37 V52" stroke={color} {...ink} />
      <Path d="M44 14 V8 H50 V19" stroke={color} {...ink} />
      <Path d="M46 5 C44 2 48 0 46 -3" stroke={color} {...ink} strokeWidth={1.6} />
      <Path d="M16 34 H22 V40 H16 Z" stroke={color} {...ink} strokeWidth={1.8} />
    </Svg>
  );
}

/** A summit flag on a peak. */
export function SummitFlag({ color, size = 72 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 72 58">
      <Path d="M4 54 L28 16 L40 34 L48 24 L68 54 Z" stroke={color} {...ink} />
      <Path d="M28 16 V2" stroke={color} {...ink} />
      <Path d="M28 3 C34 1 36 7 42 5 L42 12 C36 14 34 8 28 10" stroke={color} {...ink} />
    </Svg>
  );
}

/** Mountains on the horizon, for journey cards. */
export function Peaks({ color, width = 120 }: { color: string; width?: number }) {
  return (
    <Svg width={width} height={width * 0.42} viewBox="0 0 120 50">
      <Path d="M2 48 L34 10 L52 30 L70 6 L118 48" stroke={color} {...ink} />
      <Path d="M28 18 L34 10 L40 17 M64 13 L70 6 L77 14" stroke={color} {...ink} strokeWidth={1.8} />
      <Path d="M10 46 C30 40 44 46 60 42 S96 40 112 46" stroke={color} {...ink} strokeWidth={1.6} strokeDasharray="2 6" />
    </Svg>
  );
}
