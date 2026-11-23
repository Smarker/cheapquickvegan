import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Units } from './units';

const KEY = 'cqv:units:v1';
type UnitsPref = { units: Units | null; setUnits: (u: Units) => void };
const Ctx = createContext<UnitsPref>({ units: null, setUnits: () => {} });

/** Cups & spoons or grams, remembered on the phone. Null until the cook picks, which means "as written". */
export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<Units | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => (v === 'grams' || v === 'volume') && setUnitsState(v))
      .catch(() => {});
  }, []);
  const value = useMemo<UnitsPref>(
    () => ({
      units,
      setUnits: (u) => {
        setUnitsState(u);
        AsyncStorage.setItem(KEY, u).catch(() => {});
      },
    }),
    [units],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUnits = () => useContext(Ctx);
