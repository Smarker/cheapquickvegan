// One-time hints: each is shown until the cook dismisses it or uses the thing it explains, then never again.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'cqv:hints:v1';
const seen = new Set<string>();
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (raw) (JSON.parse(raw) as string[]).forEach((id) => seen.add(id));
  })
  .catch(() => {})
  .finally(() => {
    loaded = true;
    emit();
  });

export function dismissHint(id: string) {
  if (seen.has(id)) return;
  seen.add(id);
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify([...seen])).catch(() => {});
}

/** Whether a hint should show. False until saved dismissals have loaded, so a dismissed hint never flashes. */
export function useHint(id: string): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => loaded && !seen.has(id),
  );
}
