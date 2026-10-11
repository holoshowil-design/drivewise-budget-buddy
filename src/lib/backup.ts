import { z } from "zod";
import type { AppData, Expense, FuelPriceEntry, Income, Trip } from "./store";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const num = z.number().finite();

const incomeSchema = z
  .object({
    id: z.string().min(1),
    date: isoDate,
    amount: num,
    commissionPct: num.default(0),
    tip: num.default(0),
    hours: num.default(0),
    km: num.default(0),
    platform: z.string().default("פרטי"),
  })
  .passthrough();

const expenseSchema = z
  .object({
    id: z.string().min(1),
    date: isoDate,
    amount: num,
    category: z.enum([
      "fuel",
      "insurance",
      "license",
      "maintenance",
      "parking",
      "food",
      "wash",
      "other",
    ]),
  })
  .passthrough();

const tripSchema = z
  .object({ id: z.string().min(1), date: isoDate, km: num, seconds: num.default(0) })
  .passthrough();

const priceEntrySchema = z
  .object({ date: z.string(), time: z.string().optional(), price: num, consumption: num })
  .passthrough();

const backupSchema = z
  .object({
    incomes: z.array(incomeSchema),
    expenses: z.array(expenseSchema),
    trips: z.array(tripSchema).default([]),
    settings: z
      .object({ fuelPriceHistory: z.array(priceEntrySchema).optional() })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type Backup = {
  incomes: Income[];
  expenses: Expense[];
  trips: Trip[];
  fuelPriceHistory: FuelPriceEntry[];
};

/** Validates a parsed backup file. Returns null when it is not a Driver backup. */
export function parseBackup(raw: unknown): Backup | null {
  const r = backupSchema.safeParse(raw);
  if (!r.success) return null;
  return {
    incomes: r.data.incomes as unknown as Income[],
    expenses: r.data.expenses as unknown as Expense[],
    trips: r.data.trips as unknown as Trip[],
    fuelPriceHistory: (r.data.settings?.fuelPriceHistory ?? []) as FuelPriceEntry[],
  };
}

const missing = <T extends { id: string }>(have: T[], incoming: T[]) => {
  const ids = new Set(have.map((x) => x.id));
  return incoming.filter((x) => !ids.has(x.id));
};

/** How many records the restore would add (records already here are kept as is). */
export function planRestore(data: AppData, b: Backup) {
  const incomes = missing(data.incomes, b.incomes).length;
  const expenses = missing(data.expenses, b.expenses).length;
  const trips = missing(data.trips ?? [], b.trips).length;
  return { incomes, expenses, trips, total: incomes + expenses + trips };
}

/**
 * Adds the backup's missing records. Existing records, settings and vehicle
 * stay as they are; fuel-price history entries are unioned by date and hour.
 * Restored records get fresh sync stamps (via `update`), so they reach the cloud.
 */
export function applyRestore(d: AppData, b: Backup): AppData {
  const strip = <T extends { updatedAt?: string }>(x: T) => {
    const { updatedAt: _ignored, ...rest } = x;
    return rest as T;
  };
  const key = (h: FuelPriceEntry) => `${h.date} ${h.time ?? "00:00"}`;
  const history = new Map((d.settings.fuelPriceHistory ?? []).map((h) => [key(h), h]));
  for (const h of b.fuelPriceHistory) if (!history.has(key(h))) history.set(key(h), h);
  return {
    ...d,
    incomes: [...d.incomes, ...missing(d.incomes, b.incomes).map(strip)],
    expenses: [...d.expenses, ...missing(d.expenses, b.expenses).map(strip)],
    trips: [...(d.trips ?? []), ...missing(d.trips ?? [], b.trips).map(strip)],
    settings: { ...d.settings, fuelPriceHistory: [...history.values()] },
  };
}
