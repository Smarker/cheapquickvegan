// Paints the journey map's land from real elevation data: one picture per area for the trail map, and a
// sharper close-up for each hike, each in the light and dark themes, with edges that dissolve into the page.
// Writes the list of pictures to src/lib/reliefData.ts. Also paints the recipe photo's soft edge (assets/hero-fade.png).
//
// Source: AWS Terrain Tiles (terrarium encoding; built from SRTM, GMTED2010, ETOPO1 and others). Tiles are
// downloaded once into node_modules/.cache/terrain-tiles.
//
// Run with: pnpm build:relief
// Rerun it after changing an area's frame or a hike's place in src/lib/worldMaps.ts, or the map colours below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import { closeUpBox, REF_W, WORLD_MAPS, type MapBox } from '../src/lib/worldMaps.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const cacheDir = path.join(root, 'node_modules/.cache/terrain-tiles');
const assetDir = path.join(root, 'assets/relief');
const closeDir = path.join(assetDir, 'close');
const outTs = path.join(root, 'src/lib/reliefData.ts');
for (const d of [cacheDir, assetDir, closeDir]) fs.mkdirSync(d, { recursive: true });

// The colours the land is painted in. Keep in step with relief, shelf, mist and ink in src/theme/tokens.ts.
const THEMES = {
  light: { mist: '#EBE1D0', shelf: '#F2EADD', ink: '#2E2E2E', relief: ['#E3E7CC', '#D5DCB1', '#DCD9AE', '#E1CEA2', '#D5B98E', '#C6A57E', '#F6F1E6'] },
  dark: { mist: '#26291D', shelf: '#2D3022', ink: '#F4EFE0', relief: ['#313626', '#384027', '#3F4128', '#48422B', '#52472E', '#5E4F34', '#7C7462'] },
};
// Heights in metres: the shallows, the coast, then each step of land up to the snowline.
const THRESHOLDS = [-200, 0, 250, 600, 1100, 1800, 2700, 3900];
const RW = 1000; // picture columns (about 3 pixels per point on a phone)
const SS = 2; // supersampling, for smooth band edges and lines
const WEBP_QUALITY = 76;

type Frame = [number, number, number, number];
type Elev = Float32Array;

const tiles = new Map<string, Elev>();
async function tile(z: number, x: number, y: number) {
  const n = 2 ** z;
  x = ((x % n) + n) % n;
  if (y < 0 || y >= n) return;
  const key = `${z}/${x}/${y}`;
  if (tiles.has(key)) return;
  const file = path.join(cacheDir, `${z}-${x}-${y}.png`);
  if (!fs.existsSync(file)) {
    const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`);
    if (!res.ok) throw new Error(`tile ${key}: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const png = PNG.sync.read(fs.readFileSync(file));
  const elev = new Float32Array(256 * 256);
  for (let i = 0; i < 256 * 256; i++) elev[i] = png.data[i * 4] * 256 + png.data[i * 4 + 1] + png.data[i * 4 + 2] / 256 - 32768;
  tiles.set(key, elev);
}

const mercY = (lat: number) => (1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2;

/** Elevation at any point in a frame, from the tiles whose pixels are about as fine as the picture's. */
async function sampler([w, s, e, n]: Frame, cols: number) {
  const degPerCell = (e - w) / cols;
  let z = 1;
  while (360 / (256 * 2 ** z) > degPerCell && z < 10) z++;
  const size = 256 * 2 ** z;
  const x0 = Math.floor(((w + 180) / 360) * 2 ** z);
  const x1 = Math.floor(((e + 180) / 360) * 2 ** z);
  const y0 = Math.floor(mercY(n) * 2 ** z);
  const y1 = Math.floor(mercY(s) * 2 ** z);
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) await tile(z, x, y);
  const px = (gx: number, gy: number) => {
    const tx = Math.floor(gx / 256);
    const ty = Math.floor(gy / 256);
    const t = tiles.get(`${z}/${((tx % 2 ** z) + 2 ** z) % 2 ** z}/${ty}`);
    return t ? t[(gy - ty * 256) * 256 + (gx - tx * 256)] : -4000;
  };
  return {
    z,
    at(lon: number, lat: number) {
      const fx = ((lon + 180) / 360) * size - 0.5;
      const fy = mercY(lat) * size - 0.5;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const ax = fx - ix;
      const ay = fy - iy;
      return px(ix, iy) * (1 - ax) * (1 - ay) + px(ix + 1, iy) * ax * (1 - ay) + px(ix, iy + 1) * (1 - ax) * ay + px(ix + 1, iy + 1) * ax * ay;
    },
  };
}

function grid([w, s, e, n]: Frame, cols: number, rows: number, at: (lon: number, lat: number) => number) {
  const v = new Float64Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const lat = n - ((j + 0.5) / rows) * (n - s);
    for (let i = 0; i < cols; i++) v[j * cols + i] = at(w + ((i + 0.5) / cols) * (e - w), lat);
  }
  return v;
}

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Band 0 is the open sea, 1 the shallows, 2 and up the land steps from the coast to the snowline.
const bandOf = (el: number) => {
  let b = 0;
  while (b < THRESHOLDS.length && el >= THRESHOLDS[b]) b++;
  return b;
};

/** How strongly the hills are lit, from the area's whole frame, so an area's close-ups match its map. */
const exaggeration = ([w, s, e, n]: Frame) => {
  const cosMid = Math.cos((((s + n) / 2) * Math.PI) / 180);
  return Math.max(1.5, ((((e - w) / 520) * 111320 * cosMid) / 1000) * 1.6);
};

/** Smooth value noise, 0 to 1, with blobs about `cell` pixels across. */
function noise(seed: number, cell: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const ease = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const gx = x / cell;
    const gy = y / cell;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const ax = ease(gx - x0);
    const ay = ease(gy - y0);
    const top = hash(x0, y0) * (1 - ax) + hash(x0 + 1, y0) * ax;
    const bottom = hash(x0, y0 + 1) * (1 - ax) + hash(x0 + 1, y0 + 1) * ax;
    return top * (1 - ay) + bottom * ay;
  };
}

/**
 * How opaque each pixel is: solid in the middle, dissolving towards the edges over an uneven margin,
 * so the map fades into the page like an old atlas plate instead of stopping at a frame.
 */
function feather(cols: number, rows: number, seed: number) {
  const big = noise(seed, 150);
  const small = noise(seed + 7, 45);
  const base = Math.min(cols, rows) * 0.11;
  const alpha = new Uint8Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const d = Math.min(i, j, cols - 1 - i, rows - 1 - j);
      const reach = base * (0.45 + 1.1 * big(i, j) + 0.35 * small(i, j));
      const t = Math.min(1, Math.max(0, d / reach));
      alpha[j * cols + i] = Math.round(255 * t * t * (3 - 2 * t));
    }
  return alpha;
}

/**
 * Paints one frame of land at RW columns, in each theme: the bands, hairline contours where the land
 * steps up, the coastline, and a hillshade lit from the northwest at 45°, fading out at the edges.
 * `coastWidth` is the coastline's half-width in picture pixels.
 */
async function paint(frame: Frame, rows: number, zf: number, file: (theme: string) => string, coastWidth: number, seed: number) {
  const [w, s, e, n] = frame;
  const cosMid = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const samp = await sampler(frame, RW);
  const hv = grid(frame, RW, rows, samp.at);
  const g = (i: number, j: number) => hv[Math.min(rows - 1, Math.max(0, j)) * RW + Math.min(RW - 1, Math.max(0, i))];
  const cellX = ((e - w) / RW) * 111320 * cosMid;
  const cellY = ((n - s) / rows) * 111320;
  const az = (315 * Math.PI) / 180;
  const zen = (45 * Math.PI) / 180;
  const flat = Math.cos(zen);
  const lx = Math.sin(zen) * Math.sin(az);
  const ly = Math.sin(zen) * Math.cos(az);
  // Slopes are measured over a few pixels, so the light reads the shape of the land, not pixel noise.
  const span = 2;
  const shade = new Float32Array(RW * rows); // negative darkens, positive lightens
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < RW; i++) {
      if (g(i, j) <= 0) continue;
      const dzdx = ((g(i + span, j) - g(i - span, j)) / (2 * span * cellX)) * zf;
      const dzdn = (-(g(i, j + span) - g(i, j - span)) / (2 * span * cellY)) * zf; // rows run south
      const d = (-dzdx * lx - dzdn * ly + flat) / Math.hypot(dzdx, dzdn, 1) - flat;
      shade[j * RW + i] = (d < 0 ? -Math.min(1, -d * 1.5) * 0.62 : Math.min(1, d * 2.0) * 0.4) * 0.95;
    }

  // Bands on a supersampled grid, interpolated from the elevation, so their edges come out smooth.
  const SW = RW * SS;
  const SH = rows * SS;
  const band = new Uint8Array(SW * SH);
  for (let j = 0; j < SH; j++) {
    const fy = (j + 0.5) / SS - 0.5;
    const y0 = Math.floor(fy);
    const ay = fy - y0;
    for (let i = 0; i < SW; i++) {
      const fx = (i + 0.5) / SS - 0.5;
      const x0 = Math.floor(fx);
      const ax = fx - x0;
      band[j * SW + i] = bandOf(g(x0, y0) * (1 - ax) * (1 - ay) + g(x0 + 1, y0) * ax * (1 - ay) + g(x0, y0 + 1) * (1 - ax) * ay + g(x0 + 1, y0 + 1) * ax * ay);
    }
  }
  const bandAt = (i: number, j: number) => band[Math.min(SH - 1, Math.max(0, j)) * SW + Math.min(SW - 1, Math.max(0, i))];
  // 1: a hairline where two land steps meet (about 0.7 points wide). 2: the coast, when it's painted in.
  const LINE_R = 2;
  const COAST_R = Math.round(coastWidth * SS);
  const lineAt = new Uint8Array(SW * SH);
  for (let j = 0; j < SH; j++)
    for (let i = 0; i < SW; i++) {
      const b = bandAt(i, j);
      let line = 0;
      if (COAST_R) {
        const land = b >= 2;
        for (let dj = -COAST_R; dj <= COAST_R && !line; dj++)
          for (let di = -COAST_R; di <= COAST_R; di++)
            if (di * di + dj * dj <= COAST_R * COAST_R && bandAt(i + di, j + dj) >= 2 !== land) {
              line = 2;
              break;
            }
      }
      if (!line && b >= 3)
        for (let dj = -LINE_R; dj <= LINE_R && !line; dj++)
          for (let di = -LINE_R; di <= LINE_R; di++)
            if (bandAt(i + di, j + dj) < b) {
              line = 1;
              break;
            }
      lineAt[j * SW + i] = line;
    }

  const alpha = feather(RW, rows, seed);
  for (const [theme, c] of Object.entries(THEMES)) {
    const colours = [rgb(c.mist), rgb(c.shelf), ...c.relief.map(rgb)];
    const ink = rgb(c.ink);
    const px = Buffer.alloc(RW * rows * 4);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < RW; i++) {
        const sum = [0, 0, 0];
        for (let sj = 0; sj < SS; sj++)
          for (let si = 0; si < SS; si++) {
            const X = i * SS + si;
            const Y = j * SS + sj;
            const base = colours[bandAt(X, Y)];
            const line = lineAt[Y * SW + X];
            const mix = line === 2 ? 1 : line === 1 ? 0.22 : 0;
            for (let q = 0; q < 3; q++) sum[q] += base[q] + (ink[q] - base[q]) * mix;
          }
        const a = shade[j * RW + i];
        for (let q = 0; q < 3; q++) {
          let v = sum[q] / (SS * SS);
          v = a < 0 ? v * (1 + a) : v + (255 - v) * a;
          px[(j * RW + i) * 4 + q] = Math.round(v);
        }
        px[(j * RW + i) * 4 + 3] = alpha[j * RW + i];
      }
    await sharp(px, { raw: { width: RW, height: rows, channels: 4 } }).webp({ quality: WEBP_QUALITY, alphaQuality: 60, effort: 6 }).toFile(file(theme));
  }
  return samp.z;
}

// The coastline is 1.2 points wide on screen; a picture RW pixels across fills a map about REF_W points wide.
const COAST = (1.2 * RW) / REF_W / 2;
const land: string[] = [];
const closeUps: Record<string, string> = {}; // hike id → picture name, shared when two hikes show the same box
let seed = 1;
for (const [id, map] of Object.entries(WORLD_MAPS)) {
  const frame = map.frame;
  const [w, s, e, n] = frame;
  const cosMid = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const RH = Math.round((RW * (n - s)) / ((e - w) * cosMid));
  const zf = exaggeration(frame);
  const z = await paint(frame, RH, zf, (theme) => path.join(assetDir, `${id}-${theme}.webp`), COAST, seed++);
  land.push(id);
  console.log(id, 'zoom', z, `${RW}x${RH}`);

  // Each hike's close-up: the same painting over a smaller box, at the same picture size, so it's sharper.
  const done = new Map<string, string>();
  for (const hike of Object.keys(map.hikes)) {
    const box = closeUpBox(map, hike) as MapBox;
    const key = [box.x, box.y].map((v) => v.toFixed(4)).join(',');
    if (done.has(key)) {
      closeUps[hike] = done.get(key)!;
      continue;
    }
    const sub: Frame = [w + box.x * (e - w), n - (box.y + box.h) * (n - s), w + (box.x + box.w) * (e - w), n - box.y * (n - s)];
    const cz = await paint(sub, RH, zf, (theme) => path.join(closeDir, `${hike}-${theme}.webp`), COAST, seed++);
    done.set(key, hike);
    closeUps[hike] = hike;
    console.log('  close-up', hike, 'zoom', cz);
  }
}

const req = (file: string) => `require('../../assets/relief/${file}')`;
const entry = (key: string, file: string) => `  '${key}': { light: ${req(`${file}-light.webp`)}, dark: ${req(`${file}-dark.webp`)} },`;
fs.writeFileSync(
  outTs,
  `// Generated by scripts/build-relief.mts from AWS Terrain Tiles (terrarium; sources include SRTM, GMTED2010
// and ETOPO1). Do not edit by hand: run \`pnpm build:relief\` instead.

/** Each journey area's picture of the land, in each theme: its whole frame, with edges that fade into the page. */
export const LAND: Record<string, { light: number; dark: number }> = {
${land.map((id) => entry(id, id)).join('\n')}
};

/** Each hike's close-up picture of the land, in each theme: the part of the map closeUpBox gives. */
export const CLOSE_UPS: Record<string, { light: number; dark: number }> = {
${Object.entries(closeUps).map(([hike, file]) => entry(hike, `close/${file}`)).join('\n')}
};
`,
);
console.log('wrote', path.relative(root, outTs));

// The recipe photo's soft bottom edge (the 'fade' hero on the recipe page): white, clear at the top and
// solid at the bottom over an uneven line, so the app can tint it to the page's colour.
{
  const FW = 1000;
  const FH = 420;
  const big = noise(91, 170);
  const small = noise(97, 50);
  const px = Buffer.alloc(FW * FH * 4, 255);
  for (let j = 0; j < FH; j++)
    for (let i = 0; i < FW; i++) {
      // Where the edge sits wanders up and down across the photo; below it, solid page.
      const edge = FH * (0.42 + 0.28 * big(i, j * 0.4) + 0.1 * small(i, j));
      const t = Math.min(1, Math.max(0, (j - (edge - FH * 0.38)) / (FH * 0.38)));
      px[(j * FW + i) * 4 + 3] = j >= FH - 2 ? 255 : Math.round(255 * t * t * (3 - 2 * t));
    }
  await sharp(px, { raw: { width: FW, height: FH, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(root, 'assets/hero-fade.png'));
  console.log('wrote assets/hero-fade.png');
}
