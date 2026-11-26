import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCollections } from '../lib/collectionsStore';
import { useSaved } from '../lib/saved';
import { font, space, type as t, usePalette } from '../theme/tokens';
import { CheckIcon } from './Icons';

/**
 * Put one recipe in any number of collections, or start a new one. Adding to a collection
 * also saves the recipe, since collections only hold saved recipes.
 */
export function CollectionPicker({ slug, title, visible, onClose }: { slug: string; title: string; visible: boolean; onClose: () => void }) {
  const p = usePalette();
  const saved = useSaved();
  const { collections, create, toggle } = useCollections();
  const [name, setName] = useState('');

  const ensureSaved = () => {
    if (!saved.isSaved(slug)) saved.toggle(slug);
  };
  const add = () => {
    if (!name.trim()) return;
    Haptics.selectionAsync();
    ensureSaved();
    create(name, slug);
    setName('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text style={[t.section, { color: p.ink, flex: 1 }]} accessibilityRole="header">
            Collections
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={10}>
            <Text style={[t.label, { color: p.greenDeep }]}>Done</Text>
          </Pressable>
        </View>
        <Text style={[t.body, { color: p.muted }]} numberOfLines={2}>
          {title} can go in as many as you like.
        </Text>

        {collections.map((c) => {
          const on = c.slugs.includes(slug);
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                Haptics.selectionAsync();
                if (!on) ensureSaved();
                toggle(c.id, slug);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${c.name}, ${c.slugs.length} ${c.slugs.length === 1 ? 'recipe' : 'recipes'}`}
              style={[styles.row, { borderColor: p.hairline }]}
            >
              <View style={[styles.box, { borderColor: on ? p.green : p.control, backgroundColor: on ? p.green : 'transparent' }]}>
                {on && <CheckIcon color="#FFFFFF" size={14} />}
              </View>
              <Text style={[t.body, { color: p.ink, flex: 1 }]}>{c.name}</Text>
              <Text style={[t.small, { color: p.muted }]}>{c.slugs.length}</Text>
            </Pressable>
          );
        })}

        <View style={{ gap: space.s }}>
          <Text style={[t.label, { color: p.ink }]}>{collections.length ? 'New collection' : 'Start your first collection'}</Text>
          <View style={styles.newRow}>
            <TextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={add}
              returnKeyType="done"
              placeholder="e.g. Weeknights, For guests"
              placeholderTextColor={p.muted}
              accessibilityLabel="New collection name"
              style={[t.body, styles.input, { color: p.ink, backgroundColor: p.sand, borderColor: p.hairline }]}
            />
            <Pressable onPress={add} disabled={!name.trim()} accessibilityRole="button" accessibilityLabel="Add collection" style={[styles.addBtn, { backgroundColor: p.accent, opacity: name.trim() ? 1 : 0.4 }]}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: '#2B2A24' }}>Add</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { padding: space.xl, gap: space.m },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  newRow: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: space.m, minHeight: 48 },
  addBtn: { minHeight: 48, paddingHorizontal: space.l, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
