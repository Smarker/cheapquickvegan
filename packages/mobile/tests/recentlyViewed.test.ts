import { describe, expect, it } from 'vitest';
import { withViewed } from '../src/lib/recentlyViewed';

describe('withViewed', () => {
  it('puts the latest first without repeats, keeping ten', () => {
    expect(withViewed(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
    const many = Array.from({ length: 10 }, (_, i) => `r${i}`);
    expect(withViewed(many, 'new')).toHaveLength(10);
    expect(withViewed(many, 'new')[0]).toBe('new');
  });
});
