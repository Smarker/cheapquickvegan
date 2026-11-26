export type StepTimer = { minutes: number; label: string };

// "25 minutes", "15-20 min", "1 hr", "1 1/2 hours", "5 min on each side", "30 seconds"
const RE = /(\d+(?:\s+1\/2|\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/gi;

const toNumber = (s: string) => (s.includes('1/2') ? parseFloat(s) + 0.5 : parseFloat(s));

/**
 * Times mentioned in a step, as timers you can start. For a range we use the
 * low end, so you check early instead of burning it; the label keeps the range.
 */
export function timersIn(text: string): StepTimer[] {
  const out: StepTimer[] = [];
  // "3 minutes and 30 seconds" is one timer, not two.
  const combo = /(\d+)\s*(?:minutes?|mins?)\s*(?:and\s*)?(\d+)\s*(?:seconds?|secs?)\b/gi;
  for (const m of text.matchAll(combo)) {
    out.push({ minutes: Number(m[1]) + Number(m[2]) / 60, label: `${m[1]} min ${m[2]} sec` });
  }
  text = text.replace(combo, ' ');
  for (const m of text.matchAll(RE)) {
    const unit = m[3].toLowerCase();
    const factor = unit.startsWith('h') ? 60 : unit.startsWith('s') ? 1 / 60 : 1;
    const minutes = toNumber(m[1]) * factor;
    if (minutes <= 0 || minutes > 12 * 60) continue;
    const short = unit.startsWith('h') ? 'hr' : unit.startsWith('s') ? 'sec' : 'min';
    const label = m[2] ? `${m[1]}–${m[2]} ${short}` : `${m[1]} ${short}`;
    if (!out.some((t) => t.label === label)) out.push({ minutes, label });
  }
  return out;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}
