import { Text, View, type ViewStyle } from 'react-native';
import { type as t } from '../theme/tokens';

/** An ink stamp, slightly crooked, that records how many times you've made a recipe. */
export function CookedStamp({ count, color, style }: { count: number; color: string; style?: ViewStyle }) {
  if (count < 1) return null;
  return (
    <View
      accessibilityLabel={`Cooked ${count} ${count === 1 ? 'time' : 'times'}`}
      style={[
        { borderWidth: 2, borderColor: color, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1, transform: [{ rotate: '-6deg' }], alignSelf: 'flex-start' },
        style,
      ]}
    >
      <Text style={[t.hand, { color, fontSize: 17, lineHeight: 21 }]}>cooked ×{count}</Text>
    </View>
  );
}
