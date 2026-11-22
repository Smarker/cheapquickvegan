import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Photo } from '../components/Photo';
import { guides } from '../lib/journeys';
import { space, type as t, usePalette } from '../theme/tokens';

type Props = NativeStackScreenProps<{ Guide: { slug: string } }, 'Guide'>;

// Plain text from Notion markdown: link labels, no bold markers, no inline images.
const clean = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .trim();

type Block = { kind: 'h2' | 'h3' | 'p' | 'li' | 'img'; text: string };

function blocks(md: string): Block[] {
  const out: Block[] = [];
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const img = line.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
    if (img) out.push({ kind: 'img', text: img[1].startsWith('/') ? `https://www.cheapquickvegan.com${img[1]}` : img[1] });
    else if (line.startsWith('### ')) out.push({ kind: 'h3', text: clean(line.slice(4)) });
    else if (line.startsWith('## ')) out.push({ kind: 'h2', text: clean(line.slice(3)) });
    else if (/^[-*]\s/.test(line)) out.push({ kind: 'li', text: clean(line.slice(2)) });
    else out.push({ kind: 'p', text: clean(line) });
  }
  return out.filter((b) => b.kind === 'img' || b.text.length > 0);
}

/** A travel or how-to guide, read in the app. */
export function GuideScreen({ route }: Props) {
  const p = usePalette();
  const { width } = useWindowDimensions();
  const g = guides.find((x) => x.slug === route.params.slug);
  if (!g) return null;
  const w = width - space.xl * 2;

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.root}>
      <Photo uri={g.image} width={w} height={w * 0.62} radius={24} floating />
      {(g.city || g.readingTime) && (
        <Text style={[t.hand, { color: p.greenDeep }]}>{[g.city && g.country ? `${g.city}, ${g.country}` : null, g.readingTime].filter(Boolean).join(' · ')}</Text>
      )}
      <Text style={[t.title, { color: p.ink }]} accessibilityRole="header">
        {g.title}
      </Text>
      {blocks(g.content).map((b, i) => {
        if (b.kind === 'img') return <Photo key={i} uri={b.text} width={w} height={w * 0.66} radius={18} />;
        if (b.kind === 'h2')
          return (
            <Text key={i} style={[t.section, { color: p.ink, marginTop: space.l }]} accessibilityRole="header">
              {b.text}
            </Text>
          );
        if (b.kind === 'h3')
          return (
            <Text key={i} style={[t.rowTitle, { color: p.ink, marginTop: space.s }]}>
              {b.text}
            </Text>
          );
        if (b.kind === 'li')
          return (
            <View key={i} style={styles.li}>
              <View style={[styles.dot, { backgroundColor: p.green }]} />
              <Text style={[t.body, { color: p.ink, flex: 1 }]}>{b.text}</Text>
            </View>
          );
        return (
          <Text key={i} style={[t.body, { color: p.ink }]}>
            {b.text}
          </Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: space.xl, paddingTop: space.s, paddingBottom: 64, gap: space.m },
  li: { flexDirection: 'row', gap: space.m, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
});

