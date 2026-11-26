import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { CheckIcon, CrossIcon } from './Icons';
import { font, spring, usePalette } from '../theme/tokens';

type Props = {
  label: string;
  on: boolean;
  onPress: () => void;
  /** "have": a tick on sage, for things you own. "avoid": a cross in an ink outline, for things to keep out. */
  kind: 'have' | 'avoid';
  accessibilityLabel?: string;
};

/**
 * An on/off chip whose look says what "on" means. Owning a blender and avoiding soy must never look alike:
 * one is a tick on Sage Leaf, the other a cross in an ink ring on plain paper.
 */
export function ToggleChip({ label, on, onPress, kind, accessibilityLabel }: Props) {
  const p = usePalette();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const avoid = kind === 'avoid';
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      onPressIn={() => (scale.value = withSpring(0.95, spring))}
      onPressOut={() => (scale.value = withSpring(1, spring))}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={accessibilityLabel ?? (avoid ? `Avoid ${label}` : `Have ${label}`)}
      hitSlop={4}
    >
      <Animated.View
        style={[
          {
            minHeight: 44,
            paddingLeft: on ? 12 : 18,
            paddingRight: 18,
            borderRadius: 18,
            borderWidth: 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: on ? (avoid ? p.ground : p.accent) : p.mist,
            borderColor: on && avoid ? p.ink : 'transparent',
          },
          anim,
        ]}
      >
        {on && (avoid ? <CrossIcon color={p.ink} size={16} /> : <CheckIcon color="#262420" size={16} />)}
        <Text
          style={{
            fontFamily: on ? font.sansBold : font.sansMedium,
            fontSize: 14,
            color: on ? (avoid ? p.ink : '#262420') : p.muted,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
