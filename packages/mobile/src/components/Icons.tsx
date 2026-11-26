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
export const CrossIcon = ({ color, size = 16 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 7l10 10M17 7L7 17" stroke={color} {...base} strokeWidth={2.4} /></Svg>
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
/** Kitchen tab: a little pot with a lid knob and steam, in the same 1.8 stroke. */
export const KitchenIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4.5 11h15v5.5a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5z M2.5 12.5h2 M19.5 12.5h2 M4 11h16 M10.5 9h3" stroke={color} {...base} />
    <Path d="M9.5 6.5c0-1 .8-1.2.8-2.2 M13.7 6.5c0-1 .8-1.2.8-2.2" stroke={color} {...base} />
  </Svg>
);
export const SavedIcon = ({ color, size = 24 }: P) => <HeartIcon color={color} size={size} />;
/** Share: the arrow out of a tray, drawn in the same 1.8px hand. */
export const ShareIcon = ({ color, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke={color} {...base} />
  </Svg>
);
/** Grocery list: a little clipboard with two ticked lines. */
/** This week: a little calendar page. */
export const CalendarIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6z M4 10.5h16 M8.5 4v3.5 M15.5 4v3.5" stroke={color} {...base} />
    <Path d="M8.5 14.5h.01 M12 14.5h.01 M15.5 14.5h.01" stroke={color} {...base} strokeWidth={2.4} />
  </Svg>
);
export const ListIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M8 4.5H6.5A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H16" stroke={color} {...base} />
    <Path d="M9 3.5h6v2.5H9z M8.5 11l1.5 1.5 2.5-2.5 M8.5 16l1.5 1.5 2.5-2.5 M14.5 11.5H16 M14.5 16.5H16" stroke={color} {...base} />
  </Svg>
);
