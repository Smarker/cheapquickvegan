import Svg, { Circle, Path } from 'react-native-svg';

// One authored set: 24px grid, 1.8px round strokes, matching the reference's thin line icons.
type P = { color: string; size?: number };
const base = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const ArrowIcon = ({ color, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M5 12h13M13 6l6 6-6 6" stroke={color} {...base} /></Svg>
);
export const CheckIcon = ({ color, size = 16 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} {...base} strokeWidth={2.4} /></Svg>
);
export const ClockIcon = ({ color, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="8.5" stroke={color} {...base} /><Path d="M12 7.5V12l3 2" stroke={color} {...base} /></Svg>
);
export const ServesIcon = ({ color, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="8" r="3.8" stroke={color} {...base} /><Path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" stroke={color} {...base} /></Svg>
);
/** Equipment: a small pan. */
export const PanIcon = ({ color, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M3 11h13v2.5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM16 12h5" stroke={color} {...base} /><Path d="M7.5 8c0-1.2 1-1.3 1-2.5M11 8c0-1.2 1-1.3 1-2.5" stroke={color} {...base} /></Svg>
);
export const HeartIcon = ({ color, size = 22, filled }: P & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" stroke={color} {...base} fill={filled ? color : 'none'} />
  </Svg>
);
/** Discover: a leaf. */
export const DiscoverIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l7-7" stroke={color} {...base} /></Svg>
);
export const SearchIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="10.5" cy="10.5" r="6" stroke={color} {...base} /><Path d="M15 15l5 5" stroke={color} {...base} /></Svg>
);
export const SavedIcon = ({ color, size = 24 }: P) => <HeartIcon color={color} size={size} />;
/** Share: the arrow out of a tray, drawn in the same 1.8px hand. */
export const ShareIcon = ({ color, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke={color} {...base} />
  </Svg>
);
