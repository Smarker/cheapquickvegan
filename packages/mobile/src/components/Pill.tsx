import * as Haptics from 'expo-haptics';
import { Pressable, Text, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { font, spring, usePalette } from '../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
  /** An icon after the label, like a chevron that says the chip opens choices. */
  iconAfter?: React.ReactNode;
  style?: ViewStyle;
  role?: 'button' | 'tab';
};

/** Soft rounded filter or tab. Selected fills mustard with ink text. */
export function Pill({ label, selected, onPress, accessibilityLabel, icon, iconAfter, style, role = 'button' }: Props) {
  const p = usePalette();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      onPressIn={() => (scale.value = withSpring(0.95, spring))}
      onPressOut={() => (scale.value = withSpring(1, spring))}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      style={style}
    >
      <Animated.View
        style={[
          {
            minHeight: 44,
            paddingHorizontal: 18,
            borderRadius: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: selected ? p.accent : p.mist,
          },
          anim,
        ]}
      >
        {icon}
        <Text style={{ fontFamily: selected ? font.sansBold : font.sansMedium, fontSize: 14, color: selected ? '#262420' : p.muted }}>
          {label}
        </Text>
        {iconAfter}
      </Animated.View>
    </Pressable>
  );
}
