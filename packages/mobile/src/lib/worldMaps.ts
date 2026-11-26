// The real places behind each cooking-journey area. Coordinates are [longitude, latitude].
// The land itself is painted from real elevation data (assets/relief), with its coastline in reliefData.ts.

export type LonLat = [number, number];

/** Where a hike ends, which way its trail comes in from (screen degrees, 0 is east, 90 is south), and how long it is (points on a map REF_W wide). */
export type HikeSpot = { label: string; at: LonLat; from: number; length: number; nudge?: [number, number] };

export type WorldMap = {
  /** The map's frame: west, south, east, north. Must match the frame the relief was generated for. */
  frame: [number, number, number, number];
  /** Keyed by hike id. */
  hikes: Record<string, HikeSpot>;
};

export const WORLD_MAPS: Record<string, WorldMap> = {
  italy: {
    frame: [5.2, 36.4, 19.4, 47.4],
    hikes: {
      'italy-lakes': { label: 'Lake Como', at: [9.26, 45.98], from: 95, length: 64 },
      'italy-coast': { label: 'Cinque Terre', at: [9.7, 44.13], from: 30, length: 56 },
      'italy-dolomites': { label: 'Dolomites', at: [11.85, 46.45], from: 110, length: 70 },
      // An area with too few recipes for separate hikes has one mixed trail, drawn at the medium hike's place.
      'italy-trail': { label: 'Cinque Terre', at: [9.7, 44.13], from: 30, length: 56 },
    },
  },
  asia: {
    frame: [95.5, 4, 146, 46.5],
    hikes: {
      'asia-market': { label: 'Bangkok', at: [100.5, 13.75], from: -90, length: 60 },
      'asia-terraces': { label: 'Hangzhou', at: [120.1, 30.25], from: 180, length: 64 },
      'asia-fuji': { label: 'Mt Fuji', at: [138.73, 35.36], from: 175, length: 36 },
      'asia-trail': { label: 'Hangzhou', at: [120.1, 30.25], from: 180, length: 64 },
    },
  },
  americas: {
    frame: [-126, 23.5, -65.5, 50],
    hikes: {
      'americas-blueridge': { label: 'Blue Ridge', at: [-80.5, 37.0], from: 150, length: 58 },
      'americas-appalachian': { label: 'Mt Washington', at: [-71.3, 44.27], from: 135, length: 56 },
      'americas-canyon': { label: 'Grand Canyon', at: [-112.1, 36.1], from: -15, length: 52 },
      'americas-trail': { label: 'Mt Washington', at: [-71.3, 44.27], from: 135, length: 56 },
    },
  },
  latin: {
    frame: [-118, -56.5, -33, 33],
    hikes: {
      'latin-cusco': { label: 'Cusco', at: [-71.97, -13.53], from: 10, length: 46, nudge: [6, 6] },
      'latin-inca': { label: 'Machu Picchu', at: [-72.54, -13.16], from: -100, length: 46, nudge: [-6, -6] },
      'latin-paine': { label: 'Torres del Paine', at: [-73.0, -51.0], from: -80, length: 56 },
      'latin-trail': { label: 'Machu Picchu', at: [-72.54, -13.16], from: -100, length: 46 },
    },
  },
};

export type Projected = { x: number; y: number };

/** An equirectangular projection of a map's frame into a box of the given width, keeping its true shape. */
export function projection(map: WorldMap, width: number) {
  const [w, s, e, n] = map.frame;
  const cosMid = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const height = Math.round((width * (n - s)) / ((e - w) * cosMid));
  const at = ([lon, lat]: LonLat): Projected => ({ x: ((lon - w) / (e - w)) * width, y: ((n - lat) / (n - s)) * height });
  return { height, at };
}

/** The map width hike lengths and nudges are given at; on other screens they scale with the map. */
export const REF_W = 340;

/** How far a hike's close-up zooms in on its map. */
export const CLOSE_UP_ZOOM = 3;

/** A part of a map, as fractions of its width and height. */
export type MapBox = { x: number; y: number; w: number; h: number };

/**
 * The part of the map a hike's close-up shows: a box 1/CLOSE_UP_ZOOM of the map's size, centred on
 * the middle of the hike's trail and kept inside the map. The same box at any screen size, so the
 * close-up pictures can be made ahead of time.
 */
export function closeUpBox(map: WorldMap, id: string): MapBox | null {
  const spot = map.hikes[id];
  if (!spot) return null;
  const { height, at } = projection(map, REF_W);
  const end = at(spot.at);
  const a = (spot.from * Math.PI) / 180;
  // The trail's S-curve is symmetric, so its middle is the middle of the line from trailhead to end.
  const mx = end.x + (spot.nudge?.[0] ?? 0) + (spot.length / 2) * Math.cos(a);
  const my = end.y + (spot.nudge?.[1] ?? 0) + (spot.length / 2) * Math.sin(a);
  const w = 1 / CLOSE_UP_ZOOM;
  const h = 1 / CLOSE_UP_ZOOM;
  const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));
  return { x: clamp(mx / REF_W - w / 2, 1 - w), y: clamp(my / height - h / 2, 1 - h), w, h };
}
