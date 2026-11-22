import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { type as t, usePalette } from '../theme/tokens';

/** Placeholder for one of Stephanie's illustrations. Decorative: hidden from screen readers. */
export function SvgSlot({ size = 64, style }: { size?: number; style?: ViewStyle }) {
  const p = usePalette();
  if (!__DEV__) return null;
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.slot, { width: size, height: size, borderRadius: size / 2, borderColor: p.hairline }, style]}
    >
      <Text style={[t.label, { fontSize: 10, color: p.muted, textAlign: 'center' }]}>SVG{'\n'}slot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
});
