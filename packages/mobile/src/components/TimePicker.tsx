import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, withSpring } from 'react-native-reanimated';
import { TIME_OPTIONS, type TimeLimit } from '../lib/recipes';
import { font, glide, usePalette } from '../theme/tokens';

type Box = { x: number; w: number };

/** 15 · 30 · 1 hr · Any, with a sea-glass highlight that glides to the chosen time. */
export function TimePicker({ value, onChange }: { value: TimeLimit; onChange: (v: TimeLimit) => void }) {
  const p = usePalette();
  const reduce = useReducedMotion();
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const current = boxes[String(value)];

  const highlight = useAnimatedStyle(() => {
    if (!current) return { opacity: 0 };
    const to = reduce ? (n: number) => n : (n: number) => withSpring(n, glide);
    return { opacity: 1, transform: [{ translateX: to(current.x) }], width: to(current.w) };
  }, [current, reduce]);

  return (
    <View style={[styles.track, { backgroundColor: p.mist }]} accessibilityRole="tablist">
      <Animated.View pointerEvents="none" style={[styles.highlight, { backgroundColor: p.accent }, highlight]} />
      {TIME_OPTIONS.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.label}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              setBoxes((b) => ({ ...b, [String(o.value)]: { x, w: width } }));
            }}
            onPress={() => {
              if (on) return;
              Haptics.selectionAsync();
              onChange(o.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.value == null ? 'Any amount of time' : `${o.label} or less`}
            style={styles.option}
          >
            <Text style={{ fontFamily: on ? font.sansBold : font.sansMedium, fontSize: 14, color: on ? '#2B2A24' : p.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 22, padding: 4, alignSelf: 'flex-start' },
  highlight: { position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: 18 },
  option: { minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
});
