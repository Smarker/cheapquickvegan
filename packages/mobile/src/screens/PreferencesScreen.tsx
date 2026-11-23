import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Pill } from '../components/Pill';
import { ToggleChip } from '../components/ToggleChip';
import { ALLERGENS } from '../lib/allergens';
import { handsFreeAvailable } from '../lib/handsFree';
import { usePrefs, type Theme } from '../lib/prefs';
import { recipes } from '../lib/recipes';
import type { Units } from '../lib/units';
import { space, type as t, usePalette } from '../theme/tokens';

// Equipment worth asking about: the things a kitchen might not have. Pots, pans and bowls go without saying.
const BASICS = new Set(['Mixing Bowls', 'Can Opener', 'Glass Tupperware', 'Small Pot', 'Medium Saucepan', 'Large Pot', 'Tall Skillet', 'Baking Sheet']);
const nice = (tag: string) => tag.charAt(0) + tag.slice(1).toLowerCase();

/** Your kitchen's settings: measurements, equipment, things to avoid, cook mode, and look. */
export function PreferencesScreen() {
  const p = usePalette();
  const prefs = usePrefs();
  const gear = [...new Set(recipes.flatMap((r) => r.equipment))].filter((e) => !BASICS.has(e)).sort();
  const canVoice = handsFreeAvailable();

  const Section = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[t.section, { color: p.ink, fontSize: 20 }]} accessibilityRole="header">
        {title}
      </Text>
      {note && <Text style={[t.body, { color: p.muted }]}>{note}</Text>}
      {children}
    </View>
  );
  const Toggle = ({ label, hint, value, onChange, disabled }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <View style={styles.toggle}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.body, { color: disabled ? p.muted : p.ink }]}>{label}</Text>
        {hint && <Text style={[t.small, { color: p.muted }]}>{hint}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ true: p.accent, false: p.hairline }}
        thumbColor={value ? p.green : p.ground}
      />
    </View>
  );

  const units: { value: Units | null; label: string }[] = [
    { value: null, label: 'As written' },
    { value: 'volume', label: 'Cups & spoons' },
    { value: 'grams', label: 'Grams' },
  ];
  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: 'Match phone' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.root}>
      <Section title="Measurements" note="Grams weigh everything in one bowl. Small amounts stay in teaspoons and tablespoons either way.">
        <View style={styles.row}>
          {units.map((u) => (
            <Pill key={u.label} label={u.label} selected={prefs.units === u.value} onPress={() => prefs.set('units', u.value)} role="tab" />
          ))}
        </View>
      </Section>

      <Section title="My equipment" note="Ticked means you have it. Untick anything you don't. Recipes that need it leave your Discover trail. Search still finds them and says what they need.">
        <View style={styles.row}>
          {gear.map((tag) => (
            <ToggleChip key={tag} kind="have" label={nice(tag)} on={!prefs.missingGear.includes(tag)} onPress={() => prefs.toggleGear(tag)} />
          ))}
        </View>
      </Section>

      <Section title="Things to avoid" note="Recipes that seem to contain these leave your Discover trail, and get a note everywhere else.">
        <View style={styles.row}>
          {ALLERGENS.map((a) => (
            <ToggleChip key={a.key} kind="avoid" label={a.label} on={prefs.avoid.includes(a.key)} onPress={() => prefs.toggleAvoid(a.key)} />
          ))}
        </View>
        <Text style={[t.label, { color: p.ink }]} accessibilityLiveRegion="polite">
          {prefs.avoid.length
            ? `Avoiding: ${ALLERGENS.filter((a) => prefs.avoid.includes(a.key)).map((a) => a.label.toLowerCase()).join(', ')}`
            : 'Not avoiding anything.'}
        </Text>
        <View style={[styles.caveat, { backgroundColor: p.sand, borderColor: p.hairline }]}>
          <Text style={[t.small, { color: p.ink }]}>
            This reads the ingredient list, not the packaging. A branded sauce or a "may contain" label can hide soy, gluten or nuts, so please
            always check labels, especially for allergies.
          </Text>
        </View>
      </Section>

      <Section title="Cook mode">
        <Toggle
          label="Start hands-free automatically"
          hint={canVoice ? 'Listens as soon as you start cooking.' : 'Voice needs the full app, not the Expo Go preview.'}
          value={prefs.autoHandsFree}
          onChange={(v) => prefs.set('autoHandsFree', v)}
          disabled={!canVoice}
        />
        <Toggle
          label="Read steps aloud"
          hint={prefs.readAloud ? 'Reads each step when you say "next". Turn off to just hear the step name, so it listens again sooner.' : 'Says the step name only. Say "repeat" to hear the whole step.'}
          value={prefs.readAloud}
          onChange={(v) => prefs.set('readAloud', v)}
          disabled={!canVoice}
        />
        <Toggle label="Cat helper" hint="Walks along your steps and cheers when you finish." value={prefs.helper} onChange={(v) => prefs.set('helper', v)} />
      </Section>

      <Section title="Look">
        <View style={styles.row}>
          {themes.map((x) => (
            <Pill key={x.value} label={x.label} selected={prefs.theme === x.value} onPress={() => prefs.set('theme', x.value)} role="tab" />
          ))}
        </View>
      </Section>

      <Section title="About">
        <Pressable onPress={() => Linking.openURL('https://www.cheapquickvegan.com')} accessibilityRole="link" style={styles.link}>
          <Text style={[t.body, { color: p.greenDeep, textDecorationLine: 'underline' }]}>cheapquickvegan.com</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://www.cheapquickvegan.com/contact')} accessibilityRole="link" style={styles.link}>
          <Text style={[t.body, { color: p.greenDeep, textDecorationLine: 'underline' }]}>Send feedback or say hi</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingBottom: 64, gap: space.xl },
  section: { gap: space.s },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56 },
  caveat: { borderWidth: 1.5, borderRadius: 16, padding: space.m, marginTop: space.xs },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});
