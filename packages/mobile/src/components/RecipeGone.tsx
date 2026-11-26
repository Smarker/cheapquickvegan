import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyBowl } from './Doodles';
import { useSaved } from '../lib/saved';
import { font, space, type as t, usePalette } from '../theme/tokens';

/**
 * A recipe that's no longer there (renamed or unpublished since it was saved or planned).
 * Says so plainly, tidies it out of Saved and This week, and offers the way back.
 */
export function RecipeGone({ slug, onBack }: { slug: string; onBack: () => void }) {
  const p = usePalette();
  const saved = useSaved();
  const kept = saved.isSaved(slug) || saved.inWeek(slug);
  return (
    <View style={[styles.root, { backgroundColor: p.ground }]}>
      <EmptyBowl color={p.ink} size={120} />
      <Text style={[t.title, { color: p.ink, textAlign: 'center' }]} accessibilityRole="header">
        This recipe has moved
      </Text>
      <Text style={[t.body, { color: p.muted, textAlign: 'center' }]}>
        It may have been renamed or taken down. Try searching for it, or pick something else for tonight.
      </Text>
      {kept && (
        <Pressable
          onPress={() => {
            if (saved.isSaved(slug)) saved.toggle(slug);
            if (saved.inWeek(slug)) saved.toggleWeek(slug);
          }}
          accessibilityRole="button"
          style={[styles.secondary, { borderColor: p.hairline }]}
        >
          <Text style={[t.label, { color: p.ink }]}>Remove it from my kitchen</Text>
        </Pressable>
      )}
      <Pressable onPress={onBack} accessibilityRole="button" style={({ pressed }) => [styles.primary, { backgroundColor: p.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
        <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: '#2B2A24' }}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l, paddingHorizontal: space.xl },
  primary: { minHeight: 52, paddingHorizontal: space.xxl, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  secondary: { minHeight: 48, paddingHorizontal: space.xl, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
