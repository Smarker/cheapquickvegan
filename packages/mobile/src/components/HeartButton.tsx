import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSavedBounce } from '../lib/saved';
import { lift, spring, usePalette } from '../theme/tokens';
import { HeartIcon } from './Icons';

type Props = { saved: boolean; onToggle: () => void; label: string; size?: number };

// Three little leaves that scatter when you save: angle in degrees from straight up.
const LEAVES = [-55, 0, 55];

/** Green save button. Saving pops it and scatters three tiny leaves; the Saved tab bounces in reply. */
export function HeartButton({ saved, onToggle, label, size = 52 }: Props) {
  const p = usePalette();
  const reduce = useReducedMotion();
  const bounce = useSavedBounce();
  const scale = useSharedValue(1);
  const burst = useSharedValue(0);
  const [burstKey, setBurstKey] = useState(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(saved ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
        if (!saved && !reduce) {
          scale.value = withSequence(withSpring(1.2, spring), withSpring(1, spring));
          burst.value = 0;
          burst.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
          setBurstKey((k) => k + 1);
        }
        if (!saved) bounce();
        onToggle();
      }}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${label} from saved` : `Save ${label}`}
      accessibilityState={{ selected: saved }}
      hitSlop={6}
    >
      <View style={{ width: size, height: size }}>
        {burstKey > 0 && LEAVES.map((deg) => <Leaf key={`${burstKey}-${deg}`} deg={deg} progress={burst} color={p.green} size={size} />)}
        <Animated.View
          style={[
            { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: saved ? p.heart : p.ground },
            lift(p),
            anim,
          ]}
        >
          <HeartIcon color={saved ? '#FFFFFF' : p.heart} filled={saved} size={size * 0.42} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

function Leaf({ deg, progress, color, size }: { deg: number; progress: SharedValue<number>; color: string; size: number }) {
  const rad = (deg * Math.PI) / 180;
  const dist = size * 0.75;
  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.75 ? 1 : 1 - (progress.value - 0.75) / 0.25,
    transform: [
      { translateX: Math.sin(rad) * dist * progress.value },
      { translateY: -Math.cos(rad) * dist * progress.value },
      { rotate: `${deg + progress.value * 40}deg` },
      { scale: 0.6 + progress.value * 0.4 },
    ],
  }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: size / 2 - 7, top: size / 2 - 7 }, style]}>
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Path d="M7 13 C2 10 1 5 7 1 C13 5 12 10 7 13Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}
