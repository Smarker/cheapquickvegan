import { describe, expect, it } from 'vitest';
import { collectionsWith, createCollection, deleteCollection, removeEverywhere, renameCollection, restoreCollection, toggleInCollection } from '../src/lib/collections';

describe('collections', () => {
  it('creates named collections, refusing blanks and duplicate names', () => {
    let list = createCollection([], ' Weeknights ', 'a', 'curry');
    list = createCollection(list, 'weeknights', 'b');
    list = createCollection(list, '   ', 'c');
    expect(list).toEqual([{ id: 'a', name: 'Weeknights', slugs: ['curry'] }]);
  });

  it('lets one recipe sit in several collections', () => {
    let list = createCollection(createCollection([], 'Weeknights', 'a'), 'For guests', 'b');
    list = toggleInCollection(toggleInCollection(list, 'a', 'curry'), 'b', 'curry');
    expect(collectionsWith(list, 'curry').map((c) => c.name)).toEqual(['Weeknights', 'For guests']);
    expect(collectionsWith(toggleInCollection(list, 'a', 'curry'), 'curry').map((c) => c.name)).toEqual(['For guests']);
  });

  it('renames, deletes, and empties a recipe out everywhere when unsaved', () => {
    let list = createCollection(createCollection([], 'A', 'a', 'x'), 'B', 'b', 'x');
    expect(renameCollection(list, 'a', 'B')).toBe(list); // name taken
    list = renameCollection(list, 'a', 'Soups');
    expect(list[0].name).toBe('Soups');
    expect(removeEverywhere(list, 'x').every((c) => c.slugs.length === 0)).toBe(true);
    expect(deleteCollection(list, 'a').map((c) => c.id)).toEqual(['b']);
  });

  it('puts a deleted collection back in its place, once', () => {
    const list = createCollection(createCollection(createCollection([], 'A', 'a'), 'B', 'b'), 'C', 'c');
    const gone = deleteCollection(list, 'b');
    const back = restoreCollection(gone, list[1], 1);
    expect(back).toEqual(list);
    expect(restoreCollection(back, list[1], 1)).toBe(back);
  });
});
