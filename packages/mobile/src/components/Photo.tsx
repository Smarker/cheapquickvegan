import { Image } from 'expo-image';
import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import { lift, usePalette } from '../theme/tokens';
import { EmptyBowl } from './Doodles';

type Props = { uri: string; width: number; height?: number; radius?: number; floating?: boolean; style?: ViewStyle };

/** A recipe photo in a soft rounded frame. If it can't load (no signal), a bowl doodle stands in. */
export function Photo({ uri, width, height, radius = 24, floating, style }: Props) {
  const p = usePalette();
  const [failed, setFailed] = useState(false);
  const h = height ?? width;
  return (
    <View
      style={[
        { width, height: h, borderRadius: radius, backgroundColor: p.photoFallback, alignItems: 'center', justifyContent: 'center' },
        floating && lift(p),
        style,
      ]}
    >
      {failed ? (
        <EmptyBowl color={p.muted} size={Math.min(width, h) * 0.5} />
      ) : (
        <Image
          source={{ uri }}
          style={{ width, height: h, borderRadius: radius }}
          contentFit="cover"
          transition={250}
          cachePolicy="disk"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}
