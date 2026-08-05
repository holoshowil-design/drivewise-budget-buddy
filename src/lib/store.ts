import { useEffect, useState, useCallback } from "react";

export type EnergyType = "petrol95" | "petrol98" | "diesel" | "electric";
export type VehicleType = "petrol" | "hybrid" | "electric";

export type Income = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // gross
  platform: string;
  commissionPct: number;
  tip: number;
  hours: number;
  km: number;
  note?: string;
};

export type ExpenseCategory =
  | "fuel"
  | "insurance"
  | "license"
  | "maintenance"
  | "parking"
  | "food"
  | "wash"
  | "other";

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  // fuel-specific
  energyType?: EnergyType;
  quantity?: number; // liters or kWh
  pricePerUnit?: number;
  odometer?: number;
};

export type Vehicle = {
  make: string;
  model: string;
  year: string;
  plate: string;
  type: VehicleType;
  consumption: number; // km per liter or km per kWh
};

export type Settings = {
  dailyGoal: number;
  fixedMonthlyExpenses: number;
  workDaysPerMonth: number;
  defaultCommissionPct: number;
  currency: string;
  fuelPrice: number; // ₪ per liter (or per kWh for electric)
};

export type AppData = {
  incomes: Income[];
  expenses: Expense[];
  vehicle: Vehicle;
  settings: Settings;
};

const KEY = "driver-app-v1";

const defaultData: AppData = {
  incomes: [],
  expenses: [],
  vehicle: {
    make: "",
    model: "",
    year: "",
    plate: "",
    type: "petrol",
    consumption: 12,
  },
  settings: {
    dailyGoal: 500,
    fixedMonthlyExpenses: 3000,
    workDaysPerMonth: 22,
    defaultCommissionPct: 25,
    currency: "₪",
    fuelPrice: 7.4,
  },
};

export function load(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed, settings: { ...defaultData.settings, ...parsed.settings }, vehicle: { ...defaultData.vehicle, ...parsed.vehicle } };
  } catch {
    return defaultData;
  }
}

// ---------- cloud sync ----------
let currentUserId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

export function setSyncUser(id: string | null) {
  currentUserId = id;
}

export function getSyncUser() {
  return currentUserId;
}

function scheduleCloudPush(data: AppData) {
  if (!currentUserId) return;
  const uid = currentUserId;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    import("./cloud").then(({ pushCloudData }) => pushCloudData(uid, data).catch(() => {}));
  }, 600);
}

export function save(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("driver-data-changed"));
  scheduleCloudPush(data);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
    const handler = () => setData(load());
    window.addEventListener("driver-data-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("driver-data-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    const next = updater(load());
    save(next);
    setData(next);
  }, []);

  const addIncome = useCallback((i: Omit<Income, "id">) => {
    update((d) => ({ ...d, incomes: [...d.incomes, { ...i, id: crypto.randomUUID() }] }));
  }, [update]);

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    update((d) => ({ ...d, expenses: [...d.expenses, { ...e, id: crypto.randomUUID() }] }));
  }, [update]);

  const removeIncome = useCallback((id: string) => {
    update((d) => ({ ...d, incomes: d.incomes.filter((x) => x.id !== id) }));
  }, [update]);

  const removeExpense = useCallback((id: string) => {
    update((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) }));
  }, [update]);

  const updateIncome = useCallback((id: string, patch: Partial<Omit<Income, "id">>) => {
    update((d) => ({ ...d, incomes: d.incomes.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [update]);

  const updateExpense = useCallback((id: string, patch: Partial<Omit<Expense, "id">>) => {
    update((d) => ({ ...d, expenses: d.expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [update]);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    update((d) => ({ ...d, settings: { ...d.settings, ...s } }));
  }, [update]);

  const updateVehicle = useCallback((v: Partial<Vehicle>) => {
    update((d) => ({ ...d, vehicle: { ...d.vehicle, ...v } }));
  }, [update]);

  return { data, ready, addIncome, addExpense, removeIncome, removeExpense, updateIncome, updateExpense, updateSettings, updateVehicle, update };
}

// ---------- computations ----------
export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}

export function netFromIncome(i: Income) {
  return i.amount * (1 - i.commissionPct / 100) + (i.tip || 0);
}

export function sumIncomes(list: Income[]) {
  return list.reduce((s, i) => s + netFromIncome(i), 0);
}

export function sumExpenses(list: Expense[]) {
  return list.reduce((s, e) => s + e.amount, 0);
}

export function filterByRange<T extends { date: string }>(list: T[], from: string, to: string) {
  return list.filter((x) => x.date >= from && x.date <= to);
}

export function filterByDate<T extends { date: string }>(list: T[], date: string) {
  return list.filter((x) => x.date === date);
}

export function categoryLabel(c: ExpenseCategory): string {
  const m: Record<ExpenseCategory, string> = {
    fuel: "דלק / חשמל",
    insurance: "ביטוח",
    license: "רישוי",
    maintenance: "טיפול ותחזוקה",
    parking: "חניה",
    food: "אוכל ושתייה",
    wash: "שטיפה",
    other: "אחר",
  };
  return m[c];
}

export function energyLabel(e: EnergyType): string {
  const m: Record<EnergyType, string> = {
    petrol95: "בנזין 95",
    petrol98: "בנזין 98",
    diesel: "סולר",
    electric: "חשמל (kWh)",
  };
  return m[e];
}

export function fmt(n: number, currency = "₪") {
  return `${currency}${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

export function monthRange(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  const iso = (d: Date) => {
    const tz = d.getTimezoneOffset();
    return new Date(d.getTime() - tz * 60000).toISOString().slice(0, 10);
  };
  return { from: iso(from), to: iso(to) };
}

// ---------- km & energy estimation ----------
export function sumKm(list: Income[]) {
  return list.reduce((s, i) => s + (i.km || 0), 0);
}

/** Estimated energy cost for a given distance, based on vehicle consumption and fuel price. */
export function estimateEnergyCost(km: number, vehicle: Vehicle, settings: Settings) {
  const cons = vehicle.consumption > 0 ? vehicle.consumption : 1;
  const units = km / cons; // liters or kWh
  const price = settings.fuelPrice || 0;
  return { units, cost: units * price, costPerKm: price / cons };
}

export function energyUnitLabel(v: Vehicle) {
  return v.type === "electric" ? "kWh" : "ליטר";
}

/**
 * Fuel cost that should be charged for a period.
 * Fuel is treated as a certain cost: we take the higher of the actual refuels
 * logged and the estimated energy cost derived from the km driven,
 * so it is never counted twice and never ignored.
 */
export function fuelCostFor(incomes: Income[], expenses: Expense[], vehicle: Vehicle, settings: Settings) {
  const estimated = estimateEnergyCost(sumKm(incomes), vehicle, settings).cost;
  const actual = expenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
  return { estimated, actual, charged: Math.max(estimated, actual) };
}

/** Total costs for a period: non-fuel expenses + certain fuel cost. */
export function totalCosts(incomes: Income[], expenses: Expense[], vehicle: Vehicle, settings: Settings) {
  const nonFuel = expenses.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
  return nonFuel + fuelCostFor(incomes, expenses, vehicle, settings).charged;
}

/** Net profit: income after commission/tips, minus expenses including certain fuel cost. */
export function netProfit(incomes: Income[], expenses: Expense[], vehicle: Vehicle, settings: Settings) {
  return sumIncomes(incomes) - totalCosts(incomes, expenses, vehicle, settings);
}

