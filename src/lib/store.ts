import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { normalizeMeta, stampChanges, type SyncMeta } from "./sync-meta";

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
  /** Linked GPS trip — its km are already counted by the trip itself. */
  tripId?: string;
  updatedAt?: string; // ISO — last local change, used by sync
};

export type ExpenseCategory =
  "fuel" | "insurance" | "license" | "maintenance" | "parking" | "food" | "wash" | "other";

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
  updatedAt?: string; // ISO — last local change, used by sync
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
  autoDetectTrip?: boolean; // prompt automatically when driving is detected
  askWaiting?: boolean; // ask after a few standing minutes whether it's a wait
};

/** A tracked work trip recorded by the live GPS tracker. */
export type Trip = {
  id: string;
  date: string; // YYYY-MM-DD (start date)
  time?: string; // HH:MM start time
  km: number;
  seconds: number;
  endedAt?: string; // ISO timestamp
  waitSeconds?: number; // standing/waiting time inside the trip
  incomeId?: string; // linked income record created from the end-of-trip form
  note?: string;
  updatedAt?: string; // ISO — last local change, used by sync
};

export type AppData = {
  incomes: Income[];
  expenses: Expense[];
  trips: Trip[];
  vehicle: Vehicle;
  settings: Settings;
  /** Sync bookkeeping (tombstones, change stamps). Optional for older data. */
  meta?: SyncMeta;
};

const KEY = "driver-app-v1";

const defaultData: AppData = {
  incomes: [],
  expenses: [],
  trips: [],
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
    defaultCommissionPct: 12,
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
    return normalizeMeta({
      ...defaultData,
      ...parsed,
      trips: Array.isArray(parsed.trips) ? parsed.trips : [],
      settings: { ...defaultData.settings, ...parsed.settings },
      vehicle: { ...defaultData.vehicle, ...parsed.vehicle },
    });
  } catch {
    return defaultData;
  }
}

// ---------- local persistence ----------
let storageWarned = false;
const PRE_SYNC_BACKUP_KEY = "driver-app-v1-pre-sync-backup";

/**
 * Safety net for the sync-metadata upgrade: before the first save in the new
 * format, keep the untouched old blob under a separate key (once).
 */
function keepPreSyncCopy() {
  if (localStorage.getItem(PRE_SYNC_BACKUP_KEY)) return;
  const raw = localStorage.getItem(KEY);
  if (raw && !raw.includes('"meta"')) localStorage.setItem(PRE_SYNC_BACKUP_KEY, raw);
}

/**
 * Writes the data locally and notifies listeners. `fromCloud` skips the cloud
 * push for data that just came from a sync.
 */
export function save(data: AppData, opts: { fromCloud?: boolean } = {}) {
  if (typeof window === "undefined") return;
  try {
    keepPreSyncCopy();
    localStorage.setItem(KEY, JSON.stringify(data));
    storageWarned = false;
  } catch {
    if (!storageWarned) {
      storageWarned = true;
      toast.error("השמירה במכשיר נכשלה (האחסון מלא?). הנתונים יישמרו בענן אם אתה מחובר.", {
        duration: 10000,
      });
    }
  }
  window.dispatchEvent(new Event("driver-data-changed"));
  if (!opts.fromCloud) window.dispatchEvent(new CustomEvent("driver-data-local-change"));
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
    const prev = load();
    const next = stampChanges(prev, updater(prev));
    save(next);
    setData(next);
  }, []);

  const addIncome = useCallback(
    (i: Omit<Income, "id">) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, incomes: [...d.incomes, { time: nowHHMM(), ...i, id }] }));
      return id;
    },
    [update],
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id">) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, expenses: [...d.expenses, { time: nowHHMM(), ...e, id }] }));
      return id;
    },
    [update],
  );

  const addTrip = useCallback(
    (t: Omit<Trip, "id">) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, trips: [...(d.trips || []), { ...t, id }] }));
      return id;
    },
    [update],
  );

  const removeTrip = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        trips: (d.trips || []).filter((x) => x.id !== id),
        incomes: d.incomes.filter((x) => x.tripId !== id),
      }));
    },
    [update],
  );

  const updateTrip = useCallback(
    (id: string, patch: Partial<Omit<Trip, "id">>) => {
      update((d) => ({
        ...d,
        trips: (d.trips || []).map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
    },
    [update],
  );

  /**
   * Saves a finished trip together with an optional linked income record.
   * The income keeps `km: 0` so the driven distance is counted once only
   * (through the trip itself) in the existing fuel-cost calculations.
   */
  const saveTripWithIncome = useCallback(
    (trip: Omit<Trip, "id">, income?: Omit<Income, "id" | "km" | "tripId"> | null) => {
      const tripId = crypto.randomUUID();
      const incomeId = income ? crypto.randomUUID() : undefined;
      update((d) => ({
        ...d,
        trips: [...(d.trips || []), { ...trip, id: tripId, incomeId }],
        incomes: income
          ? [...d.incomes, { ...income, km: 0, tripId, id: incomeId as string }]
          : d.incomes,
      }));
      return tripId;
    },
    [update],
  );

  /** Updates a trip and its linked income together (edit flow). */
  const updateTripWithIncome = useCallback(
    (
      id: string,
      patch: Partial<Omit<Trip, "id">>,
      income?: Omit<Income, "id" | "km" | "tripId"> | null,
    ) => {
      update((d) => {
        const trip = (d.trips || []).find((t) => t.id === id);
        let incomes = d.incomes;
        let incomeId = trip?.incomeId;
        if (income) {
          if (incomeId && incomes.some((x) => x.id === incomeId)) {
            incomes = incomes.map((x) =>
              x.id === incomeId ? { ...x, ...income, km: 0, tripId: id } : x,
            );
          } else {
            incomeId = crypto.randomUUID();
            incomes = [...incomes, { ...income, km: 0, tripId: id, id: incomeId }];
          }
        } else if (incomeId) {
          incomes = incomes.filter((x) => x.id !== incomeId);
          incomeId = undefined;
        }
        return {
          ...d,
          incomes,
          trips: (d.trips || []).map((t) => (t.id === id ? { ...t, ...patch, incomeId } : t)),
        };
      });
    },
    [update],
  );

  /** Puts deleted records back (undo). Same ids, so the deletion is undone everywhere. */
  const restoreRecords = useCallback(
    (r: { incomes?: Income[]; expenses?: Expense[]; trips?: Trip[] }) => {
      const add = <T extends { id: string }>(list: T[], back: T[] = []) => {
        const ids = new Set(list.map((x) => x.id));
        return [...list, ...back.filter((x) => !ids.has(x.id))];
      };
      update((d) => ({
        ...d,
        incomes: add(d.incomes, r.incomes),
        expenses: add(d.expenses, r.expenses),
        trips: add(d.trips || [], r.trips),
      }));
    },
    [update],
  );

  const removeIncome = useCallback(
    (id: string) => {
      update((d) => ({ ...d, incomes: d.incomes.filter((x) => x.id !== id) }));
    },
    [update],
  );

  const removeExpense = useCallback(
    (id: string) => {
      update((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) }));
    },
    [update],
  );

  const updateIncome = useCallback(
    (id: string, patch: Partial<Omit<Income, "id">>) => {
      update((d) => ({
        ...d,
        incomes: d.incomes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
    },
    [update],
  );

  const updateExpense = useCallback(
    (id: string, patch: Partial<Omit<Expense, "id">>) => {
      update((d) => ({
        ...d,
        expenses: d.expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
    },
    [update],
  );

  const updateSettings = useCallback(
    (s: Partial<Settings>) => {
      update((d) => ({ ...d, settings: { ...d.settings, ...s } }));
    },
    [update],
  );

  const updateVehicle = useCallback(
    (v: Partial<Vehicle>) => {
      update((d) => ({ ...d, vehicle: { ...d.vehicle, ...v } }));
    },
    [update],
  );

  /**
   * Records a fuel price and/or consumption change into the history stamped
   * with the current date AND hour, so future calculations use the new values
   * while records entered earlier today keep the values effective at the time.
   */
  const recordFuelPriceChange = useCallback(
    (price: number, consumption: number) => {
      const date = todayISO();
      const time = nowHHMM();
      update((d) => {
        const history = [...(d.settings.fuelPriceHistory || [])];
        // First change ever: keep the price that was in effect until now as the
        // baseline, so older records are not repriced retroactively.
        if (history.length === 0) {
          history.push({
            date: "0000-01-01",
            time: "00:00",
            price: d.settings.fuelPrice,
            consumption: d.vehicle.consumption,
          });
        }
        const existingIdx = history.findIndex(
          (h) => h.date === date && (h.time ?? "00:00") === time,
        );
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
    },
    [update],
  );

  return {
    data,
    ready,
    addIncome,
    addExpense,
    addTrip,
    removeTrip,
    updateTrip,
    saveTripWithIncome,
    updateTripWithIncome,
    removeIncome,
    removeExpense,
    updateIncome,
    updateExpense,
    updateSettings,
    updateVehicle,
    recordFuelPriceChange,
    restoreRecords,
    update,
  };
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

/** Precise amount with agorot, for per-km figures: "0.85 ₪". */
export function fmtPrecise(n: number, currency = "₪") {
  const abs = Math.abs(n).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? "-" : ""}${abs} ${currency}`;
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

const historyKey = (h: FuelPriceEntry) => `${h.date} ${h.time ?? "00:00"}`;
/** Sorted copies of price histories, so a list of hundreds of records sorts once, not per record. */
const sortedHistories = new WeakMap<FuelPriceEntry[], { h: FuelPriceEntry; key: string }[]>();
function sortedHistory(history: FuelPriceEntry[]) {
  let sorted = sortedHistories.get(history);
  if (!sorted) {
    sorted = history
      .map((h) => ({ h, key: historyKey(h) }))
      .sort((a, b) => a.key.localeCompare(b.key));
    sortedHistories.set(history, sorted);
  }
  return sorted;
}

/**
 * Returns the fuel price and consumption that were effective at a given
 * moment (date + optional hour). Price/consumption changes are stamped with
 * the exact hour they were made, so a change made at 14:00 does not affect a
 * record entered at 09:00 the same day.
 */
export function effectiveFuelParams(
  date: string,
  vehicle: Vehicle,
  settings: Settings,
  time?: string,
) {
  const history = settings.fuelPriceHistory;
  const stamp = `${date} ${time ?? "00:00"}`;
  if (history && history.length > 0) {
    const sorted = sortedHistory(history);
    let entry: { h: FuelPriceEntry; key: string } | null = null;
    for (const item of sorted) {
      if (item.key <= stamp) entry = item;
      else break;
    }
    // Before the first recorded change, the earliest known values are the
    // best guess (the current price would reprice old records).
    entry ??= sorted[0];
    return { price: entry.h.price, consumption: entry.h.consumption, since: entry.key };
  }
  return { price: settings.fuelPrice, consumption: vehicle.consumption, since: null };
}

/** Estimated energy cost for a given distance, based on vehicle consumption and fuel price. */
export function estimateEnergyCost(km: number, vehicle: Vehicle, settings: Settings) {
  const cons = vehicle.consumption > 0 ? vehicle.consumption : 1;
  const units = km / cons; // liters or kWh
  const price = settings.fuelPrice || 0;
  return { units, cost: units * price, costPerKm: price / cons };
}

/**
 * Time-aware energy cost: sums per-income using the price & consumption that
 * were effective at each record's own date and hour, so price or consumption
 * changes never apply retroactively.
 */
export function estimateEnergyCostByDate(incomes: Income[], vehicle: Vehicle, settings: Settings) {
  let totalCost = 0;
  let totalUnits = 0;
  let totalKm = 0;
  for (const i of incomes) {
    const km = i.km || 0;
    if (km === 0) continue;
    const { price, consumption } = effectiveFuelParams(i.date, vehicle, settings, i.time);
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

/** Total km recorded by the GPS trip tracker. */
export function sumTripKm(trips: Trip[]) {
  return trips.reduce((s, t) => s + (t.km || 0), 0);
}

/** Total tracked driving seconds. */
export function sumTripSeconds(trips: Trip[]) {
  return trips.reduce((s, t) => s + (t.seconds || 0), 0);
}

/**
 * Energy cost of tracked GPS trips, using the price & consumption effective
 * at each trip's own date and hour (never retroactive).
 */
export function estimateTripEnergyCost(trips: Trip[], vehicle: Vehicle, settings: Settings) {
  let cost = 0;
  let units = 0;
  let km = 0;
  for (const t of trips) {
    const d = t.km || 0;
    if (d <= 0) continue;
    const p = effectiveFuelParams(t.date, vehicle, settings, t.time);
    const cons = p.consumption > 0 ? p.consumption : 1;
    const u = d / cons;
    km += d;
    units += u;
    cost += u * p.price;
  }
  return { cost, units, km };
}

/** "1:05:20" / "24:10" for a duration in seconds. */
export function fmtDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function energyUnitLabel(v: Vehicle) {
  return v.type === "electric" ? "kWh" : "ליטר";
}

/**
 * Fuel cost for a period, by distance: GPS trips + manual km of incomes that
 * are not linked to a trip, each priced at the fuel price and consumption in
 * effect at its own moment. Because it is a sum per record, the sum of days
 * always equals the month. Actual refuels (`actual`) are not charged: they are
 * used to compare with the estimate and to suggest a consumption update.
 */
export function fuelCostFor(
  incomes: Income[],
  expenses: Expense[],
  vehicle: Vehicle,
  settings: Settings,
  trips: Trip[] = [],
) {
  const manual = estimateEnergyCostByDate(
    incomes.filter((i) => !i.tripId),
    vehicle,
    settings,
  ).cost;
  const tracked = estimateTripEnergyCost(trips, vehicle, settings).cost;
  const estimated = manual + tracked;
  const actual = expenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
  return { estimated, actual, charged: estimated };
}

/** Driven km for a period: GPS trips + manual km of incomes not linked to a trip. */
export function drivenKm(incomes: Income[], trips: Trip[] = []) {
  return sumTripKm(trips) + sumKm(incomes.filter((i) => !i.tripId));
}

/** Total costs for a period: non-fuel expenses + certain fuel cost. */
export function totalCosts(
  incomes: Income[],
  expenses: Expense[],
  vehicle: Vehicle,
  settings: Settings,
  trips: Trip[] = [],
) {
  const nonFuel = expenses.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
  return nonFuel + fuelCostFor(incomes, expenses, vehicle, settings, trips).charged;
}

/** Net profit: income after commission/tips, minus expenses including certain fuel cost. */
export function netProfit(
  incomes: Income[],
  expenses: Expense[],
  vehicle: Vehicle,
  settings: Settings,
  trips: Trip[] = [],
) {
  return sumIncomes(incomes) - totalCosts(incomes, expenses, vehicle, settings, trips);
}

export function sumHours(list: Income[]) {
  return list.reduce((s, i) => s + (i.hours || 0), 0);
}
