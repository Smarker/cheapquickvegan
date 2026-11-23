// Turns what a cook says into a cook-mode action. Pure and small on purpose: a handful of
// phrases people actually say with their hands full, matched loosely.

export type VoiceCommand =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'repeat' }
  | { type: 'startTimer'; minutes: number | null }
  | { type: 'stopTimer' }
  | { type: 'timeLeft' }
  | { type: 'amount'; item: string }
  | { type: 'ingredients' }
  | { type: 'finish' }
  | { type: 'stopListening' };

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, 'twenty five': 25, thirty: 30, forty: 40, 'forty five': 45, sixty: 60,
};

function minutesIn(text: string): number | null {
  if (/\bhalf (an|a) hour\b/.test(text)) return 30;
  const unit = '(minutes?|mins?|hours?|hrs?|seconds?|secs?)';
  const digits = text.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`));
  const words = text.match(new RegExp(`\\b(${Object.keys(NUMBER_WORDS).sort((a, b) => b.length - a.length).join('|')})\\s+${unit}`));
  const m = digits ?? words;
  if (!m) return null;
  const n = digits ? parseFloat(m[1]) : NUMBER_WORDS[m[1]];
  const u = m[2];
  return u.startsWith('h') ? n * 60 : u.startsWith('s') ? n / 60 : n;
}

export function parseCommand(raw: string): VoiceCommand | null {
  const text = raw.toLowerCase().replace(/[^a-z0-9.\s']/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;

  if (/\b(stop|cancel|turn off|end|kill)\b.*\btimer\b|\btimer\b.*\b(off|stop|cancel)\b/.test(text)) return { type: 'stopTimer' };
  if (/\b(start|set|begin)\b.*\btimer\b|\btimer\b.*\b(for|of)\b|^timer\b/.test(text)) return { type: 'startTimer', minutes: minutesIn(text) };
  if (/\bhow (much|long) (time )?(is )?(left|remaining)\b|\btime left\b|\bhow long left\b/.test(text)) return { type: 'timeLeft' };

  const amount = text.match(/\bhow (much|many)\s+(?:of\s+)?(?:the\s+)?(.+?)(?:\s+do i (need|use|add))?\s*$/);
  if (amount && !/\b(time|left)\b/.test(amount[2])) return { type: 'amount', item: amount[2].replace(/^(a|an|the)\s+/, '').trim() };

  if (/\bwhat (do|else do) i need\b|\b(list|read) (the )?ingredients\b|^ingredients$/.test(text)) return { type: 'ingredients' };
  if (/\b(stop|quit) listening\b|\bhands[- ]free off\b|\bmute\b/.test(text)) return { type: 'stopListening' };
  if (/\b(i'?m done|i am done|all done|finished|finish)\b/.test(text)) return { type: 'finish' };
  if (/\b(go back|back|previous|last step|before)\b/.test(text)) return { type: 'back' };
  if (/\b(repeat|again|read (it|that|this)|what was that|say that|come again|pardon)\b/.test(text)) return { type: 'repeat' };
  if (/\b(next|continue|go on|keep going|done with this|okay next|ok next|forward)\b/.test(text)) return { type: 'next' };
  return null;
}

const stem = (w: string) => w.replace(/(oes|es|s)$/, (m) => (m === 'oes' ? 'o' : ''));

/** The ingredient line a cook is asking about, e.g. "garlic" → "3 cloves garlic, minced". */
export function findIngredient(item: string, lines: string[]): string | null {
  const words = item.split(/\s+/).map(stem).filter((w) => w.length > 2);
  if (!words.length) return null;
  const scored = lines
    .map((line) => ({ line, hits: words.filter((w) => line.toLowerCase().includes(w)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.line.length - b.line.length);
  return scored[0]?.line ?? null;
}
