import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon } from './Icons';
import { IngredientDoodle } from './IngredientDoodle';
import { font, space, type as t, usePalette } from '../theme/tokens';

export type PickerGroup = { slug: string; title: string; lines: string[] };

type Props = {
  visible: boolean;
  groups: PickerGroup[];
  onClose: () => void;
  /** The lines the cook needs, per recipe. */
  onAdd: (picked: PickerGroup[]) => void;
};

/**
 * "What do you need?": everything starts ticked, and the cook unticks what's already in the
 * cupboard. Asking at the moment of adding means nobody has to know a trick beforehand.
 */
export function GroceryPicker({ visible, groups, onClose, onAdd }: Props) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const keys = useMemo(() => groups.flatMap((g) => g.lines.map((_, i) => `${g.slug}:${i}`)), [groups]);
  const [skip, setSkip] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (visible) setSkip(new Set());
  }, [visible]);

  const count = keys.length - skip.size;
  const toggle = (k: string) => {
    Haptics.selectionAsync();
    setSkip((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: p.ground, paddingBottom: insets.bottom + space.l }]}>
          <View style={[styles.grabber, { backgroundColor: p.hairline }]} />
          <Text style={[t.section, { color: p.ink, fontSize: 22 }]} accessibilityRole="header">
            What do you need?
          </Text>
          <Text style={[t.body, { color: p.muted }]}>Untick anything you already have.</Text>

          <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ paddingVertical: space.s }}>
            {groups.map((g) => (
              <View key={g.slug} style={{ gap: 2 }}>
                {groups.length > 1 && <Text style={[t.label, { color: p.greenDeep, marginTop: space.m }]}>{g.title}</Text>}
                {g.lines.map((line, i) => {
                  const k = `${g.slug}:${i}`;
                  const on = !skip.has(k);
                  return (
                    <Pressable key={k} onPress={() => toggle(k)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.row}>
                      <View style={[styles.box, { borderColor: on ? p.green : p.control, backgroundColor: on ? p.green : 'transparent' }]}>
                        {on && <CheckIcon color="#FFFFFF" size={14} />}
                      </View>
                      <View style={[styles.art, { opacity: on ? 1 : 0.4 }]}>
                        <IngredientDoodle line={line} color={p.ink} size={24} />
                      </View>
                      <Text style={[t.body, { color: on ? p.ink : p.muted, flex: 1 }]}>{line}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={onClose} accessibilityRole="button" style={[styles.secondary, { borderColor: p.hairline }]}>
              <Text style={[t.label, { color: p.ink }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onAdd(groups.map((g) => ({ ...g, lines: g.lines.filter((_, i) => !skip.has(`${g.slug}:${i}`)) })).filter((g) => g.lines.length));
              }}
              disabled={!count}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, { backgroundColor: p.accent, opacity: count ? 1 : 0.5, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            >
              <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: '#2B2A24' }}>
                {count ? `Add ${count} to grocery list` : 'You have everything'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: space.xl, paddingTop: space.s, gap: space.xs },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: space.m },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 48, paddingVertical: 4 },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  art: { width: 26, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: space.m, marginTop: space.m },
  secondary: { minHeight: 52, paddingHorizontal: space.l, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  primary: { flex: 1, minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
