import { View } from 'react-native';
import type { Difficulty } from '../lib/journeys';

const BLAZES: Record<Difficulty, number> = { Easy: 1, Medium: 2, Challenge: 3 };

/** Trail blazes, like the painted marks on trees: one for easy, three for hard. */
export function Blazes({ level, color }: { level: Difficulty; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={level}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ width: 9, height: 14, borderRadius: 2, backgroundColor: color, opacity: i <= BLAZES[level] ? 1 : 0.18 }} />
      ))}
    </View>
  );
}
