import { useMemo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { CookCat } from './CookCat';
import Svg, { Circle, Path } from 'react-native-svg';
import { CheckIcon } from './Icons';
import { journey, type Region } from '../lib/journeys';
import { Photo } from './Photo';
import { displayTitle, type Recipe } from '../lib/recipes';
import { useSaved } from '../lib/saved';
import { space, type as t, usePalette } from '../theme/tokens';

const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '');

type Props = {
  region: Region;
  recipes: Recipe[];
  /** On Kitchen's "Your journeys" the card opens the journey. */
  onPress?: () => void;
};

/**
 * A keepsake for a finished journey: the trail, when you summited, and every recipe you cooked on the
 * way with its date. A memory, not a reward (see PRODUCT.md), with the cat at the summit in the corner.
 */
export function TrailPostcard({ region, recipes, onPress }: Props) {
  const p = usePalette();
  const saved = useSaved();
  const summited = saved.summits[region.id];
  // A real photo of the area makes it a postcard: the journey's own pick, or its first travel guide's photo.
  const photo = useMemo(
    () => region.postcardPhoto ?? journey(region).flatMap((s) => (s.kind === 'guide' && s.guide.image ? [s.guide.image] : []))[0],
    [region],
  );

  const share = () => {
    const list = recipes.map((r) => `✓ ${displayTitle(r)}`).join('\n');
    Share.share({
      title: region.trail,
      message: `I hiked "${region.trail}" on CheapQuickVegan${summited ? `, summited ${day(summited)}` : ''}.\n\n${list}\n\nhttps://www.cheapquickvegan.com`,
    }).catch(() => {});
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Postcard: ${region.trail}${summited ? `, summited ${day(summited)}` : ''}`}
      style={({ pressed }) => [styles.card, { backgroundColor: p.sand, opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={[styles.tape, { backgroundColor: p.tape }]} />
      {photo ? (
        <Photo uri={photo} width={300} height={150} radius={16} style={styles.photo} />
      ) : (
        // Placeholder until there's a real photo of the area: the same frame, drawn in ink.
        <View style={[styles.scene, { backgroundColor: p.greenSoft }]} accessible={false}>
          <Svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMax slice">
            <Circle cx={236} cy={40} r={16} fill="none" stroke={p.ink} strokeWidth={2} />
            <Path d="M0 150 L70 62 L104 98 L150 40 L214 120 L244 92 L300 150 Z" fill={p.ground} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M132 62 L150 40 L166 60 M60 74 L70 62 L80 74" fill="none" stroke={p.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M40 150 C80 132 120 140 150 124 C180 108 214 120 250 150" fill="none" stroke={p.greenDeep} strokeWidth={2.5} strokeDasharray="1 8" strokeLinecap="round" />
          </Svg>
        </View>
      )}
      <View style={styles.head}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[t.cardTitle, { color: p.ink }]}>{region.trail}</Text>
          {summited && <Text style={[t.label, { color: p.greenDeep }]}>Summited {day(summited)}</Text>}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        {recipes.map((r) => (
          <View key={r.slug} style={styles.row}>
            <CheckIcon color={p.green} size={16} />
            <Text style={[t.small, { color: p.ink, flex: 1 }]} numberOfLines={1}>
              {displayTitle(r)}
            </Text>
            <Text style={[t.small, { color: p.muted }]}>{day(saved.firstCookedOn(r.slug))}</Text>
          </View>
        ))}
      </View>
      <View style={styles.foot}>
        <Pressable onPress={share} accessibilityRole="button" hitSlop={8} style={styles.share}>
          <Text style={[t.label, { color: p.greenDeep, textDecorationLine: 'underline' }]}>Share postcard</Text>
        </Pressable>
        <CookCat outline={p.ink} size={48} napAfter={1e9} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: space.l, paddingTop: space.xl, gap: space.m, transform: [{ rotate: '-1deg' }] },
  tape: { position: 'absolute', top: -8, alignSelf: 'center', width: 72, height: 20, opacity: 0.85, transform: [{ rotate: '2deg' }] },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  photo: { alignSelf: 'stretch', width: '100%' },
  scene: { alignSelf: 'stretch', height: 150, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  foot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  share: { minHeight: 44, justifyContent: 'center' },
});
