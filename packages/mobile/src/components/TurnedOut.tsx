import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useJournal, VERDICTS } from '../lib/journal';
import type { Recipe } from '../lib/recipes';
import { sendStars } from '../lib/siteRating';
import { font, space, type as t } from '../theme/tokens';

export type TurnedOutColors = { ink: string; soft: string; line: string; accent: string; field: string };

const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';

/**
 * "How did it turn out?" after cooking, or from the recipe page later. The answer, note and
 * swaps stay on the phone. Site stars are a separate, optional choice, sent only when tapped.
 */
export function TurnedOut({ recipe, colors: c }: { recipe: Recipe; colors: TurnedOutColors }) {
  const journal = useJournal();
  const e = journal.entry(recipe.slug);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const rate = async (stars: number) => {
    if (!recipe.id || sending) return;
    Haptics.selectionAsync();
    setSending(true);
    setFailed(false);
    try {
      const token = await sendStars(recipe.id, stars, e?.siteToken ?? null);
      journal.update(recipe.slug, { siteStars: stars, siteToken: token });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const field = (value: string, onChange: (v: string) => void, label: string, placeholder: string) => (
    <View style={{ gap: space.xs }}>
      <Text style={[t.label, { color: c.ink }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.soft}
        multiline
        accessibilityLabel={label}
        style={[t.body, styles.input, { color: c.ink, backgroundColor: c.field, borderColor: c.line }]}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <Text style={[t.section, { color: c.ink }]} accessibilityRole="header">
        How did it turn out?
      </Text>
      <View style={styles.choices} accessibilityRole="radiogroup">
        {VERDICTS.map((v) => {
          const on = e?.verdict === v.key;
          return (
            <Pressable
              key={v.key}
              onPress={() => {
                Haptics.selectionAsync();
                journal.update(recipe.slug, { verdict: on ? null : v.key });
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.choice, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accent : 'transparent' }]}
            >
              <Text style={[t.label, { color: on ? '#2B2A24' : c.ink }]}>{v.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {!!e?.verdict && (
        <>
          {field(e.note, (note) => journal.update(recipe.slug, { note }), 'A note for next time', 'Only you see this, e.g. "double the garlic"')}
          {field(e.swaps, (swaps) => journal.update(recipe.slug, { swaps }), 'Anything you swapped?', 'e.g. "tamari for soy sauce"')}

          {!!recipe.id && (
            <View style={{ gap: space.xs }}>
              <Text style={[t.label, { color: c.ink }]}>Rate it on the site too?</Text>
              <Text style={[t.small, { color: c.soft }]}>Optional. Your stars help other cooks; your notes stay on your phone.</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = (e.siteStars ?? 0) >= n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => rate(n)}
                      disabled={sending}
                      accessibilityRole="button"
                      accessibilityLabel={`${n} ${n === 1 ? 'star' : 'stars'}`}
                      accessibilityState={{ selected: e.siteStars === n, disabled: sending }}
                      hitSlop={4}
                      style={styles.star}
                    >
                      <Svg width={32} height={32} viewBox="0 0 24 24">
                        <Path d={STAR} fill={on ? c.accent : 'none'} stroke={on ? c.accent : c.soft} strokeWidth={1.6} strokeLinejoin="round" />
                      </Svg>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[t.small, { color: c.soft }]} accessibilityLiveRegion="polite">
                {sending ? 'Sending…' : failed ? "Couldn't send it. Check your connection and tap a star again." : e.siteStars ? 'Thanks! Your stars are on the site. Tap to change them.' : ' '}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.m, alignSelf: 'stretch' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  choice: { borderWidth: 2, borderRadius: 22, minHeight: 44, paddingHorizontal: space.l, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: space.m, paddingVertical: space.s, minHeight: 48, textAlignVertical: 'top', fontFamily: font.sans },
  stars: { flexDirection: 'row', gap: space.xs },
  star: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
