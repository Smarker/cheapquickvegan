import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyBowl, StirringPot } from '../components/Doodles';
import { font, space, type as t, usePalette } from '../theme/tokens';

/** Stand-in for Search and Saved until they're built in this world. */
export function ComingSoonScreen({ title, line, doodle }: { title: string; line: string; doodle: 'pot' | 'bowl' }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: p.ground, paddingTop: insets.top + space.xl }]}>
      <Text style={[t.display, { color: p.ink, fontFamily: font.serif }]} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.center}>
        {doodle === 'pot' ? <StirringPot color={p.ink} /> : <EmptyBowl color={p.ink} />}
        <Text style={[t.hand, { color: p.ink, textAlign: 'center', fontSize: 22, lineHeight: 28 }]}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingBottom: 80 },
});
