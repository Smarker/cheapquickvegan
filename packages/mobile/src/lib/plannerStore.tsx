import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Plan } from './planner';

// The weekly plan, kept on the phone. All the logic lives in planner.ts; this only stores it.

const KEY = 'cqv:planner:v1';

type Store = { plan: Plan; setPlan: (change: (p: Plan) => Plan) => void };
const Ctx = createContext<Store | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<Plan>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setPlanState(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(plan)).catch(() => {});
  }, [plan, loaded]);

  const value = useMemo<Store>(() => ({ plan, setPlan: (change) => setPlanState(change) }), [plan]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlanner(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePlanner must be used inside PlannerProvider');
  return v;
}
