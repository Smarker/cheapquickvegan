import { useEffect } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type Props = { text: string; done: boolean; style: TextStyle; doneColor: string; lineColor: string };

/** Ingredient text that gets a hand-drawn pencil line through it when ticked off. */
export function PencilStrike({ text, done, style, doneColor, lineColor }: Props) {
  const reduce = useReducedMotion();
  const v = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    v.value = reduce ? (done ? 1 : 0) : withTiming(done ? 1 : 0, { duration: done ? 280 : 160, easing: Easing.out(Easing.quad) });
  }, [done, reduce, v]);
  const line = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }], opacity: v.value === 0 ? 0 : 1 }));
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignSelf: 'flex-start', maxWidth: '100%' }}>
      <Text style={[style, { color: done ? doneColor : style.color }]}>{text}</Text>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'center', transformOrigin: 'left' }, line]}>
        <Svg width="100%" height={8} viewBox="0 0 100 8" preserveAspectRatio="none">
          <Path d="M1 5 C20 3 35 6 55 4 C72 3 86 6 99 3" stroke={lineColor} strokeWidth={1.6} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </Svg>
      </Animated.View>
      </View>
    </View>
  );
}
