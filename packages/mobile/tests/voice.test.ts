import { describe, expect, it } from 'vitest';
import { findIngredient, parseCommand } from '../src/lib/voice';

describe('parseCommand', () => {
  it.each([
    ['next', 'next'],
    ['Okay, next step', 'next'],
    ['go back', 'back'],
    ['previous step', 'back'],
    ['repeat that', 'repeat'],
    ['what was that?', 'repeat'],
    ["I'm done", 'finish'],
    ['stop listening', 'stopListening'],
    ['what do I need', 'ingredients'],
    ['stop the timer', 'stopTimer'],
    ['cancel timer', 'stopTimer'],
    ['how much time is left', 'timeLeft'],
  ])('%s → %s', (said, type) => {
    expect(parseCommand(said)?.type).toBe(type);
  });

  it('starts timers with spoken or written durations', () => {
    expect(parseCommand('set a timer for 10 minutes')).toEqual({ type: 'startTimer', minutes: 10 });
    expect(parseCommand('start a timer for five minutes')).toEqual({ type: 'startTimer', minutes: 5 });
    expect(parseCommand('timer for half an hour')).toEqual({ type: 'startTimer', minutes: 30 });
    expect(parseCommand('start the timer')).toEqual({ type: 'startTimer', minutes: null });
  });

  it('asks for amounts', () => {
    expect(parseCommand('how much garlic')).toEqual({ type: 'amount', item: 'garlic' });
    expect(parseCommand('How many cups of coconut milk do I need?')).toEqual({ type: 'amount', item: 'cups of coconut milk' });
    expect(parseCommand('how much of the soy sauce')).toEqual({ type: 'amount', item: 'soy sauce' });
  });

  it('ignores chatter', () => {
    expect(parseCommand('this smells amazing')).toBe(null);
    expect(parseCommand('')).toBe(null);
  });
});

describe('findIngredient', () => {
  const lines = ['3 cloves garlic, minced', '1 can full-fat coconut milk', '2 tbsp coconut oil', '½ cup soy sauce'];
  it('finds the line that best matches', () => {
    expect(findIngredient('garlic', lines)).toBe('3 cloves garlic, minced');
    expect(findIngredient('cups of coconut milk', lines)).toBe('1 can full-fat coconut milk');
    expect(findIngredient('coconut oil', lines)).toBe('2 tbsp coconut oil');
    expect(findIngredient('saffron', lines)).toBe(null);
  });
});
