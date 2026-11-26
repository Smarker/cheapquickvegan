import { Text, View } from 'react-native';
import { CheckIcon } from './Icons';
import { font } from '../theme/tokens';

type Props = {
  n: number;
  done?: boolean;
  /** The step you're on: filled, so "you are here" reads at a glance. */
  current?: boolean;
  colors: { ink: string; green: string; line: string; onGreen?: string };
  size?: number;
};

/** A step's number in a small circle; a tick once it's done. Same on the recipe page and in cook mode. */
export function StepBadge({ n, done, current, colors, size = 30 }: Props) {
  const filled = done || current;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: filled ? colors.green : colors.line,
        backgroundColor: filled ? colors.green : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessible={false}
    >
      {done ? (
        <CheckIcon color={colors.onGreen ?? '#FFFFFF'} size={size * 0.5} />
      ) : (
        <Text style={{ fontFamily: font.sansBold, fontSize: size * 0.48, lineHeight: size * 0.62, color: current ? (colors.onGreen ?? '#FFFFFF') : colors.ink }}>{n}</Text>
      )}
    </View>
  );
}
