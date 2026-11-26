import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { CrossIcon } from './Icons';
import { dismissHint, useHint } from '../lib/hints';
import { space, type as t, usePalette } from '../theme/tokens';

type Props = {
  /** Stable id: once dismissed, never shown again. */
  id: string;
  children: React.ReactNode;
  /** Something drawn before the text, like the blazes it explains. */
  lead?: React.ReactNode;
  /** True once the cook has used the feature, which counts as having learned it. */
  doneWhen?: boolean;
  /** Cook mode's dark palette. */
  colors?: { ink: string; panel: string; line: string };
};

/** A quiet first-time note on paper, at the point of use. Dismissed with ✕ or by just doing the thing. */
export function Hint({ id, children, lead, doneWhen, colors }: Props) {
  const p = usePalette();
  const show = useHint(id);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (doneWhen) dismissHint(id);
  }, [doneWhen, id]);
  if (!show) return null;
  const c = colors ?? { ink: p.ink, panel: p.sand, line: p.hairline };
  return (
    <Animated.View
      entering={reduce ? undefined : FadeIn.duration(250)}
      exiting={reduce ? undefined : FadeOut.duration(180)}
      style={[styles.box, { backgroundColor: c.panel, borderColor: c.line }]}
      accessibilityRole="text"
    >
      {lead}
      <Text style={[t.small, { color: c.ink, flex: 1 }]}>{children}</Text>
      <Pressable onPress={() => dismissHint(id)} accessibilityRole="button" accessibilityLabel="Got it, hide this tip" hitSlop={10} style={styles.close}>
        <CrossIcon color={c.ink} size={16} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderWidth: 1.5, borderRadius: 18, paddingLeft: space.l, paddingVertical: space.s, minHeight: 52 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
