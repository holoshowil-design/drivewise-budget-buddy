import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { useAppData, type AppData, type Expense, type Income, type Trip } from "@/lib/store";

/** Shared builders for money/sync tests. Fuel: 12 km/l at 7 ₪/l → 120 km = 70 ₪. */
export const vehicle: AppData["vehicle"] = {
  make: "",
  model: "",
  year: "",
  plate: "",
  type: "petrol",
  consumption: 12,
};

export const settings = (patch: Partial<AppData["settings"]> = {}): AppData["settings"] => ({
  dailyGoal: 500,
  fixedMonthlyExpenses: 0,
  workDaysPerMonth: 22,
  defaultCommissionPct: 0,
  currency: "₪",
  fuelPrice: 7,
  fuelPriceHistory: [],
  ...patch,
});

export const income = (patch: Partial<Income> = {}): Income => ({
  id: crypto.randomUUID(),
  date: "2026-10-01",
  time: "09:00",
  amount: 100,
  platform: "פרטי",
  commissionPct: 0,
  tip: 0,
  hours: 1,
  km: 0,
  ...patch,
});

export const expense = (patch: Partial<Expense> = {}): Expense => ({
  id: crypto.randomUUID(),
  date: "2026-10-01",
  time: "09:00",
  category: "fuel",
  amount: 100,
  ...patch,
});

export const trip = (patch: Partial<Trip> = {}): Trip => ({
  id: crypto.randomUUID(),
  date: "2026-10-01",
  time: "09:00",
  km: 0,
  seconds: 600,
  ...patch,
});

export const appData = (patch: Partial<AppData> = {}): AppData => ({
  incomes: [],
  expenses: [],
  trips: [],
  vehicle,
  settings: settings(),
  ...patch,
});

/**
 * Minimal browser stand-in so `useAppData` mutations (which read/write
 * localStorage and dispatch a window event) can run inside vitest's node env.
 */
export function installBrowser(initial?: AppData) {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  const win = Object.assign(new EventTarget(), { localStorage });
  Object.assign(globalThis, { window: win, localStorage });
  if (initial) localStorage.setItem("driver-app-v1", JSON.stringify(initial));
  return () => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).localStorage;
  };
}

/** Grabs the `useAppData` API (its callbacks) without a DOM renderer. */
export function appDataApi() {
  let api: ReturnType<typeof useAppData> | undefined;
  const Probe = () => {
    api = useAppData();
    return null;
  };
  renderToString(createElement(Probe));
  return api!;
}

/** Records that are still visible (not soft-deleted). Stage 1 introduces `deletedAt`. */
export const visible = <T extends object>(list: T[]) =>
  list.filter((x) => !(x as { deletedAt?: unknown }).deletedAt);
