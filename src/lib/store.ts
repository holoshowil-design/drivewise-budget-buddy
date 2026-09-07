import { useEffect, useState, useCallback } from "react";

export type EnergyType = "petrol95" | "petrol98" | "diesel" | "electric";
export type VehicleType = "petrol" | "hybrid" | "electric";

export type Income = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM — when the record was created
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
  time?: string; // HH:MM
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

export type FuelPriceEntry = {
  date: string; // YYYY-MM-DD — effective from this date onward
  time?: string; // HH:MM — effective from this exact hour onward
  price: number; // ₪ per liter or per kWh
  consumption: number; // km per liter or km per kWh
};


export type Settings = {
  dailyGoal: number;
  fixedMonthlyExpenses: number;
  workDaysPerMonth: number;
  defaultCommissionPct: number;
  currency: string;
  fuelPrice: number; // ₪ per liter (or per kWh for electric)
  fuelPriceUpdatedAt?: string; // ISO date of last online price sync
  fuelPriceHistory?: FuelPriceEntry[]; // historical price+consumption changes
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
    fuelPriceHistory: [],
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
    const id = crypto.randomUUID();
    update((d) => ({ ...d, incomes: [...d.incomes, { time: nowHHMM(), ...i, id }] }));
    return id;
  }, [update]);

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    const id = crypto.randomUUID();
    update((d) => ({ ...d, expenses: [...d.expenses, { time: nowHHMM(), ...e, id }] }));
    return id;
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

  /**
   * Records a fuel price and/or consumption change into the history stamped
   * with the current date AND hour, so future calculations use the new values
   * while records entered earlier today keep the values effective at the time.
   */
  const recordFuelPriceChange = useCallback((price: number, consumption: number) => {
    const date = todayISO();
    const time = nowHHMM();
    update((d) => {
      const history = [...(d.settings.fuelPriceHistory || [])];
      const existingIdx = history.findIndex((h) => h.date === date && (h.time ?? "00:00") === time);
      const entry: FuelPriceEntry = { date, time, price, consumption };
      if (existingIdx >= 0) history[existingIdx] = entry;
      else history.push(entry);
      return {
        ...d,
        settings: {
          ...d.settings,
          fuelPrice: price,
          fuelPriceHistory: history,
        },
        vehicle: { ...d.vehicle, consumption },
      };
    });
  }, [update]);


  return { data, ready, addIncome, addExpense, removeIncome, removeExpense, updateIncome, updateExpense, updateSettings, updateVehicle, recordFuelPriceChange, update };
}

// ---------- computations ----------
export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}

/** Current local time as "HH:MM" — used to stamp records and price changes. */
export function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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

/** Currency formatting that stays readable inside RTL text: "1,234 ₪" / "-320 ₪". */
export function fmt(n: number, currency = "₪") {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString("he-IL", { maximumFractionDigits: 0 });
  return `${rounded < 0 ? "-" : ""}${abs} ${currency}`;
}

/** Short human date, e.g. "6 באוג׳". */
export function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
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

/**
 * Returns the fuel price and consumption that were effective on a given date.
 * Uses fuelPriceHistory (sorted by date) to find the entry active on that date;
 * falls back to current settings/vehicle values if no history exists.
 */
export function effectiveFuelParams(date: string, vehicle: Vehicle, settings: Settings) {
  const history = settings.fuelPriceHistory;
  if (history && history.length > 0) {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    let entry: FuelPriceEntry | null = null;
    for (const h of sorted) {
      if (h.date <= date) entry = h;
      else break;
    }
    if (entry) {
      return { price: entry.price, consumption: entry.consumption };
    }
  }
  return { price: settings.fuelPrice, consumption: vehicle.consumption };
}

/** Estimated energy cost for a given distance, based on vehicle consumption and fuel price. */
export function estimateEnergyCost(km: number, vehicle: Vehicle, settings: Settings) {
  const cons = vehicle.consumption > 0 ? vehicle.consumption : 1;
  const units = km / cons; // liters or kWh
  const price = settings.fuelPrice || 0;
  return { units, cost: units * price, costPerKm: price / cons };
}

/**
 * Date-aware energy cost: sums per-income using the price & consumption that
 * were effective on each income's own date, so price changes don't apply
 * retroactively to older records.
 */
export function estimateEnergyCostByDate(incomes: Income[], vehicle: Vehicle, settings: Settings) {
  let totalCost = 0;
  let totalUnits = 0;
  let totalKm = 0;
  for (const i of incomes) {
    const km = i.km || 0;
    if (km === 0) continue;
    const { price, consumption } = effectiveFuelParams(i.date, vehicle, settings);
    const cons = consumption > 0 ? consumption : 1;
    const units = km / cons;
    totalKm += km;
    totalUnits += units;
    totalCost += units * price;
  }
  const currentCons = vehicle.consumption > 0 ? vehicle.consumption : 1;
  const costPerKm = settings.fuelPrice / currentCons;
  return { units: totalUnits, cost: totalCost, costPerKm, km: totalKm };
}

export function energyUnitLabel(v: Vehicle) {
  return v.type === "electric" ? "kWh" : "ליטר";
}

/**
 * Fuel cost that should be charged for a period.
 * Fuel is treated as a certain cost: we take the higher of the actual refuels
 * logged and the estimated energy cost derived from the km driven,
 * so it is never counted twice and never ignored.
 * Uses date-aware estimation so price changes don't apply retroactively.
 */
export function fuelCostFor(incomes: Income[], expenses: Expense[], vehicle: Vehicle, settings: Settings) {
  const estimated = estimateEnergyCostByDate(incomes, vehicle, settings).cost;
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


export function sumHours(list: Income[]) {
  return list.reduce((s, i) => s + (i.hours || 0), 0);
}
