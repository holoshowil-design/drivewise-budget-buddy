import { c as createRouter, a as createRootRouteWithContext, H as HeadContent, S as Scripts, O as Outlet, b as createFileRoute, l as lazyRouteComponent, u as useRouter, L as Link, d as useNavigate, e as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { C as Car, a as Check, X, D as Download, F as Flame, T as Trophy, G as Gauge, H as House, b as Calendar, P as Plus, N as Navigation, c as ChartColumn, S as Settings } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
const appCss = "/assets/styles-CsVQNUym.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const PLUGIN = "BackgroundGeolocation";
function bridge$1() {
  if (typeof window === "undefined") return null;
  return window.Capacitor ?? null;
}
function isNativeApp() {
  return Boolean(bridge$1()?.isNativePlatform?.());
}
function hasBackgroundTracking() {
  const b = bridge$1();
  return Boolean(
    b?.isNativePlatform?.() && b.Plugins?.[PLUGIN] && b.nativeCallback && b.nativePromise
  );
}
function watchLocation(onFix, onError, options = {}) {
  if (options.background && hasBackgroundTracking())
    return watchNative(bridge$1(), onFix, onError, options.background);
  return watchBrowser(onFix, onError, options);
}
function watchBrowser(onFix, onError, options) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError({ kind: "unavailable", message: "no-geolocation" });
    return () => {
    };
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onFix({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? 999,
      speedKmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : null,
      time: pos.timestamp
    }),
    (err) => onError({
      kind: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
      message: err.message
    }),
    {
      enableHighAccuracy: true,
      maximumAge: options.maximumAge ?? 0,
      timeout: options.timeout ?? 2e4
    }
  );
  return () => navigator.geolocation.clearWatch(id);
}
let nativeOwner = 0;
function watchNative(b, onFix, onError, notification) {
  let stopped = false;
  const me = ++nativeOwner;
  const ready = b.nativePromise(PLUGIN, "stop").catch(() => void 0);
  void ready.then(() => {
    if (stopped) return;
    b.nativeCallback(
      PLUGIN,
      "start",
      {
        backgroundTitle: notification.title,
        backgroundMessage: notification.message,
        requestPermissions: true,
        stale: false,
        distanceFilter: 5
      },
      (data, error) => {
        if (stopped) return;
        if (error) {
          onError({
            kind: error.code === "NOT_AUTHORIZED" ? "denied" : "unavailable",
            message: error.message ?? ""
          });
          return;
        }
        const loc = data;
        if (!loc || typeof loc.latitude !== "number") return;
        onFix({
          lat: loc.latitude,
          lon: loc.longitude,
          accuracy: loc.accuracy ?? 999,
          speedKmh: loc.speed != null ? loc.speed * 3.6 : null,
          time: loc.time ?? Date.now()
        });
      }
    );
  });
  return () => {
    if (stopped) return;
    stopped = true;
    void ready.then(() => {
      if (nativeOwner === me) return b.nativePromise(PLUGIN, "stop").catch(() => void 0);
    });
  };
}
const OFF_KEY = "driver-haptics-off";
function hapticsEnabled() {
  try {
    return localStorage.getItem(OFF_KEY) !== "1";
  } catch {
    return true;
  }
}
function setHapticsEnabled(on) {
  try {
    if (on) localStorage.removeItem(OFF_KEY);
    else localStorage.setItem(OFF_KEY, "1");
  } catch {
  }
}
const WEB_PATTERN = {
  light: 8,
  tap: 15,
  success: [15, 60, 25],
  warning: [30, 50, 30]
};
function haptic(kind) {
  if (typeof window === "undefined" || !hapticsEnabled()) return;
  if (isNativeApp()) {
    const cap = window.Capacitor;
    const call = kind === "success" ? cap?.nativePromise?.("Haptics", "notification", { type: "SUCCESS" }) : kind === "warning" ? cap?.nativePromise?.("Haptics", "notification", { type: "WARNING" }) : cap?.nativePromise?.("Haptics", "impact", {
      style: kind === "light" ? "LIGHT" : "MEDIUM"
    });
    void call?.catch(() => {
    });
    return;
  }
  try {
    navigator.vibrate?.(WEB_PATTERN[kind]);
  } catch {
  }
}
const saveData = () => navigator.connection?.saveData === true;
function preloadTabs(router2, paths) {
  if (typeof window === "undefined" || saveData()) return () => {
  };
  const hasIdle = "requestIdleCallback" in window;
  let cancelled = false;
  let handle = 0;
  const idle = (cb) => {
    handle = hasIdle ? window.requestIdleCallback(cb, { timeout: 4e3 }) : window.setTimeout(cb, 1200);
  };
  const queue = [
    ...paths.map((to) => () => router2.preloadRoute({ to })),
    () => import("./ExpensePie-DriDxFd_.mjs")
  ];
  const next = () => {
    const job = queue.shift();
    if (cancelled || !job) return;
    job().catch(() => void 0).finally(() => idle(next));
  };
  const start = window.setTimeout(() => idle(next), 2500);
  return () => {
    cancelled = true;
    window.clearTimeout(start);
    if (hasIdle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}
const seen = /* @__PURE__ */ new Set();
function useTabReturn(pathname) {
  reactExports.useLayoutEffect(() => {
    const root = document.documentElement;
    if (seen.has(pathname)) root.dataset.tabReturn = "";
    else {
      delete root.dataset.tabReturn;
      seen.add(pathname);
    }
  }, [pathname]);
}
const items = [
  { to: "/", label: "דשבורד", icon: House },
  { to: "/calendar", label: "לוח שנה", icon: Calendar },
  { to: "/add", label: "הוסף", icon: Plus, highlight: true },
  { to: "/trip", label: "נסיעה", icon: Navigation },
  { to: "/reports", label: "דוחות", icon: ChartColumn },
  { to: "/settings", label: "הגדרות", icon: Settings }
];
function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router2 = useRouter();
  useTabReturn(pathname);
  reactExports.useEffect(
    () => preloadTabs(
      router2,
      items.map((it) => it.to)
    ),
    [router2]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "ink-nav fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mx-auto flex max-w-xl items-stretch justify-around px-2", children: items.map((it) => {
    const active = pathname === it.to;
    const Icon = it.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: it.to,
        "aria-label": it.label,
        "aria-current": active ? "page" : void 0,
        onClick: () => haptic("light"),
        className: cn(
          "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        ),
        children: [
          it.highlight ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "nav-fab", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6", strokeWidth: 2.5 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex flex-col items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5", strokeWidth: active ? 2.4 : 1.9 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: cn(
                  "absolute -top-2.5 h-1 w-1 rounded-full bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(it.highlight && "sr-only"), children: it.label })
        ]
      }
    ) }, it.to);
  }) }) });
}
const EPOCH = "1970-01-01T00:00:00.000Z";
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1e3;
const COLLECTIONS = ["incomes", "expenses", "trips"];
const stampOf = (x) => x?.updatedAt ?? EPOCH;
const newer = (a, b) => a >= b ? a : b;
function body(x) {
  const { updatedAt: _ignored, ...rest } = x;
  return JSON.stringify(rest);
}
function pruneTombstones(deleted, now) {
  const cutoff = new Date(new Date(now).getTime() - TOMBSTONE_TTL_MS).toISOString();
  const out = {};
  for (const [id, at] of Object.entries(deleted)) if (at >= cutoff) out[id] = at;
  return out;
}
function normalizeMeta(d) {
  const withStamp = (list) => (list ?? []).map((x) => x.updatedAt ? x : { ...x, updatedAt: EPOCH });
  return {
    ...d,
    incomes: withStamp(d.incomes),
    expenses: withStamp(d.expenses),
    trips: withStamp(d.trips),
    meta: { ...d.meta, deleted: { ...d.meta?.deleted } }
  };
}
function stampChanges(prev, next, now = (/* @__PURE__ */ new Date()).toISOString()) {
  const meta = {
    ...next.meta ?? prev.meta,
    deleted: { ...(next.meta ?? prev.meta)?.deleted }
  };
  const out = { ...next };
  for (const key of COLLECTIONS) {
    const before = new Map((prev[key] ?? []).map((x) => [x.id, x]));
    const after = next[key] ?? [];
    const afterIds = new Set(after.map((x) => x.id));
    out[key] = after.map((x) => {
      const old = before.get(x.id);
      if (old && body(old) === body(x)) return { ...x, updatedAt: old.updatedAt ?? x.updatedAt };
      delete meta.deleted[x.id];
      return { ...x, updatedAt: now };
    });
    for (const id of before.keys()) if (!afterIds.has(id)) meta.deleted[id] = now;
  }
  if (JSON.stringify(prev.settings) !== JSON.stringify(next.settings)) meta.settingsUpdatedAt = now;
  if (JSON.stringify(prev.vehicle) !== JSON.stringify(next.vehicle)) meta.vehicleUpdatedAt = now;
  meta.deleted = pruneTombstones(meta.deleted, now);
  out.meta = meta;
  return out;
}
function mergeWithMeta(local, remote, now = (/* @__PURE__ */ new Date()).toISOString()) {
  const l = normalizeMeta(local);
  const r = normalizeMeta(remote);
  const deleted = { ...l.meta.deleted };
  for (const [id, at] of Object.entries(r.meta.deleted))
    deleted[id] = newer(deleted[id] ?? EPOCH, at);
  const mergeList = (a, b) => {
    const map = /* @__PURE__ */ new Map();
    for (const x of [...a, ...b]) {
      const cur = map.get(x.id);
      if (!cur || stampOf(x) >= stampOf(cur)) map.set(x.id, x);
    }
    const kept = [];
    for (const x of map.values()) {
      const del = deleted[x.id];
      if (del && del >= stampOf(x)) continue;
      if (del) delete deleted[x.id];
      kept.push(x);
    }
    return kept;
  };
  const lSet = l.meta.settingsUpdatedAt ?? EPOCH;
  const rSet = r.meta.settingsUpdatedAt ?? EPOCH;
  const lVeh = l.meta.vehicleUpdatedAt ?? EPOCH;
  const rVeh = r.meta.vehicleUpdatedAt ?? EPOCH;
  return {
    incomes: mergeList(l.incomes, r.incomes),
    expenses: mergeList(l.expenses, r.expenses),
    trips: mergeList(l.trips, r.trips),
    settings: lSet > rSet ? { ...r.settings, ...l.settings } : { ...l.settings, ...r.settings },
    vehicle: lVeh > rVeh ? { ...r.vehicle, ...l.vehicle } : { ...l.vehicle, ...r.vehicle },
    meta: {
      deleted: pruneTombstones(deleted, now),
      settingsUpdatedAt: newer(lSet, rSet),
      vehicleUpdatedAt: newer(lVeh, rVeh)
    }
  };
}
function sameContent(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
const KEY = "driver-app-v1";
const defaultData = {
  incomes: [],
  expenses: [],
  trips: [],
  vehicle: {
    make: "",
    model: "",
    year: "",
    plate: "",
    type: "petrol",
    consumption: 12
  },
  settings: {
    dailyGoal: 500,
    fixedMonthlyExpenses: 3e3,
    workDaysPerMonth: 22,
    defaultCommissionPct: 12,
    currency: "₪",
    fuelPrice: 7.4,
    fuelPriceHistory: []
  }
};
let parsedCache = null;
let snapshot = null;
function load() {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    if (parsedCache?.raw === raw) return parsedCache.data;
    const data = parse(raw);
    parsedCache = { raw, data };
    return data;
  } catch {
    return defaultData;
  }
}
function parse(raw) {
  const parsed = JSON.parse(raw);
  return normalizeMeta({
    ...defaultData,
    ...parsed,
    trips: Array.isArray(parsed.trips) ? parsed.trips : [],
    settings: { ...defaultData.settings, ...parsed.settings },
    vehicle: { ...defaultData.vehicle, ...parsed.vehicle }
  });
}
let storageWarned = false;
const PRE_SYNC_BACKUP_KEY = "driver-app-v1-pre-sync-backup";
function keepPreSyncCopy() {
  if (localStorage.getItem(PRE_SYNC_BACKUP_KEY)) return;
  const raw = localStorage.getItem(KEY);
  if (raw && !raw.includes('"meta"')) localStorage.setItem(PRE_SYNC_BACKUP_KEY, raw);
}
function save(data, opts = {}) {
  if (typeof window === "undefined") return;
  try {
    keepPreSyncCopy();
    localStorage.setItem(KEY, JSON.stringify(data));
    storageWarned = false;
  } catch {
    if (!storageWarned) {
      storageWarned = true;
      toast.error("השמירה במכשיר נכשלה (האחסון מלא?). הנתונים יישמרו בענן אם אתה מחובר.", {
        duration: 1e4
      });
    }
  }
  snapshot = opts.fromCloud ? null : data;
  window.dispatchEvent(new Event("driver-data-changed"));
  if (!opts.fromCloud) window.dispatchEvent(new CustomEvent("driver-data-local-change"));
}
const readSnapshot = () => snapshot ??= load();
const serverSnapshot = () => defaultData;
function subscribe(onChange) {
  const fromOtherTab = () => {
    snapshot = null;
    onChange();
  };
  window.addEventListener("driver-data-changed", onChange);
  window.addEventListener("storage", fromOtherTab);
  return () => {
    window.removeEventListener("driver-data-changed", onChange);
    window.removeEventListener("storage", fromOtherTab);
  };
}
const noSubscribe = () => () => {
};
function useAppData() {
  const data = reactExports.useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);
  const ready = reactExports.useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
  const update = reactExports.useCallback((updater) => {
    const prev = load();
    const next = stampChanges(prev, updater(prev));
    save(next);
  }, []);
  const addIncome = reactExports.useCallback(
    (i) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, incomes: [...d.incomes, { time: nowHHMM(), ...i, id }] }));
      return id;
    },
    [update]
  );
  const addExpense = reactExports.useCallback(
    (e) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, expenses: [...d.expenses, { time: nowHHMM(), ...e, id }] }));
      return id;
    },
    [update]
  );
  const addTrip = reactExports.useCallback(
    (t) => {
      const id = crypto.randomUUID();
      update((d) => ({ ...d, trips: [...d.trips || [], { ...t, id }] }));
      return id;
    },
    [update]
  );
  const removeTrip = reactExports.useCallback(
    (id) => {
      update((d) => ({
        ...d,
        trips: (d.trips || []).filter((x) => x.id !== id),
        incomes: d.incomes.filter((x) => x.tripId !== id)
      }));
    },
    [update]
  );
  const updateTrip = reactExports.useCallback(
    (id, patch) => {
      update((d) => ({
        ...d,
        trips: (d.trips || []).map((x) => x.id === id ? { ...x, ...patch } : x)
      }));
    },
    [update]
  );
  const saveTripWithIncome = reactExports.useCallback(
    (trip, income) => {
      const tripId = crypto.randomUUID();
      const incomeId = income ? crypto.randomUUID() : void 0;
      update((d) => ({
        ...d,
        trips: [...d.trips || [], { ...trip, id: tripId, incomeId }],
        incomes: income ? [...d.incomes, { ...income, km: 0, tripId, id: incomeId }] : d.incomes
      }));
      return tripId;
    },
    [update]
  );
  const updateTripWithIncome = reactExports.useCallback(
    (id, patch, income) => {
      update((d) => {
        const trip = (d.trips || []).find((t) => t.id === id);
        let incomes = d.incomes;
        let incomeId = trip?.incomeId;
        if (income) {
          if (incomeId && incomes.some((x) => x.id === incomeId)) {
            incomes = incomes.map(
              (x) => x.id === incomeId ? { ...x, ...income, km: 0, tripId: id } : x
            );
          } else {
            incomeId = crypto.randomUUID();
            incomes = [...incomes, { ...income, km: 0, tripId: id, id: incomeId }];
          }
        } else if (incomeId) {
          incomes = incomes.filter((x) => x.id !== incomeId);
          incomeId = void 0;
        }
        return {
          ...d,
          incomes,
          trips: (d.trips || []).map((t) => t.id === id ? { ...t, ...patch, incomeId } : t)
        };
      });
    },
    [update]
  );
  const restoreRecords = reactExports.useCallback(
    (r) => {
      const add = (list, back = []) => {
        const ids = new Set(list.map((x) => x.id));
        return [...list, ...back.filter((x) => !ids.has(x.id))];
      };
      update((d) => ({
        ...d,
        incomes: add(d.incomes, r.incomes),
        expenses: add(d.expenses, r.expenses),
        trips: add(d.trips || [], r.trips)
      }));
    },
    [update]
  );
  const removeIncome = reactExports.useCallback(
    (id) => {
      update((d) => ({ ...d, incomes: d.incomes.filter((x) => x.id !== id) }));
    },
    [update]
  );
  const removeExpense = reactExports.useCallback(
    (id) => {
      update((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) }));
    },
    [update]
  );
  const updateIncome = reactExports.useCallback(
    (id, patch) => {
      update((d) => ({
        ...d,
        incomes: d.incomes.map((x) => x.id === id ? { ...x, ...patch } : x)
      }));
    },
    [update]
  );
  const updateExpense = reactExports.useCallback(
    (id, patch) => {
      update((d) => ({
        ...d,
        expenses: d.expenses.map((x) => x.id === id ? { ...x, ...patch } : x)
      }));
    },
    [update]
  );
  const updateSettings = reactExports.useCallback(
    (s) => {
      update((d) => ({ ...d, settings: { ...d.settings, ...s } }));
    },
    [update]
  );
  const updateVehicle = reactExports.useCallback(
    (v) => {
      update((d) => ({ ...d, vehicle: { ...d.vehicle, ...v } }));
    },
    [update]
  );
  const recordFuelPriceChange = reactExports.useCallback(
    (price, consumption) => {
      const date = todayISO();
      const time = nowHHMM();
      update((d) => {
        const history = [...d.settings.fuelPriceHistory || []];
        if (history.length === 0) {
          history.push({
            date: "0000-01-01",
            time: "00:00",
            price: d.settings.fuelPrice,
            consumption: d.vehicle.consumption
          });
        }
        const existingIdx = history.findIndex(
          (h) => h.date === date && (h.time ?? "00:00") === time
        );
        const entry = { date, time, price, consumption };
        if (existingIdx >= 0) history[existingIdx] = entry;
        else history.push(entry);
        return {
          ...d,
          settings: {
            ...d.settings,
            fuelPrice: price,
            fuelPriceHistory: history
          },
          vehicle: { ...d.vehicle, consumption }
        };
      });
    },
    [update]
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
    update
  };
}
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 6e4);
  return local.toISOString().slice(0, 10);
}
function nowHHMM() {
  const d = /* @__PURE__ */ new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function netFromIncome(i) {
  return i.amount * (1 - i.commissionPct / 100) + (i.tip || 0);
}
function sumIncomes(list) {
  return list.reduce((s, i) => s + netFromIncome(i), 0);
}
function filterByRange(list, from, to) {
  return list.filter((x) => x.date >= from && x.date <= to);
}
function filterByDate(list, date) {
  return list.filter((x) => x.date === date);
}
function categoryLabel(c) {
  const m = {
    fuel: "דלק / חשמל",
    insurance: "ביטוח",
    license: "רישוי",
    maintenance: "טיפול ותחזוקה",
    parking: "חניה",
    food: "אוכל ושתייה",
    wash: "שטיפה",
    other: "אחר"
  };
  return m[c];
}
function fmt(n, currency = "₪") {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString("he-IL", { maximumFractionDigits: 0 });
  return `${rounded < 0 ? "-" : ""}${abs} ${currency}`;
}
function fmtPrecise(n, currency = "₪") {
  const abs = Math.abs(n).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${n < 0 ? "-" : ""}${abs} ${currency}`;
}
function fmtDateShort(iso) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}
function monthRange(year, month) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  const iso = (d) => {
    const tz = d.getTimezoneOffset();
    return new Date(d.getTime() - tz * 6e4).toISOString().slice(0, 10);
  };
  return { from: iso(from), to: iso(to) };
}
function sumKm(list) {
  return list.reduce((s, i) => s + (i.km || 0), 0);
}
const historyKey = (h) => `${h.date} ${h.time ?? "00:00"}`;
const sortedHistories = /* @__PURE__ */ new WeakMap();
function sortedHistory(history) {
  let sorted = sortedHistories.get(history);
  if (!sorted) {
    sorted = history.map((h) => ({ h, key: historyKey(h) })).sort((a, b) => a.key.localeCompare(b.key));
    sortedHistories.set(history, sorted);
  }
  return sorted;
}
function effectiveFuelParams(date, vehicle, settings, time) {
  const history = settings.fuelPriceHistory;
  const stamp = `${date} ${time ?? "00:00"}`;
  if (history && history.length > 0) {
    const sorted = sortedHistory(history);
    let entry = null;
    for (const item of sorted) {
      if (item.key <= stamp) entry = item;
      else break;
    }
    entry ??= sorted[0];
    return { price: entry.h.price, consumption: entry.h.consumption, since: entry.key };
  }
  return { price: settings.fuelPrice, consumption: vehicle.consumption, since: null };
}
function estimateEnergyCostByDate(incomes, vehicle, settings) {
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
const isPrivateTrip = (t) => t.kind === "private";
function sumTripKm(trips) {
  return trips.reduce((s, t) => s + (isPrivateTrip(t) ? 0 : t.km || 0), 0);
}
function idlePerHour(vehicle, settings) {
  if (settings.idlePerHour != null && settings.idlePerHour >= 0) return settings.idlePerHour;
  return vehicle.type === "electric" ? 1 : vehicle.type === "hybrid" ? 0.3 : 0.8;
}
function tripEnergy(t, vehicle, settings) {
  const p = effectiveFuelParams(t.date, vehicle, settings, t.time);
  const cons = p.consumption > 0 ? p.consumption : 1;
  const units = (t.km || 0) / cons + (t.idleSeconds || 0) / 3600 * idlePerHour(vehicle, settings);
  return { units, cost: units * p.price };
}
function estimateTripEnergyCost(trips, vehicle, settings) {
  let cost = 0;
  let units = 0;
  let km = 0;
  for (const t of trips) {
    if (isPrivateTrip(t)) continue;
    const e = tripEnergy(t, vehicle, settings);
    km += t.km || 0;
    units += e.units;
    cost += e.cost;
  }
  return { cost, units, km };
}
function fmtDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
function energyUnitLabel(v) {
  return v.type === "electric" ? "kWh" : "ליטר";
}
function fuelCostFor(incomes, expenses, vehicle, settings, trips = []) {
  const manual = estimateEnergyCostByDate(
    incomes.filter((i) => !i.tripId),
    vehicle,
    settings
  ).cost;
  const tracked = estimateTripEnergyCost(trips, vehicle, settings).cost;
  const estimated = manual + tracked;
  const actual = expenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
  return { estimated, actual, charged: estimated };
}
function drivenKm(incomes, trips = []) {
  return sumTripKm(trips) + sumKm(incomes.filter((i) => !i.tripId));
}
function totalCosts(incomes, expenses, vehicle, settings, trips = []) {
  const nonFuel = expenses.filter((e) => e.category !== "fuel").reduce((s, e) => s + e.amount, 0);
  return nonFuel + fuelCostFor(incomes, expenses, vehicle, settings, trips).charged;
}
function netProfit(incomes, expenses, vehicle, settings, trips = []) {
  return sumIncomes(incomes) - totalCosts(incomes, expenses, vehicle, settings, trips);
}
function sumHours(list, trips = []) {
  const between = trips.filter((t) => t.kind === "between").reduce((s, t) => s + (t.seconds || 0), 0);
  return list.reduce((s, i) => s + (i.hours || 0), 0) + between / 3600;
}
const ACTIVE_KEY = "driver-active-trip";
const ACTIVE_EVENT = "driver-active-trip-changed";
function readActive() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeActive(t) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(ACTIVE_KEY, JSON.stringify(t));
  else localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event(ACTIVE_EVENT));
}
function isDrivingNow(trip, now = Date.now()) {
  if (!trip) return false;
  if (trip.kind !== "between" && trip.kind !== "private") return true;
  if (trip.km <= 0) return false;
  return now - (trip.lastMoveAt ?? trip.startedAt) < 6e4;
}
function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function notifyIfHidden(title, body2) {
  if (typeof document === "undefined" || typeof Notification === "undefined") return;
  if (document.visibilityState === "visible") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body: body2, icon: "/icon-192.png", tag: "driver-trip" });
  } catch {
  }
}
function requestNotifyPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {
  });
}
const PLACES = [
  { name: "ירושלים", lat: 31.778, lon: 35.215, r: 9 },
  { name: "תל אביב", lat: 32.08, lon: 34.78, r: 5 },
  { name: "חיפה", lat: 32.794, lon: 34.99, r: 7 },
  { name: "בני ברק", lat: 32.084, lon: 34.834, r: 2.5 },
  { name: "רמת גן", lat: 32.068, lon: 34.824, r: 2.5 },
  { name: "גבעתיים", lat: 32.072, lon: 34.81, r: 1.5 },
  { name: "פתח תקווה", lat: 32.087, lon: 34.887, r: 4 },
  { name: "בת ים", lat: 32.017, lon: 34.75, r: 2.5 },
  { name: "חולון", lat: 32.011, lon: 34.78, r: 3 },
  { name: "ראשון לציון", lat: 31.964, lon: 34.804, r: 5 },
  { name: "רחובות", lat: 31.894, lon: 34.811, r: 4 },
  { name: "נס ציונה", lat: 31.929, lon: 34.799, r: 2.5 },
  { name: "לוד", lat: 31.951, lon: 34.895, r: 3 },
  { name: "רמלה", lat: 31.928, lon: 34.87, r: 3 },
  { name: "מודיעין", lat: 31.898, lon: 35.01, r: 5 },
  { name: "מודיעין עילית", lat: 31.932, lon: 35.043, r: 2.5 },
  { name: "בית שמש", lat: 31.745, lon: 34.988, r: 5 },
  { name: "ביתר עילית", lat: 31.697, lon: 35.115, r: 2.5 },
  { name: "מבשרת ציון", lat: 31.802, lon: 35.15, r: 2.5 },
  { name: "מעלה אדומים", lat: 31.777, lon: 35.3, r: 3 },
  { name: "גבעת זאב", lat: 31.862, lon: 35.168, r: 2 },
  { name: "אשדוד", lat: 31.804, lon: 34.655, r: 6 },
  { name: "אשקלון", lat: 31.669, lon: 34.574, r: 6 },
  { name: "יבנה", lat: 31.877, lon: 34.739, r: 3 },
  { name: "גן יבנה", lat: 31.787, lon: 34.706, r: 2 },
  { name: "קריית גת", lat: 31.61, lon: 34.77, r: 4 },
  { name: "קריית מלאכי", lat: 31.732, lon: 34.745, r: 2.5 },
  { name: "שדרות", lat: 31.525, lon: 34.597, r: 3 },
  { name: "נתיבות", lat: 31.421, lon: 34.588, r: 3 },
  { name: "אופקים", lat: 31.314, lon: 34.62, r: 3 },
  { name: "באר שבע", lat: 31.252, lon: 34.791, r: 8 },
  { name: "דימונה", lat: 31.069, lon: 35.033, r: 4 },
  { name: "ערד", lat: 31.259, lon: 35.213, r: 4 },
  { name: "אילת", lat: 29.558, lon: 34.952, r: 6 },
  { name: "הרצליה", lat: 32.166, lon: 34.843, r: 4 },
  { name: "רמת השרון", lat: 32.146, lon: 34.839, r: 2.5 },
  { name: "רעננה", lat: 32.184, lon: 34.871, r: 3 },
  { name: "כפר סבא", lat: 32.178, lon: 34.907, r: 3.5 },
  { name: "הוד השרון", lat: 32.155, lon: 34.892, r: 3 },
  { name: "ראש העין", lat: 32.096, lon: 34.957, r: 3.5 },
  { name: "אלעד", lat: 32.052, lon: 34.951, r: 2 },
  { name: "אור יהודה", lat: 32.03, lon: 34.853, r: 2 },
  { name: "יהוד", lat: 32.033, lon: 34.89, r: 2 },
  { name: "קריית אונו", lat: 32.063, lon: 34.855, r: 2 },
  { name: "שוהם", lat: 31.999, lon: 34.946, r: 2.5 },
  { name: "נתניה", lat: 32.321, lon: 34.853, r: 6 },
  { name: "חדרה", lat: 32.434, lon: 34.919, r: 5 },
  { name: "כפר יונה", lat: 32.316, lon: 34.936, r: 2.5 },
  { name: "טייבה", lat: 32.266, lon: 35.01, r: 3 },
  { name: "אום אל-פחם", lat: 32.52, lon: 35.153, r: 3.5 },
  { name: "זכרון יעקב", lat: 32.571, lon: 34.954, r: 3 },
  { name: "קריית אתא", lat: 32.81, lon: 35.106, r: 3 },
  { name: "קריית ביאליק", lat: 32.837, lon: 35.088, r: 2.5 },
  { name: "קריית מוצקין", lat: 32.837, lon: 35.077, r: 2 },
  { name: "קריית ים", lat: 32.849, lon: 35.069, r: 2 },
  { name: "טירת כרמל", lat: 32.761, lon: 34.971, r: 2.5 },
  { name: "נשר", lat: 32.767, lon: 35.043, r: 2.5 },
  { name: "יוקנעם", lat: 32.659, lon: 35.105, r: 3 },
  { name: "עכו", lat: 32.928, lon: 35.084, r: 4 },
  { name: "נהריה", lat: 33.006, lon: 35.098, r: 4 },
  { name: "כרמיאל", lat: 32.915, lon: 35.296, r: 4 },
  { name: "צפת", lat: 32.965, lon: 35.496, r: 4 },
  { name: "טבריה", lat: 32.795, lon: 35.531, r: 4 },
  { name: "נצרת", lat: 32.702, lon: 35.297, r: 4 },
  { name: "נוף הגליל", lat: 32.717, lon: 35.326, r: 3 },
  { name: "עפולה", lat: 32.608, lon: 35.289, r: 4 },
  { name: "בית שאן", lat: 32.497, lon: 35.497, r: 3 },
  { name: "קריית שמונה", lat: 33.207, lon: 35.571, r: 3.5 },
  { name: "אריאל", lat: 32.104, lon: 35.174, r: 3 },
  { name: "עמנואל", lat: 32.161, lon: 35.135, r: 2 },
  { name: "קריית ארבע", lat: 31.534, lon: 35.122, r: 2.5 },
  { name: "אפרת", lat: 31.656, lon: 35.153, r: 2.5 },
  { name: "נתב״ג", lat: 32.005, lon: 34.886, r: 3 }
];
function nearestPlace(lat, lon) {
  let best = null;
  let bestScore = Infinity;
  for (const p of PLACES) {
    const d = haversine({ lat, lon }, p);
    if (d > p.r) continue;
    const score = d / p.r;
    if (score < bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best ? { name: best.name, lat: best.lat, lon: best.lon } : null;
}
const PATH_STEP_KM = 0.25;
const MAX_PATH_POINTS = 300;
const round = (n) => Math.round(n * 1e4) / 1e4;
function addPathPoint(path, at, force = false) {
  const p = [round(at.lat), round(at.lon)];
  const list = path ?? [];
  const last = list[list.length - 1];
  if (last) {
    const d = haversine({ lat: last[0], lon: last[1] }, { lat: p[0], lon: p[1] });
    if (d < (force ? 0.02 : PATH_STEP_KM)) return list;
  }
  const next = [...list, p];
  return next.length > MAX_PATH_POINTS ? thin(next) : next;
}
function thin(path) {
  const out = path.filter((_, i) => i % 2 === 0);
  const last = path[path.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
function finishPath(cur) {
  const path = cur.last ? addPathPoint(cur.path, cur.last, true) : cur.path ?? [];
  return path.length >= 2 ? path : void 0;
}
const GAP_KM = 1.5;
function splitGaps(path) {
  const parts = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const gap = haversine({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] }) > GAP_KM;
    const cur = parts[parts.length - 1];
    if (cur && cur.gap === gap) cur.line.push(b);
    else parts.push({ line: [a, b], gap });
  }
  return parts;
}
function routedTrips(trips) {
  return trips.filter((t) => Array.isArray(t.path) && t.path.length >= 2).sort((a, b) => `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`));
}
function routeStops(trips) {
  const stops = [];
  const push = (p) => {
    const name = nearestPlace(p[0], p[1])?.name;
    if (name && stops[stops.length - 1] !== name) stops.push(name);
  };
  for (const t of routedTrips(trips)) {
    push(t.path[0]);
    push(t.path[t.path.length - 1]);
  }
  return stops;
}
function placeCounts(trips) {
  const counts = /* @__PURE__ */ new Map();
  for (const t of routedTrips(trips)) {
    for (const p of [t.path[0], t.path[t.path.length - 1]]) {
      const place = nearestPlace(p[0], p[1]);
      if (!place) continue;
      const cur = counts.get(place.name) ?? { ...place, count: 0 };
      cur.count += 1;
      counts.set(place.name, cur);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
const BETWEEN_IDLE_MS = 4 * 60 * 60 * 1e3;
const MIN_BETWEEN_KM = 0.1;
const MIN_BETWEEN_SECONDS = 60;
const isBetween = (trip) => trip?.kind === "between";
const isPrivate = (trip) => trip?.kind === "private";
const isSideDrive = (trip) => isBetween(trip) || isPrivate(trip);
const PRIVATE_IDLE_MS = 10 * 60 * 1e3;
const trackBetweenOn = (settings) => settings.trackBetween !== false;
const workTrips = (trips) => trips.filter((t) => !t.kind || t.kind === "work");
function startBetween(now, date, time) {
  return { kind: "between", startedAt: now, date, time, km: 0, lastMoveAt: now };
}
function betweenToTrip(cur, endAt, now = Date.now()) {
  const until = Math.max(cur.startedAt, Math.min(now, endAt));
  const seconds = Math.round((until - cur.startedAt) / 1e3);
  if (cur.km < MIN_BETWEEN_KM && seconds < MIN_BETWEEN_SECONDS) return null;
  return {
    kind: isPrivate(cur) ? "private" : "between",
    date: cur.date,
    time: cur.time,
    km: Math.round(cur.km * 100) / 100,
    seconds,
    waitSeconds: Math.min(seconds, Math.round(cur.waitSeconds ?? 0)),
    ...cur.idleSeconds ? { idleSeconds: Math.min(seconds, Math.round(cur.idleSeconds)) } : {},
    ...cur.auto !== void 0 ? { auto: true } : {},
    endedAt: new Date(until).toISOString(),
    path: finishPath(cur)
  };
}
function betweenIdleEnd(cur, now) {
  if (!isSideDrive(cur)) return null;
  const last = cur.lastMoveAt ?? cur.startedAt;
  return now - last >= (isPrivate(cur) ? PRIVATE_IDLE_MS : BETWEEN_IDLE_MS) ? last : null;
}
function workSecondsOn(trips, date, running) {
  const saved = trips.filter((t) => t.date === date && !isPrivate(t)).reduce((s, t) => s + (t.seconds || 0), 0);
  return saved + (running && running.date === date ? running.seconds : 0);
}
const STOP_REASONS = [
  { id: "wait", label: "המתנה לנוסע" },
  { id: "pickup", label: "איסוף / הורדה נוספת" },
  { id: "fuel", label: "תדלוק" },
  { id: "food", label: "הפסקת אוכל" },
  { id: "prayer", label: "תפילה" },
  { id: "rest", label: "מנוחה / שירותים" },
  { id: "other", label: "עצירה אחרת" }
];
const stopLabel = (reason) => STOP_REASONS.find((r) => r.id === reason)?.label ?? "עצירה";
const RESUME_AFTER_KM = 0.5;
function startStop(cur, reason, at) {
  const closed = closeStop(cur, at);
  return { ...closed, stop: { reason, at, km: closed.km } };
}
function closeStop(cur, at) {
  const stop = cur.stop;
  if (!stop) return cur;
  const seconds = Math.max(0, Math.round((at - stop.at) / 1e3));
  const next = { ...cur, stop: void 0 };
  if (stop.reason === "wait") next.waitSeconds = (cur.waitSeconds ?? 0) + seconds;
  else next.stops = { ...cur.stops, [stop.reason]: (cur.stops?.[stop.reason] ?? 0) + seconds };
  next.lastMoveAt = Math.max(cur.lastMoveAt ?? cur.startedAt, at);
  return next;
}
function resumeIfDriving(cur, now) {
  if (!cur.stop || cur.km - cur.stop.km < RESUME_AFTER_KM) return cur;
  return closeStop(cur, Math.min(now, cur.lastMoveAt ?? now));
}
function cleanStops(stops) {
  if (!stops) return void 0;
  const out = {};
  for (const r of STOP_REASONS) {
    const s = Math.round(stops[r.id] ?? 0);
    if (s > 0) out[r.id] = s;
  }
  return Object.keys(out).length ? out : void 0;
}
function sumStops(trips, fromDate) {
  const out = {};
  for (const t of trips) {
    if (t.date < fromDate) continue;
    if (t.waitSeconds) out.wait = (out.wait ?? 0) + t.waitSeconds;
    for (const r of STOP_REASONS) {
      const s = t.stops?.[r.id];
      if (s) out[r.id] = (out[r.id] ?? 0) + s;
    }
  }
  return out;
}
function stopsText(stops) {
  if (!stops) return "";
  return STOP_REASONS.filter((r) => r.id !== "wait" && (stops[r.id] ?? 0) >= 30).map((r) => `${r.label} ${Math.max(1, Math.round((stops[r.id] ?? 0) / 60))} ד׳`).join(" · ");
}
const isUnconfirmedAuto = (trip) => trip?.auto === true && (!trip.kind || trip.kind === "work");
function confirmAuto(cur) {
  return cur.auto ? { ...cur, auto: false } : cur;
}
function autoToSide(cur, kind, now = Date.now()) {
  const closed = closeStop(cur, now);
  return {
    ...closed,
    kind,
    auto: false,
    stop: void 0,
    stops: void 0,
    // A work trip's waiting is not "waiting for a ride"; standing is counted afresh.
    waitSeconds: void 0
  };
}
const MIN_SPEED_KMH = 15;
const SUSTAIN_MS = 2e4;
const BACKGROUND_NOTE = {
  title: "דרייבר מזהה נסיעות",
  message: "כשתתחיל לנסוע המדידה תתחיל לבד."
};
const two = (n) => String(n).padStart(2, "0");
const dateOf = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};
const timeOf = (ms) => {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
};
function DriveDetector() {
  const { data, ready } = useAppData();
  const navigate = useNavigate();
  const [active, setActive] = reactExports.useState(null);
  const [synced, setSynced] = reactExports.useState(false);
  const lastRef = reactExports.useRef(null);
  const runRef = reactExports.useRef(
    null
  );
  const [granted, setGranted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      setGranted(status.state === "granted");
      status.onchange = () => setGranted(status.state === "granted");
    }).catch(() => {
    });
  }, []);
  const setting = data.settings.autoDetectTrip;
  const enabled2 = ready && (setting === true || setting === void 0 && granted);
  const background = data.settings.detectInBackground === true && hasBackgroundTracking();
  reactExports.useEffect(() => {
    const sync = () => {
      setActive(readActive());
      setSynced(true);
    };
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const hasActive = !synced || Boolean(active);
  reactExports.useEffect(() => {
    if (!enabled2 || hasActive) return;
    lastRef.current = null;
    runRef.current = null;
    return watchLocation(
      (fix) => {
        if (fix.accuracy > 80) return;
        const point = { lat: fix.lat, lon: fix.lon, t: fix.time };
        const prev = lastRef.current;
        const step = prev ? haversine(prev, point) : 0;
        let speed = fix.speedKmh;
        if (speed == null && prev) {
          const dt = (point.t - prev.t) / 1e3;
          if (dt > 0) speed = step / dt * 3600;
        }
        lastRef.current = point;
        if (speed == null) return;
        const driving = speed >= MIN_SPEED_KMH && speed < 220;
        const now = Date.now();
        if (!driving) {
          runRef.current = null;
          return;
        }
        const run = runRef.current ?? { since: prev?.t ?? point.t, km: 0, from: prev ?? point };
        run.km += step;
        runRef.current = run;
        if (point.t - run.since < SUSTAIN_MS) return;
        runRef.current = null;
        if (readActive()) return;
        writeActive({
          auto: true,
          startedAt: run.since,
          date: dateOf(run.since),
          time: timeOf(run.since),
          km: run.km,
          lastMoveAt: now,
          last: { lat: fix.lat, lon: fix.lon, t: fix.time, acc: fix.accuracy },
          // The route starts where the car started moving, not where the drive was noticed.
          path: addPathPoint(addPathPoint(void 0, run.from), point, true)
        });
        requestNotifyPermission();
        notifyIfHidden("התחלתי למדוד נסיעה", "זוהתה נסיעה. בסוף אשאל אם זו הייתה נסיעת עבודה.");
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (document.visibilityState === "visible")
          void navigate({ to: "/trip", search: { mode: "drive" } });
      },
      () => {
      },
      {
        maximumAge: 5e3,
        timeout: 3e4,
        // Installed app, when the driver turned it on: watch with the app closed too.
        background: background ? BACKGROUND_NOTE : void 0
      }
    );
  }, [enabled2, hasActive, background, navigate]);
  if (!isUnconfirmedAuto(active) || active?.pausedAt) return null;
  const cur = active;
  const yes = () => {
    writeActive(confirmAuto(cur));
    toast.success("נסיעת עבודה · ממשיך למדוד");
  };
  const no = () => {
    writeActive(autoToSide(cur, "private"));
    toast("נסיעה פרטית · נמדדים ק״מ ודלק, לא נכנס לחישובי העבודה. נשמר לבד כשהרכב חונה.", {
      duration: 5e3,
      action: { label: "ביטול", onClick: () => writeActive(cur) }
    });
  };
  const between = () => {
    writeActive(autoToSide(cur, "between"));
    toast("נמדד כנסיעה בין נסיעות (רק ק״מ וזמן)");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-x-0 top-0 z-[70] px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]",
      role: "region",
      "aria-label": "נסיעה שזוהתה",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md rounded-2xl border-2 bg-card p-3 shadow-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "h-5 w-5 shrink-0 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "זוהתה נסיעה · מודד מ-",
            cur.time,
            ". נסיעת עבודה?"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `mt-2 grid gap-2 ${trackBetweenOn(data.settings) ? "grid-cols-3" : "grid-cols-2"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: yes,
                  className: "flex h-12 items-center justify-center gap-1 rounded-xl bg-primary text-sm font-bold text-primary-foreground",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
                    " כן, עבודה"
                  ]
                }
              ),
              trackBetweenOn(data.settings) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: between,
                  className: "h-12 rounded-xl bg-secondary px-1 text-xs font-semibold text-secondary-foreground",
                  children: "בדרך לנסיעה"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: no,
                  className: "flex h-12 items-center justify-center gap-1 rounded-xl border text-sm font-semibold",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                    " פרטית"
                  ]
                }
              )
            ]
          }
        )
      ] })
    }
  );
}
function bridge() {
  if (typeof window === "undefined") return null;
  const cap = window.Capacitor;
  return cap?.nativePromise && cap.Plugins?.AppUpdate ? cap : null;
}
function canSelfUpdate() {
  return bridge() !== null;
}
async function installedVersion() {
  const cap = bridge();
  if (!cap) return null;
  try {
    return (await cap.nativePromise("AppUpdate", "info")).versionName;
  } catch {
    return null;
  }
}
async function checkForUpdate() {
  const cap = bridge();
  if (!cap) return null;
  try {
    return await cap.nativePromise("AppUpdate", "check");
  } catch {
    return null;
  }
}
async function installUpdate() {
  const cap = bridge();
  if (!cap) return false;
  try {
    const r = await cap.nativePromise("AppUpdate", "install");
    if (r.status === "needs-permission") {
      toast.message("אשרו ל״דרייבר״ להתקין אפליקציות וחזרו. ההתקנה תמשיך לבד.");
    } else if (r.status === "up-to-date") {
      toast.success("יש לך את הגרסה האחרונה 👍");
      return false;
    } else {
      toast.message("לחצו ״עדכן״ במסך שנפתח. הנתונים נשמרים.");
    }
    return true;
  } catch {
    toast.error("ההורדה נכשלה. נסו שוב בעוד רגע.");
    return false;
  }
}
const RECHECK_MS = 60 * 60 * 1e3;
const DISMISS_KEY = "driver-update-dismissed";
function dismissedCode() {
  try {
    return Number(sessionStorage.getItem(DISMISS_KEY)) || 0;
  } catch {
    return 0;
  }
}
function UpdateBanner() {
  const [latest, setLatest] = reactExports.useState(null);
  const [driving, setDriving] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!canSelfUpdate()) return;
    let lastCheck = 0;
    const check = async () => {
      if (Date.now() - lastCheck < RECHECK_MS) return;
      lastCheck = Date.now();
      const r = await checkForUpdate();
      if (r?.available && r.latestCode && r.latestCode > dismissedCode()) {
        setLatest({ code: r.latestCode, name: r.latestName ?? "" });
      } else if (r && !r.available) {
        setLatest(null);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  reactExports.useEffect(() => {
    const sync = () => setDriving(isDrivingNow(readActive()));
    sync();
    window.addEventListener(ACTIVE_EVENT, sync);
    const t = window.setInterval(sync, 3e4);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.clearInterval(t);
    };
  }, []);
  if (!latest || driving) return null;
  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, String(latest.code));
    } catch {
    }
    setLatest(null);
  };
  const update = async () => {
    setBusy(true);
    await installUpdate();
    setBusy(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      role: "status",
      className: "fixed inset-x-0 top-0 z-[60] px-3 pt-[calc(0.4rem+env(safe-area-inset-top,0px))]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-xl items-center gap-2 rounded-full border border-primary/30 bg-card/95 py-1.5 pr-3 pl-1.5 text-sm shadow-md backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate", children: [
          "יש גרסה חדשה",
          latest.name ? ` (${latest.name})` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: update,
            disabled: busy,
            className: "flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              busy ? "מוריד…" : "עדכן"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: dismiss,
            "aria-label": "לא עכשיו",
            className: "rounded-full p-1 text-muted-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] })
    }
  );
}
const MAX_ACCURACY_M = 60;
const MIN_STEP_KM = 8e-3;
const MAX_SPEED_KMH = 220;
const FORGOT_AFTER_MS = 45 * 60 * 1e3;
function movementThresholdKm(prevAccM, curAccM) {
  const worst = Math.max(prevAccM ?? curAccM, curAccM);
  return Math.max(MIN_STEP_KM, worst / 1e3);
}
const STANDING_SPEED_KMH = 4;
function classifyStep(distKm, seconds, prevAccM, curAccM, speedKmh) {
  const threshold = movementThresholdKm(prevAccM, curAccM);
  if (distKm < threshold) return "stay";
  if (speedKmh != null && speedKmh < STANDING_SPEED_KMH && distKm < threshold * 3) return "stay";
  const speed = distKm / Math.max(1e-3, seconds) * 3600;
  return speed > MAX_SPEED_KMH ? "jump" : "move";
}
function looksForgotten(trip, now) {
  if (now < (trip.forgotSnoozeUntil ?? 0)) return false;
  return now - (trip.lastMoveAt ?? trip.startedAt) >= FORGOT_AFTER_MS;
}
function applyFix(cur, fix, now) {
  const acc = fix.accuracy;
  if (acc > MAX_ACCURACY_M) return null;
  const point = { lat: fix.lat, lon: fix.lon, t: fix.time, acc };
  if (cur.last) {
    const d = haversine(cur.last, point);
    const step = classifyStep(d, (point.t - cur.last.t) / 1e3, cur.last.acc, acc, fix.speedKmh);
    if (step === "move")
      return {
        ...cur,
        km: cur.km + d,
        last: point,
        lastMoveAt: now,
        path: addPathPoint(cur.path, point)
      };
    if (step === "stay") {
      return acc < (cur.last.acc ?? Infinity) ? { ...cur, last: { ...point, lat: cur.last.lat, lon: cur.last.lon } } : null;
    }
  }
  return cur.last ? { ...cur, last: point } : { ...cur, last: point, path: addPathPoint(cur.path, point) };
}
const GPS_ERROR_EVENT = "driver-trip-gps-error";
let gpsError = null;
function readGpsError() {
  return gpsError;
}
function setGpsError(message) {
  if (message === gpsError) return;
  gpsError = message;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(GPS_ERROR_EVENT));
}
const STAND_AFTER_MS = 2 * 60 * 1e3;
let battery = null;
let asked = false;
function chargingNow() {
  if (!asked && typeof navigator !== "undefined") {
    asked = true;
    const nav = navigator;
    nav.getBattery?.().then((b) => {
      battery = b;
    }).catch(() => {
    });
  }
  return battery ? battery.charging : null;
}
function engineOn(cur, byCharger, charging) {
  if (cur.engine) return cur.engine.on;
  if (byCharger && charging != null) return charging;
  return null;
}
function countStanding(cur, now, engine2) {
  const lastMove = cur.lastMoveAt ?? cur.startedAt;
  const next = { ...cur, standCountedAt: now };
  if (cur.engine && lastMove > cur.engine.at + 3e4) next.engine = void 0;
  const from = Math.max(cur.standCountedAt ?? cur.startedAt, lastMove + STAND_AFTER_MS);
  const add = Math.max(0, (now - from) / 1e3);
  if (add <= 0) return next;
  if (cur.kind === "between") next.waitSeconds = (cur.waitSeconds ?? 0) + add;
  const on = next.engine ? next.engine.on : engine2;
  if (on) next.idleSeconds = (cur.idleSeconds ?? 0) + add;
  return next;
}
const NOTIFICATION = {
  work: {
    title: "נסיעה פעילה",
    message: "דרייבר מודד ק״מ. פתח את האפליקציה כדי לסיים."
  },
  between: {
    title: "מדידה בין נסיעות",
    message: "דרייבר מודד ק״מ וזמן בין הנסיעות. פתח את האפליקציה כדי להתחיל נסיעה."
  },
  private: {
    title: "נסיעה פרטית",
    message: "דרייבר מודד ק״מ ודלק. נשמר לבד כשהרכב חונה."
  }
};
function TripWatcher() {
  const { data, addTrip } = useAppData();
  const addTripRef = reactExports.useRef(addTrip);
  addTripRef.current = addTrip;
  const byChargerRef = reactExports.useRef(false);
  byChargerRef.current = data.settings.engineByCharger === true;
  reactExports.useEffect(() => {
    let stop = null;
    let watchKind = null;
    let wake = null;
    const acquireWake = () => {
      if (wake || document.visibilityState !== "visible") return;
      const nav = navigator;
      nav.wakeLock?.request("screen").then((lock) => {
        if (!stop || watchKind !== "work") {
          lock.release().catch(() => {
          });
          return;
        }
        wake = lock;
        lock.addEventListener?.("release", () => {
          if (wake === lock) wake = null;
        });
      }).catch(() => {
      });
    };
    const releaseWake = () => {
      wake?.release().catch(() => {
      });
      wake = null;
    };
    const sync = () => {
      const cur = readActive();
      const want = Boolean(cur && !cur.pausedAt);
      const kind = cur?.kind === "between" || cur?.kind === "private" ? cur.kind : "work";
      if (stop && (!want || kind !== watchKind)) {
        stop();
        stop = null;
        watchKind = null;
        releaseWake();
        if (!want) setGpsError(null);
      }
      if (want && !stop) {
        watchKind = kind;
        stop = watchLocation(
          (fix) => {
            setGpsError(null);
            const trip = readActive();
            if (!trip || trip.pausedAt) return;
            const now = Date.now();
            const next = applyFix(trip, fix, now);
            if (next) writeActive(resumeIfDriving(next, now));
          },
          (err) => setGpsError(
            err.message === "no-geolocation" ? "המכשיר או הדפדפן לא תומכים באיתור מיקום." : err.kind === "denied" ? "אין הרשאת מיקום. אשר מיקום, או הזן את הק״מ ידנית בהזנת הכנסה." : "לא הצלחנו לקבל מיקום כרגע. בדוק שה-GPS דלוק."
          ),
          // Installed app: keeps measuring with the screen locked.
          { background: NOTIFICATION[kind] }
        );
        if (kind === "work") acquireWake();
      }
    };
    const closeIdleBetween = () => {
      const cur = readActive();
      if (!cur || cur.pausedAt) return;
      const now = Date.now();
      const end = betweenIdleEnd(cur, now);
      if (end === null) {
        writeActive(countStanding(cur, now, engineOn(cur, byChargerRef.current, chargingNow())));
        return;
      }
      writeActive(null);
      const trip = betweenToTrip(cur, end);
      if (trip) addTripRef.current(trip);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && stop && watchKind === "work") acquireWake();
    };
    closeIdleBetween();
    sync();
    const idleTimer = window.setInterval(closeIdleBetween, 3e4);
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(idleTimer);
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", onVisible);
      stop?.();
      stop = null;
      releaseWake();
    };
  }, []);
  return null;
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
function RewardEffects() {
  const canvasRef = reactExports.useRef(null);
  const particlesRef = reactExports.useRef([]);
  const frameRef = reactExports.useRef(0);
  const lastRef = reactExports.useRef(0);
  const [flash, setFlash] = reactExports.useState(null);
  const [mounted, setMounted] = reactExports.useState(false);
  const flashTimer = reactExports.useRef(null);
  reactExports.useEffect(() => setMounted(true), []);
  reactExports.useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return;
    const palette = () => {
      const css = getComputedStyle(document.documentElement);
      return ["--primary", "--hud-accent", "--warning", "--chart-2", "--card"].map(
        (token) => css.getPropertyValue(token).trim()
      );
    };
    const rootCss = getComputedStyle(document.documentElement);
    const gold = rootCss.getPropertyValue("--gold").trim() || "gold";
    const ink = rootCss.getPropertyValue("--ink").trim() || "black";
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (now) => {
      const dt = Math.min((now - (lastRef.current || now)) / 16.67, 2);
      lastRef.current = now;
      ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current = particlesRef.current.filter(
        (p) => p.life > 0 && p.y < window.innerHeight + 40
      );
      for (const p of particlesRef.current) {
        p.vx *= Math.pow(0.992, dt);
        p.vy += 0.15 * dt;
        p.x += p.vx * dt + Math.sin(now / 300 + p.tilt) * 0.32 * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vz *= Math.pow(0.96, dt);
        p.spin += p.spinSpeed * dt;
        p.life -= dt;
        const perspective = Math.max(0.55, Math.min(1.7, 1 + p.z / 220));
        const fade2 = Math.min(1, p.life / 22);
        const turn = Math.cos(p.spin);
        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.tilt + Math.sin(p.spin) * 0.3);
        ctx2.globalAlpha = fade2 * (0.68 + Math.abs(turn) * 0.32);
        ctx2.fillStyle = p.color;
        if (p.shape === "coin") {
          const w = Math.max(1.2, p.size * 1.25 * perspective * Math.abs(turn));
          const h = p.size * 1.25 * perspective;
          ctx2.fillStyle = gold;
          ctx2.strokeStyle = ink;
          ctx2.lineWidth = 1.6;
          ctx2.beginPath();
          ctx2.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.stroke();
          if (Math.abs(turn) > 0.45) {
            ctx2.beginPath();
            ctx2.ellipse(0, 0, w * 0.6, h * 0.6, 0, 0, Math.PI * 2);
            ctx2.stroke();
          }
        } else if (p.shape === "spark") {
          ctx2.shadowColor = p.color;
          ctx2.shadowBlur = 12;
          ctx2.beginPath();
          ctx2.ellipse(
            0,
            0,
            p.size * perspective * 0.42,
            p.size * perspective * 0.42,
            0,
            0,
            Math.PI * 2
          );
          ctx2.fill();
        } else if (p.shape === "ribbon") {
          ctx2.strokeStyle = p.color;
          ctx2.lineWidth = Math.max(0.7, Math.abs(turn) * 2.5 * perspective);
          ctx2.lineCap = "round";
          ctx2.beginPath();
          ctx2.moveTo(-p.size * perspective, -p.size * 0.5);
          ctx2.quadraticCurveTo(
            0,
            p.size * (1.3 + Math.sin(p.spin)),
            p.size * perspective,
            p.size * 0.3
          );
          ctx2.stroke();
        } else {
          ctx2.fillRect(
            -p.size * perspective / 2,
            -p.size * 0.32 * perspective,
            Math.max(0.7, p.size * perspective * Math.abs(turn)),
            p.size * 0.62 * perspective
          );
        }
        ctx2.restore();
      }
      if (particlesRef.current.length) frameRef.current = requestAnimationFrame(draw);
      else {
        frameRef.current = 0;
        lastRef.current = 0;
      }
    };
    const burst = (x, y, count, colors, power) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 3.9;
        const speed = (3 + Math.random() * 9) * power;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 140,
          vz: (Math.random() - 0.5) * 4,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.23,
          tilt: Math.random() * Math.PI * 2,
          size: 3 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: i % 4 === 0 ? "coin" : i % 7 === 0 ? "ribbon" : i % 5 === 0 ? "spark" : "foil",
          life: 58 + Math.random() * 65
        });
      }
      if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
    };
    const onReward = (event) => {
      const {
        kind,
        x: requestedX,
        y: requestedY,
        amount,
        currency
      } = event.detail;
      const ceremony = kind === "goal" || kind === "streak";
      const x = ceremony ? window.innerWidth / 2 : requestedX ?? window.innerWidth / 2;
      const y = ceremony ? window.innerHeight / 2 : requestedY ?? window.innerHeight * 0.38;
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlash({ kind, x, y, amount, currency, id: Date.now() });
      flashTimer.current = setTimeout(
        () => setFlash(null),
        ceremony ? 5200 : kind === "corrective" ? 3600 : 2600
      );
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const colors = palette();
      burst(
        x,
        ceremony ? y - 45 : y,
        ceremony ? 135 : kind === "trip" || kind === "break-even" ? 64 : kind === "corrective" ? 18 : 42,
        colors,
        ceremony ? 1.3 : kind === "corrective" ? 0.55 : 1
      );
      if (ceremony) {
        window.setTimeout(() => burst(x, y - 80, 90, colors, 1.1), 390);
      }
    };
    window.addEventListener("driver-reward", onReward);
    return () => {
      window.removeEventListener("driver-reward", onReward);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [mounted]);
  if (!mounted) return null;
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-layer", "aria-live": "polite", children: [
      flash && (flash.kind === "goal" || flash.kind === "streak") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reward-ceremony", dir: "rtl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "reward-ceremony-card",
          role: "status",
          "aria-label": flash.title ?? "הישג חדש",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-medal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-medal-orbit", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-medal-core", children: flash.kind === "streak" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { "aria-hidden": "true" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: flash.title ?? "כל הכבוד!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: flash.message ?? "הגעת ליעד היומי שלך!" }),
            typeof flash.amount === "number" && flash.amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-amount", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-amount-label", children: "נשמרו עכשיו" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { dir: "ltr", children: fmt(flash.amount, flash.currency) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reward-progress", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: flash.kind === "streak" ? "רצף עבודה" : "יעד יומי" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: flash.kind === "streak" ? `${flash.streak ?? 0} ימים` : "100%" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-progress-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "reward-continue", onClick: () => setFlash(null), children: "המשך לעבודה" })
          ]
        }
      ) }, flash.id),
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, "aria-hidden": "true" }),
      flash && flash.kind !== "corrective" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "comic-burst",
          style: { left: flash.x, top: flash.y },
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "-100 -100 200 200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                className: "comic-burst-star",
                d: "M0 -92 L18 -40 L70 -62 L40 -16 L94 6 L38 22 L60 74 L12 40 L-6 96 L-20 42 L-72 68 L-40 18 L-96 -6 L-42 -22 L-66 -70 L-16 -40 Z"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: flash.kind === "goal" ? "יֶעַד!" : flash.kind === "streak" ? "רֶצֶף!" : flash.kind === "trip" ? "וְרוּם!" : flash.kind === "break-even" ? "רֶוַח!" : "צ׳ינג!" })
          ]
        },
        `burst-${flash.id}`
      ),
      flash && flash.kind === "corrective" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "comic-burst comic-burst-oof",
          style: { left: flash.x, top: flash.y },
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "אוּף!" })
        },
        `oof-${flash.id}`
      ),
      flash && flash.kind !== "goal" && flash.kind !== "streak" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `reward-flash reward-flash-${flash.kind}`,
          style: { left: flash.x, top: flash.y },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-halo", "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "reward-ring", "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "reward-message", children: [
              flash.kind === "corrective" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { "aria-hidden": "true", size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { "aria-hidden": "true", size: 18 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: flash.title ?? (flash.kind === "trip" ? "נסיעה הושלמה" : flash.kind === "break-even" ? "עברת לרווח" : "ההכנסה נשמרה") }),
                flash.message && /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: flash.message })
              ] })
            ] })
          ]
        },
        flash.id
      )
    ] }),
    document.body
  );
}
const REWARD_CUES = {
  income: [
    { sound: "kaching", at: 0 },
    { sound: "smirk", at: 450 }
  ],
  trip: [
    { sound: "brake", at: 0 },
    { sound: "beep", at: 550 }
  ],
  "break-even": [
    { sound: "slide", at: 0 },
    { sound: "excited", at: 500 }
  ],
  goal: [
    { sound: "fanfare", at: 0 },
    { sound: "aooga", at: 750 },
    { sound: "victory", at: 1400 }
  ],
  streak: [
    { sound: "fanfare", at: 0 },
    { sound: "whistle", at: 600 }
  ],
  corrective: [
    { sound: "grumble", at: 0 },
    { sound: "womp", at: 650 }
  ]
};
const SCENE_CUES = {
  morning: [
    { sound: "rev", at: 0 },
    { sound: "brake", at: 1700 },
    { sound: "sleepy", at: 2200 },
    { sound: "shock", at: 4600 },
    { sound: "splash", at: 4750 },
    { sound: "grumble", at: 5600 },
    { sound: "aooga", at: 7200 },
    { sound: "yes", at: 7700 }
  ],
  wipe: [
    { sound: "tune", at: 200 },
    { sound: "beep", at: 5400 }
  ],
  count: [
    { sound: "one", at: 100 },
    { sound: "two", at: 1600 },
    { sound: "three", at: 3100 },
    { sound: "kaching", at: 3400 }
  ],
  phone: [
    { sound: "phone", at: 0 },
    { sound: "yes", at: 1300 },
    { sound: "rev", at: 4600 }
  ],
  snooze: [
    { sound: "snore", at: 400 },
    { sound: "aooga", at: 4400 },
    { sound: "shock", at: 4650 },
    { sound: "smirk", at: 6200 }
  ],
  drive: [
    { sound: "rev", at: 0 },
    { sound: "beep", at: 1800 },
    { sound: "aooga", at: 4200 }
  ],
  brake: [
    { sound: "rev", at: 0 },
    { sound: "brake", at: 2300 },
    { sound: "boing", at: 3200 },
    { sound: "shock", at: 3350 },
    { sound: "cough", at: 3600 },
    { sound: "sigh", at: 5e3 }
  ]
};
const FILM_SCENE_CUES = {
  morning: [
    { sound: "rev", at: 0 },
    { sound: "sleepy", at: 200 },
    { sound: "brake", at: 1150 },
    { sound: "boing", at: 2e3 },
    { sound: "cough", at: 2400 },
    { sound: "splash", at: 2600 },
    { sound: "shock", at: 3250 },
    { sound: "grumble", at: 4e3 },
    { sound: "aooga", at: 7200 },
    { sound: "yes", at: 7700 }
  ],
  wipe: [
    { sound: "tune", at: 200 },
    { sound: "beep", at: 4500 }
  ],
  count: [
    { sound: "one", at: 450 },
    { sound: "two", at: 1600 },
    { sound: "three", at: 2450 },
    { sound: "kaching", at: 2900 }
  ],
  phone: [
    { sound: "phone", at: 0 },
    { sound: "yes", at: 2500 },
    { sound: "rev", at: 4700 }
  ],
  snooze: [
    { sound: "snore", at: 1300 },
    { sound: "aooga", at: 3300 },
    { sound: "shock", at: 3450 },
    { sound: "smirk", at: 4600 }
  ]
};
function sceneCues(name, filmed = false) {
  const film = filmed ? FILM_SCENE_CUES[name] : void 0;
  return film ?? SCENE_CUES[name];
}
const MOOD_MUMBLE = {
  sleepy: "sleepy",
  grumble: "grumble",
  smirk: "smirk",
  victory: "victory",
  excited: "excited",
  shock: "shock",
  pain: "pain"
};
const TAXI_VOICE = {
  happy: "beep",
  tired: "sigh",
  zoom: "rev",
  honk: "aooga",
  cough: "cough",
  shock: "boing"
};
const AMBIENT_GAP_MS = 12e4;
const AMBIENT_IDLE_MS = 9e4;
function canPlay(g) {
  return g.enabled && g.running && !g.hidden && !g.driving;
}
function ambientAllowed(a) {
  if (a.tripActive) return false;
  if (a.force) return true;
  return a.now - a.lastGesture <= AMBIENT_IDLE_MS && a.now - a.lastAmbient >= AMBIENT_GAP_MS;
}
const SOUND_KEY = "driver-sound";
function readSoundPref() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}
function writeSoundPref(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
  }
}
const TAKES = {
  grumble: ["grumble-1", "grumble-2"],
  smirk: ["smirk-1", "smirk-2"],
  sleepy: ["sleepy-1", "sleepy-2"],
  shock: ["shock-1", "shock-2"],
  victory: ["victory-1", "victory-2"],
  excited: ["excited-1", "excited-2"],
  pain: ["pain-1", "pain-2"],
  yes: ["yes"],
  one: ["one"],
  two: ["two"],
  three: ["three"],
  tune: ["tune"],
  snore: ["snore"]
};
const isRecorded = (name) => name in TAKES;
const takeUrl = (take) => `/sounds/captain/${take}.mp3`;
function chooseTake(takes, last, random = Math.random) {
  const pool = takes.length > 1 ? takes.filter((t) => t !== last) : takes;
  return pool[Math.floor(random() * pool.length)];
}
const buffers = /* @__PURE__ */ new Map();
const lastPlayed = /* @__PURE__ */ new Map();
let loading = null;
let decoder = null;
function decoderContext() {
  if (decoder || typeof window === "undefined") return decoder;
  const OAC = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
  return decoder = OAC ? new OAC(1, 1, 48e3) : null;
}
function decode(ctx2, data) {
  return new Promise((resolve) => {
    ctx2.decodeAudioData(data, resolve, () => resolve(null))?.catch(() => {
    });
  });
}
async function loadTake(take) {
  const data = await fetch(takeUrl(take)).then((r) => r.ok ? r.arrayBuffer() : null).catch(() => null);
  const ctx2 = data && decoderContext();
  const buffer = ctx2 && await decode(ctx2, data);
  if (buffer) buffers.set(take, buffer);
}
function loadTakes() {
  if (!loading) {
    const done = () => {
      loading = null;
    };
    const missing = Object.values(TAKES).flat().filter((take) => !buffers.has(take));
    loading = Promise.all(missing.map(loadTake)).then(done, done);
  }
  return loading;
}
function pickTake(name) {
  const ready = TAKES[name].flatMap((take2) => buffers.get(take2) ?? []);
  const take = chooseTake(ready, lastPlayed.get(name)) ?? null;
  if (take) lastPlayed.set(name, take);
  return take;
}
function playTake(o, buffer) {
  const src = o.ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(o.dest);
  src.start(o.t);
  return buffer.duration;
}
const semis = (base, n) => base * 2 ** (n / 12);
function ramp(param, t0, points) {
  const [first, ...rest] = points;
  param.cancelScheduledValues(t0);
  param.setValueAtTime(first[1], t0 + first[0]);
  for (const [dt, v] of rest) param.linearRampToValueAtTime(v, t0 + dt);
}
function strike(param, at, peak, decay, attack = 4e-3) {
  param.setValueAtTime(1e-4, at);
  param.linearRampToValueAtTime(peak, at + attack);
  param.setTargetAtTime(1e-4, at + attack, decay / 4);
}
function gain(o, value = 0) {
  const g = o.ctx.createGain();
  g.gain.value = value;
  return g;
}
function osc(o, type, freq, start, stop) {
  const n = o.ctx.createOscillator();
  n.type = type;
  n.frequency.value = freq;
  n.start(o.t + start);
  n.stop(o.t + stop);
  return n;
}
function filter(o, type, freq, q = 0.7) {
  const f = o.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}
const noiseBuffers = /* @__PURE__ */ new WeakMap();
function noise(o, start, stop) {
  let buffer = noiseBuffers.get(o.ctx);
  if (!buffer) {
    buffer = o.ctx.createBuffer(1, o.ctx.sampleRate * 2, o.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 7;
    for (let i = 0; i < data.length; i++) {
      seed = seed * 16807 % 2147483647;
      data[i] = seed / 10737418235e-1 - 1;
    }
    noiseBuffers.set(o.ctx, buffer);
  }
  const src = o.ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start(o.t + start, start * 0.37 % 1.5);
  src.stop(o.t + stop);
  return src;
}
function lfo(o, target, rate, depth, start, stop) {
  const l = osc(o, "sine", rate, start, stop);
  const d = gain(o, depth);
  l.connect(d).connect(target);
  return d;
}
function drive(o, amount) {
  const ws = o.ctx.createWaveShaper();
  const n = 1024;
  const shape = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1) * 2 - 1;
    shape[i] = Math.tanh(amount * x) / Math.tanh(amount);
  }
  ws.curve = shape;
  ws.oversample = "2x";
  return ws;
}
function whistle(notes, base) {
  return (o) => {
    const total = notes.reduce((s, [, d]) => s + d, 0) + 0.12;
    const tone = osc(o, "sine", semis(base, notes[0][0]), 0, total);
    lfo(o, tone.detune, 6.2, 22, 0, total);
    const air = noise(o, 0, total);
    const airBand = filter(o, "bandpass", semis(base, notes[0][0]), 14);
    const toneAmp = gain(o, 0);
    const airAmp = gain(o, 0);
    tone.connect(toneAmp).connect(o.dest);
    air.connect(airBand).connect(airAmp).connect(o.dest);
    let at = 0.04;
    notes.forEach(([n, d], i) => {
      const T = o.t + at;
      const f = semis(base, n);
      tone.frequency.setValueAtTime(i === 0 ? f : semis(base, notes[i - 1][0]), T);
      tone.frequency.linearRampToValueAtTime(f, T + Math.min(0.05, d / 3));
      airBand.frequency.setValueAtTime(f, T);
      if (i === 0) toneAmp.gain.setValueAtTime(0, T);
      else toneAmp.gain.linearRampToValueAtTime(0.18, T);
      toneAmp.gain.linearRampToValueAtTime(0.32, T + 0.025);
      toneAmp.gain.setValueAtTime(0.32, T + d - 0.02);
      airAmp.gain.setValueAtTime(0.05, T);
      at += d;
    });
    toneAmp.gain.linearRampToValueAtTime(0, o.t + at + 0.06);
    airAmp.gain.linearRampToValueAtTime(0, o.t + at + 0.06);
    return total;
  };
}
function engine(o, start, len, pitch, amp) {
  const t0 = o.t + start;
  const scaled = (k) => pitch.map(([t, f]) => [t, f * k]);
  const saw = osc(o, "sawtooth", pitch[0][1], start, start + len);
  const sub = osc(o, "square", pitch[0][1] / 2, start, start + len);
  const chug = osc(o, "square", pitch[0][1] / 6, start, start + len);
  ramp(saw.frequency, t0, pitch);
  ramp(sub.frequency, t0, scaled(1 / 2));
  ramp(chug.frequency, t0, scaled(1 / 6));
  const mix = gain(o, 0.5);
  saw.connect(mix);
  sub.connect(mix);
  const tone = filter(o, "lowpass", pitch[0][1] * 7, 2);
  ramp(tone.frequency, t0, scaled(7));
  const body2 = gain(o, 0.62);
  const chugDepth = gain(o, 0.38);
  const chugRound = filter(o, "lowpass", 80);
  chug.connect(chugRound).connect(chugDepth).connect(body2.gain);
  const env = gain(o, 0);
  ramp(env.gain, t0, amp);
  mix.connect(drive(o, 2)).connect(tone).connect(body2).connect(env).connect(o.dest);
}
const aooga = (o) => {
  const len = 0.95;
  const saw = osc(o, "sawtooth", 170, 0, len);
  const sq = osc(o, "square", 170, 0, len);
  sq.detune.value = 9;
  const sweep = [
    [0, 170],
    [0.3, 400],
    [0.42, 380],
    [0.5, 330],
    [len, 300]
  ];
  ramp(saw.frequency, o.t, sweep);
  ramp(sq.frequency, o.t, sweep);
  const mix = gain(o, 0.5);
  saw.connect(mix);
  sq.connect(mix);
  const horn = filter(o, "bandpass", 800, 1.6);
  ramp(horn.frequency, o.t, [
    [0, 600],
    [0.3, 1250],
    [0.45, 900],
    [0.55, 1100],
    [len, 950]
  ]);
  const tone = filter(o, "lowpass", 3e3);
  const env = gain(o, 0);
  ramp(env.gain, o.t, [
    [0, 0],
    [0.03, 0.7],
    [0.4, 0.75],
    [0.46, 0.35],
    [0.52, 0.8],
    [len - 0.1, 0.7],
    [len, 0]
  ]);
  mix.connect(drive(o, 3)).connect(horn).connect(tone).connect(env).connect(o.dest);
  return len;
};
const beep = (o) => {
  for (const [at, len] of [
    [0, 0.13],
    [0.2, 0.17]
  ]) {
    const a = osc(o, "square", 415, at, at + len);
    const b = osc(o, "square", 523, at, at + len);
    const mix = gain(o, 0.5);
    a.connect(mix);
    b.connect(mix);
    const horn = filter(o, "bandpass", 1100, 0.9);
    const env = gain(o, 0);
    ramp(env.gain, o.t + at, [
      [0, 0],
      [0.01, 0.6],
      [len - 0.03, 0.5],
      [len, 0]
    ]);
    mix.connect(horn).connect(drive(o, 2)).connect(env).connect(o.dest);
  }
  return 0.4;
};
const turboStart = (o) => {
  const crankLen = 1.05;
  const crank = osc(o, "sawtooth", 80, 0, crankLen);
  ramp(crank.frequency, o.t, [
    [0, 80],
    [1, 104]
  ]);
  const crankTone = filter(o, "lowpass", 900, 1);
  const crankAmp = gain(o, 0);
  const grind = noise(o, 0, crankLen);
  const grindBand = filter(o, "bandpass", 1500, 0.8);
  const grindAmp = gain(o, 0);
  crankAmp.gain.setValueAtTime(0, o.t);
  grindAmp.gain.setValueAtTime(0, o.t);
  for (let i = 0; i < 6; i++) {
    const at = o.t + 0.05 + i * 0.16;
    crankAmp.gain.setValueAtTime(0.06, at);
    crankAmp.gain.linearRampToValueAtTime(0.7, at + 0.04);
    crankAmp.gain.linearRampToValueAtTime(0.08, at + 0.14);
    grindAmp.gain.setValueAtTime(0.02, at);
    grindAmp.gain.linearRampToValueAtTime(0.12, at + 0.04);
    grindAmp.gain.linearRampToValueAtTime(0.03, at + 0.14);
  }
  crankAmp.gain.linearRampToValueAtTime(0, o.t + crankLen);
  grindAmp.gain.linearRampToValueAtTime(0, o.t + crankLen);
  crank.connect(crankTone).connect(crankAmp).connect(o.dest);
  grind.connect(grindBand).connect(grindAmp).connect(o.dest);
  engine(
    o,
    crankLen,
    1.45,
    [
      [0, 50],
      [0.25, 140],
      [0.6, 72],
      [1.45, 60]
    ],
    [
      [0, 0],
      [0.05, 0.62],
      [0.5, 0.5],
      [1.2, 0.38],
      [1.45, 0]
    ]
  );
  return crankLen + 1.45;
};
const rev = (o) => {
  engine(
    o,
    0,
    1.2,
    [
      [0, 60],
      [0.35, 190],
      [0.7, 150],
      [1.2, 70]
    ],
    [
      [0, 0],
      [0.05, 0.6],
      [0.4, 0.85],
      [1, 0.5],
      [1.2, 0]
    ]
  );
  return 1.2;
};
const brake = (o) => {
  const len = 0.8;
  const squeal = osc(o, "sine", 2650, 0, len);
  ramp(squeal.frequency, o.t, [
    [0, 2750],
    [len, 2500]
  ]);
  lfo(o, squeal.frequency, 11, 45, 0, len);
  const squeal2 = osc(o, "sine", 3980, 0, len);
  const sq2Amp = gain(o, 0.3);
  const squealAmp = gain(o, 0);
  ramp(squealAmp.gain, o.t, [
    [0, 0],
    [0.06, 0.12],
    [0.55, 0.11],
    [0.75, 0]
  ]);
  squeal.connect(squealAmp);
  squeal2.connect(sq2Amp).connect(squealAmp);
  squealAmp.connect(o.dest);
  const skid = noise(o, 0, len);
  const skidBand = filter(o, "bandpass", 1700, 0.6);
  const skidAmp = gain(o, 0);
  ramp(skidAmp.gain, o.t, [
    [0, 0],
    [0.05, 0.35],
    [0.6, 0.25],
    [0.78, 0]
  ]);
  skid.connect(skidBand).connect(skidAmp).connect(o.dest);
  const thunk = osc(o, "sine", 95, 0.72, 1.1);
  ramp(thunk.frequency, o.t, [
    [0.72, 95],
    [0.9, 55]
  ]);
  const thunkAmp = gain(o, 0);
  strike(thunkAmp.gain, o.t + 0.72, 0.7, 0.28);
  thunk.connect(thunkAmp).connect(o.dest);
  return 1.05;
};
const cough = (o) => {
  for (const at of [0, 0.32]) {
    const T = o.t + at;
    const pop = noise(o, at, at + 0.25);
    const popTone = filter(o, "lowpass", 1400);
    const popAmp = gain(o, 0);
    strike(popAmp.gain, T, 0.55, 0.14, 4e-3);
    pop.connect(popTone).connect(popAmp).connect(o.dest);
    const boom = osc(o, "sine", 90, at, at + 0.3);
    ramp(boom.frequency, T, [
      [0, 90],
      [0.15, 45]
    ]);
    const boomAmp = gain(o, 0);
    strike(boomAmp.gain, T, 0.6, 0.22, 4e-3);
    boom.connect(boomAmp).connect(o.dest);
    const puff = noise(o, at + 0.03, at + 0.3);
    const puffBand = filter(o, "bandpass", 600, 1.2);
    const puffAmp = gain(o, 0);
    ramp(puffAmp.gain, T, [
      [0.03, 0],
      [0.08, 0.25],
      [0.3, 0]
    ]);
    puff.connect(puffBand).connect(puffAmp).connect(o.dest);
  }
  return 0.7;
};
const sigh = (o) => {
  const len = 1.05;
  const air = noise(o, 0, len);
  const band = filter(o, "bandpass", 1800, 1.2);
  ramp(band.frequency, o.t, [
    [0, 1800],
    [len, 350]
  ]);
  const airAmp = gain(o, 0);
  ramp(airAmp.gain, o.t, [
    [0, 0],
    [0.08, 0.5],
    [0.6, 0.35],
    [len, 0]
  ]);
  air.connect(band).connect(airAmp).connect(o.dest);
  const groan = osc(o, "triangle", 140, 0, len);
  ramp(groan.frequency, o.t, [
    [0, 140],
    [len, 45]
  ]);
  const groanAmp = gain(o, 0);
  ramp(groanAmp.gain, o.t, [
    [0, 0],
    [0.1, 0.4],
    [0.8, 0.3],
    [len, 0]
  ]);
  groan.connect(groanAmp).connect(o.dest);
  return len;
};
const boing = (o) => {
  const len = 0.6;
  const spring = osc(o, "sine", 220, 0, len);
  ramp(spring.frequency, o.t, [
    [0, 220],
    [len, 330]
  ]);
  const wobble = lfo(o, spring.frequency, 16, 90, 0, len);
  ramp(wobble.gain, o.t, [
    [0, 90],
    [len, 0]
  ]);
  const amp = gain(o, 0);
  strike(amp.gain, o.t, 0.7, 0.55);
  spring.connect(amp).connect(o.dest);
  return len;
};
const kaching = (o) => {
  const clack = noise(o, 0, 0.1);
  const clackTone = filter(o, "highpass", 2500);
  const clackAmp = gain(o, 0);
  strike(clackAmp.gain, o.t, 0.5, 0.04, 1e-3);
  clack.connect(clackTone).connect(clackAmp).connect(o.dest);
  const knock = osc(o, "sine", 180, 0, 0.12);
  const knockAmp = gain(o, 0);
  strike(knockAmp.gain, o.t, 0.4, 0.05, 1e-3);
  knock.connect(knockAmp).connect(o.dest);
  for (const [at, peak] of [
    [0.07, 0.45],
    [0.16, 0.3]
  ]) {
    for (const [f, k] of [
      [2093, 1],
      [3136, 0.6],
      [4186, 0.35],
      [5274, 0.2]
    ]) {
      const bell = osc(o, "sine", f, at, at + 1.2);
      const g = gain(o, 0);
      strike(g.gain, o.t + at, peak * k, 0.9, 2e-3);
      bell.connect(g).connect(o.dest);
    }
  }
  return 1.3;
};
const slide = (o) => {
  const len = 0.6;
  const pipe = osc(o, "sine", 450, 0, len);
  ramp(pipe.frequency, o.t, [
    [0, 450],
    [0.45, 1500],
    [0.52, 1440]
  ]);
  lfo(o, pipe.detune, 7, 20, 0, len);
  const amp = gain(o, 0);
  ramp(amp.gain, o.t, [
    [0, 0],
    [0.04, 0.4],
    [0.48, 0.4],
    [len, 0]
  ]);
  pipe.connect(amp).connect(o.dest);
  const air = noise(o, 0, len);
  const airBand = filter(o, "bandpass", 450, 10);
  ramp(airBand.frequency, o.t, [
    [0, 450],
    [0.45, 1500]
  ]);
  const airAmp = gain(o, 0);
  ramp(airAmp.gain, o.t, [
    [0, 0],
    [0.04, 0.12],
    [0.48, 0.1],
    [len, 0]
  ]);
  air.connect(airBand).connect(airAmp).connect(o.dest);
  return len;
};
const womp = (o) => {
  const notes = [
    [233.1, 0.3],
    [220, 0.3],
    [207.7, 0.3],
    [196, 1]
  ];
  const len = notes.reduce((s, [, d]) => s + d, 0) + 0.05;
  const horn = osc(o, "sawtooth", notes[0][0], 0, len);
  const tone = filter(o, "lowpass", 400, 4);
  const amp = gain(o, 0);
  const shake = lfo(o, horn.detune, 5.5, 0, 0, len);
  let at = 0;
  for (const [f, d] of notes) {
    const T = o.t + at;
    horn.frequency.setValueAtTime(f * 0.977, T);
    horn.frequency.linearRampToValueAtTime(f, T + 0.06);
    tone.frequency.setValueAtTime(350, T);
    tone.frequency.linearRampToValueAtTime(1300, T + 0.09);
    tone.frequency.linearRampToValueAtTime(700, T + d - 0.04);
    amp.gain.setValueAtTime(0.05, T);
    amp.gain.linearRampToValueAtTime(0.5, T + 0.04);
    amp.gain.linearRampToValueAtTime(0.4, T + d - 0.04);
    amp.gain.linearRampToValueAtTime(0.05, T + d);
    at += d;
  }
  shake.gain.setValueAtTime(0, o.t + 0.9);
  shake.gain.linearRampToValueAtTime(40, o.t + 1.4);
  amp.gain.linearRampToValueAtTime(0, o.t + len);
  horn.connect(tone).connect(amp).connect(o.dest);
  return len;
};
const phone = (o) => {
  for (const at of [0, 0.62]) {
    const len = 0.45;
    const bell = gain(o, 0.5);
    for (const [f, k] of [
      [1150, 1],
      [1460, 0.7],
      [2300, 0.3]
    ]) {
      const s = osc(o, "sine", f, at, at + len);
      const g = gain(o, k);
      s.connect(g).connect(bell);
    }
    const clapper = gain(o, 0.5);
    lfo(o, clapper.gain, 22, 0.5, at, at + len);
    const env = gain(o, 0);
    ramp(env.gain, o.t + at, [
      [0, 0],
      [0.01, 0.35],
      [len - 0.03, 0.3],
      [len, 0]
    ]);
    bell.connect(clapper).connect(env).connect(o.dest);
  }
  return 1.1;
};
const splash = (o) => {
  const wash = noise(o, 0, 0.6);
  const tone = filter(o, "lowpass", 3e3);
  ramp(tone.frequency, o.t, [
    [0, 3e3],
    [0.45, 700]
  ]);
  const amp = gain(o, 0);
  strike(amp.gain, o.t, 0.7, 0.45, 5e-3);
  wash.connect(tone).connect(amp).connect(o.dest);
  for (const [at, f] of [
    [0.05, 520],
    [0.11, 760],
    [0.16, 610],
    [0.22, 900],
    [0.29, 680],
    [0.35, 1050]
  ]) {
    const bubble = osc(o, "sine", f, at, at + 0.07);
    ramp(bubble.frequency, o.t + at, [
      [0, f],
      [0.06, f * 1.6]
    ]);
    const g = gain(o, 0);
    strike(g.gain, o.t + at, 0.18, 0.06, 3e-3);
    bubble.connect(g).connect(o.dest);
  }
  return 0.6;
};
function mallet(o, at, f, peak, decay) {
  const T = o.t + at;
  const bar = osc(o, "sine", f, at, at + decay * 1.6);
  const barAmp = gain(o, 0);
  strike(barAmp.gain, T, peak, decay, 2e-3);
  bar.connect(barAmp).connect(o.dest);
  const over = osc(o, "sine", f * 3, at, at + decay);
  const overAmp = gain(o, 0);
  strike(overAmp.gain, T, peak * 0.3, decay * 0.35, 2e-3);
  over.connect(overAmp).connect(o.dest);
  const click = noise(o, at, at + 0.04);
  const clickBand = filter(o, "bandpass", f * 2, 2);
  const clickAmp = gain(o, 0);
  strike(clickAmp.gain, T, peak * 0.5, 0.02, 1e-3);
  click.connect(clickBand).connect(clickAmp).connect(o.dest);
}
const fanfare = (o) => {
  const run = [523.25, 659.25, 783.99, 1046.5];
  run.forEach((f, i) => mallet(o, i * 0.11, f, 0.42, 0.3));
  run.forEach((f) => mallet(o, 0.5, f, 0.26, 0.9));
  run.forEach((f) => mallet(o, 0.62, f, 0.12, 0.8));
  return 2.1;
};
const RAW = {
  whistle: whistle(
    [
      [0, 0.12],
      [4, 0.12],
      [7, 0.12],
      [12, 0.24],
      [11, 0.12],
      [7, 0.12],
      [9, 0.12],
      [7, 0.4]
    ],
    880
  ),
  aooga,
  beep,
  "turbo-start": turboStart,
  rev,
  brake,
  cough,
  sigh,
  boing,
  kaching,
  slide,
  womp,
  phone,
  splash,
  fanfare
};
const TRIM = {
  whistle: 0.62,
  aooga: 0.72,
  beep: 0.67,
  "turbo-start": 1.4,
  brake: 1.2,
  cough: 1.5,
  sigh: 1.16,
  kaching: 0.56,
  slide: 0.57,
  phone: 1.33,
  splash: 0.83,
  fanfare: 0.66
};
function trimmed(voice, k) {
  if (k === 1) return voice;
  return (o) => {
    const g = gain(o, k);
    g.connect(o.dest);
    return voice({ ...o, dest: g });
  };
}
const SOUNDS = Object.fromEntries(
  Object.keys(RAW).map((name) => [name, trimmed(RAW[name], TRIM[name] ?? 1)])
);
const MASTER = 0.85;
const AMBIENT_VOLUME = 0.6;
const GESTURE_WINDOW_MS = 1e3;
let ctx = null;
let bus = null;
let enabled = null;
let lastGesture = 0;
let lastAmbient = Number.NEGATIVE_INFINITY;
const playing = /* @__PURE__ */ new Set();
function soundEnabled() {
  enabled ??= readSoundPref();
  return enabled;
}
function refreshSoundPref() {
  enabled = readSoundPref();
  if (!enabled) hushSound();
}
function audio() {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: "interactive" });
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 6;
  limiter.ratio.value = 10;
  limiter.attack.value = 3e-3;
  limiter.release.value = 0.15;
  bus = ctx.createGain();
  bus.gain.value = MASTER;
  bus.connect(limiter).connect(ctx.destination);
  return ctx;
}
function unlockSound() {
  lastGesture = Date.now();
  if (!soundEnabled()) return;
  void loadTakes();
  const c = audio();
  if (c && c.state !== "running") void c.resume().catch(() => {
  });
}
function setSoundEnabled(on) {
  enabled = on;
  writeSoundPref(on);
  if (on) unlockSound();
  else hushSound();
}
const inDriveMode = () => document.querySelector(".drive-hud") !== null;
function fade(g) {
  if (!ctx) return;
  g.gain.cancelScheduledValues(ctx.currentTime);
  g.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
}
function voiceFor(name) {
  if (!isRecorded(name)) return SOUNDS[name];
  const take = pickTake(name);
  return take && ((o) => playTake(o, take));
}
function playSound(name, { volume = 1, ambient = false } = {}) {
  const c = ctx;
  if (!c || !bus) return null;
  const running = c.state === "running" || Date.now() - lastGesture < GESTURE_WINDOW_MS;
  if (!canPlay({ enabled: soundEnabled(), running, hidden: document.hidden, driving: inDriveMode() }))
    return null;
  const voice = voiceFor(name);
  if (!voice) return null;
  const g = c.createGain();
  g.gain.value = volume * (ambient ? AMBIENT_VOLUME : 1);
  g.connect(bus);
  playing.add(g);
  const length = voice({ ctx: c, dest: g, t: c.currentTime + 0.02 });
  window.setTimeout(
    () => {
      g.disconnect();
      playing.delete(g);
    },
    (length + 0.4) * 1e3
  );
  return g;
}
function playCues(cues, { ambient = false } = {}) {
  const voiced = [];
  const timers = cues.map(
    (cue) => window.setTimeout(() => {
      const g = playSound(cue.sound, { volume: cue.volume, ambient });
      if (g) voiced.push(g);
    }, cue.at)
  );
  return {
    stop: () => {
      timers.forEach((t) => window.clearTimeout(t));
      voiced.forEach(fade);
    }
  };
}
function claimAmbient(force = false) {
  const now = Date.now();
  if (!ambientAllowed({
    now,
    lastGesture,
    lastAmbient,
    tripActive: isDrivingNow(readActive()),
    force
  }))
    return false;
  lastAmbient = now;
  return true;
}
function hushSound() {
  playing.forEach(fade);
}
function suspendSound() {
  hushSound();
  void ctx?.suspend().catch(() => {
  });
}
function resumeSound() {
  if (ctx && lastGesture && soundEnabled()) void ctx.resume().catch(() => {
  });
}
function SoundDirector() {
  reactExports.useEffect(() => {
    const onGesture = () => unlockSound();
    const onReward = (e) => {
      const kind = e.detail?.kind;
      if (kind && REWARD_CUES[kind]) playCues(REWARD_CUES[kind]);
    };
    const onVisibility = () => document.hidden ? suspendSound() : resumeSound();
    const onStorage = (e) => {
      if (e.key === SOUND_KEY) refreshSoundPref();
    };
    const gesture = { capture: true, passive: true };
    window.addEventListener("pointerdown", onGesture, gesture);
    window.addEventListener("touchend", onGesture, gesture);
    window.addEventListener("keydown", onGesture, gesture);
    window.addEventListener("driver-reward", onReward);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const prefetch = window.setTimeout(() => soundEnabled() && loadTakes(), 2e3);
    return () => {
      window.clearTimeout(prefetch);
      window.removeEventListener("pointerdown", onGesture, gesture);
      window.removeEventListener("touchend", onGesture, gesture);
      window.removeEventListener("keydown", onGesture, gesture);
      window.removeEventListener("driver-reward", onReward);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return null;
}
function InkWorld() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "0", height: "0", style: { position: "absolute" }, "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "ink-boil", x: "-5%", y: "-5%", width: "110%", height: "110%", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.035", numOctaves: "2", seed: "1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("feDisplacementMap", { in: "SourceGraphic", scale: "2.6" })
  ] }) }) });
}
function ComicBubble({
  children,
  side = "start",
  tone = "default",
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `comic-bubble comic-bubble-${side} comic-bubble-${tone} ${className}`, children });
}
function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 864e5
  ) + 1;
}
function sunTimes(date) {
  const season = Math.sin(2 * Math.PI * (dayOfYear(date) - 80) / 365);
  return { sunrise: 6.05 - 0.55 * season, sunset: 18.25 + 1.58 * season };
}
function skyPhase(date) {
  const { sunrise, sunset } = sunTimes(date);
  const h = date.getHours() + date.getMinutes() / 60;
  if (h < sunrise - 0.4 || h >= sunset + 0.7) return "night";
  if (h < sunrise + 1.6) return "dawn";
  if (h >= sunset - 1.2) return "dusk";
  return "day";
}
function SkyClock() {
  reactExports.useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.dataset.sky = skyPhase(/* @__PURE__ */ new Date());
    };
    update();
    const timer = window.setInterval(update, 5 * 60 * 1e3);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return null;
}
const getSupabase = () => import("./client-y8DRiWCN.mjs").then((m) => m.supabase);
function useAuthUser() {
  const [user, setUser] = reactExports.useState(null);
  const [loading2, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let unsubscribe;
    let cancelled = false;
    void getSupabase().then((supabase) => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
  return { user, loading: loading2 };
}
function useCloudSync() {
  reactExports.useEffect(() => {
    let cancelled = false;
    let engine2 = null;
    let pendingUser;
    const setUser = (id) => {
      if (engine2) engine2.setUser(id);
      else pendingUser = id;
    };
    const onLocalChange = () => engine2?.notifyLocalChange();
    const onOnline = () => engine2?.flush();
    const onVisibility = () => {
      if (!engine2) return;
      if (document.visibilityState === "hidden") engine2.flush();
      else void engine2.syncNow();
    };
    void import("./sync-client-DtnrSQTG.mjs").then(({ getSyncEngine }) => {
      if (cancelled) return;
      engine2 = getSyncEngine();
      if (pendingUser !== void 0) engine2.setUser(pendingUser);
    });
    window.addEventListener("driver-data-local-change", onLocalChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("pagehide", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    let unsubscribe;
    void getSupabase().then((supabase) => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user?.id ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED") return;
        setUser(session?.user?.id ?? null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
      window.removeEventListener("driver-data-local-change", onLocalChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pagehide", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
const RETURN_UA_TOKEN = "DriverAuthReturn/1";
const APP_RETURN_SCHEME = "com.holoshow.drivewise";
const APP_NONCE_KEY = "driver-app-login-nonce";
const TAB_NONCE_KEY = "driver-app-login-tab";
function appCanReceiveLogin() {
  return isNativeApp() && navigator.userAgent.includes(RETURN_UA_TOKEN);
}
function makeNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function startAppGoogleLogin(loginHint) {
  const nonce = makeNonce();
  try {
    localStorage.setItem(APP_NONCE_KEY, nonce);
  } catch {
    return false;
  }
  const url = new URL("/app-login", window.location.origin);
  url.searchParams.set("n", nonce);
  if (loginHint) url.searchParams.set("h", loginHint);
  const cap = window.Capacitor;
  try {
    await cap?.nativePromise?.("CapgoInAppBrowser", "open", { url: url.toString() });
    return Boolean(cap?.nativePromise);
  } catch {
    return false;
  }
}
function takeAppNonce(n) {
  try {
    const saved = localStorage.getItem(APP_NONCE_KEY);
    if (!saved || !n || saved !== n) return false;
    localStorage.removeItem(APP_NONCE_KEY);
    return true;
  } catch {
    return false;
  }
}
function appReturnLink(accessToken, refreshToken, nonce) {
  const q = new URLSearchParams({ t: accessToken, r: refreshToken, n: nonce });
  return `${APP_RETURN_SCHEME}://auth?${q.toString()}`;
}
function forgetTabSession() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) localStorage.removeItem(key);
    }
  } catch {
  }
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "הדף לא נמצא" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "הדף שחיפשת לא קיים." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "חזרה לדשבורד"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "משהו השתבש" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "נסה לרענן או חזור לדשבורד." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          children: "נסה שוב"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground",
          children: "דשבורד"
        }
      )
    ] })
  ] }) });
}
const Route$9 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "דרייבר" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "דרייבר - ניהול הכנסות והוצאות" },
      { name: "description", content: "אפליקציה אישית לנהג: מעקב הכנסות, הוצאות, רווחיות ויעדים." },
      { name: "theme-color", content: "#f3ead3" },
      { property: "og:title", content: "דרייבר - ניהול הכנסות והוצאות" },
      { name: "twitter:title", content: "דרייבר - ניהול הכנסות והוצאות" },
      {
        property: "og:description",
        content: "אפליקציה אישית לנהג: מעקב הכנסות, הוצאות, רווחיות ויעדים."
      },
      {
        name: "twitter:description",
        content: "אפליקציה אישית לנהג: מעקב הכנסות, הוצאות, רווחיות ויעדים."
      },
      {
        property: "og:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e397d361-fa3c-4d13-9cc0-5bea876e2119/id-preview-d55009be--9e7d4022-af91-480e-b8bd-078f9e2f11cf.lovable.app-1781112958267.png"
      },
      {
        name: "twitter:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e397d361-fa3c-4d13-9cc0-5bea876e2119/id-preview-d55009be--9e7d4022-af91-480e-b8bd-078f9e2f11cf.lovable.app-1781112958267.png"
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&family=Karantina:wght@400;700&family=Secular+One&display=swap"
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function useAppLoginReturn() {
  reactExports.useEffect(() => {
    if (isNativeApp() || window.location.pathname === "/app-login") return;
    try {
      if (!sessionStorage.getItem(TAB_NONCE_KEY)) return;
    } catch {
      return;
    }
    window.location.replace(`/app-login${window.location.hash}`);
  }, []);
}
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "he", dir: "rtl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  useCloudSync();
  useAppLoginReturn();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-screen text-foreground pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TripWatcher, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DriveDetector, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InkWorld, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SkyClock, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RewardEffects, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SoundDirector, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true, duration: 2500 })
  ] });
}
const $$splitComponentImporter$8 = () => import("./index-D5p8AKJo.mjs");
const Route$8 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "דרייבר - דשבורד"
    }, {
      name: "description",
      content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות."
    }, {
      property: "og:title",
      content: "דרייבר - דשבורד"
    }, {
      property: "og:description",
      content: "סיכום ההכנסות וההוצאות שלך, יעדים יומיים ומצב רווחיות."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./add-CkvTqpdT.mjs");
const TABS = ["income", "expense", "fuel"];
const validateAddSearch = (search) => ({
  tab: TABS.find((t) => t === search.tab),
  date: typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : void 0
});
const Route$7 = createFileRoute()({
  validateSearch: validateAddSearch,
  head: () => ({
    meta: [{
      title: "הוספת רשומה - דרייבר"
    }, {
      name: "description",
      content: "הוסף הכנסה, הוצאה או תדלוק."
    }, {
      property: "og:title",
      content: "הוספת רשומה - דרייבר"
    }, {
      property: "og:description",
      content: "הוסף הכנסה, הוצאה או תדלוק."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app-login-ByxNecvN.mjs");
const Route$6 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "התחברות לאפליקציה - דרייבר"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./auth-D7Uf1XFY.mjs");
const Route$5 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "התחברות - דרייבר"
    }, {
      name: "description",
      content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן."
    }, {
      property: "og:title",
      content: "התחברות - דרייבר"
    }, {
      property: "og:description",
      content: "התחבר כדי לשמור את ההכנסות וההוצאות שלך בענן."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./calendar-Bj5S_0fd.mjs");
const Route$4 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "לוח שנה - דרייבר"
    }, {
      name: "description",
      content: "תצוגה חודשית של הרווח היומי."
    }, {
      property: "og:title",
      content: "לוח שנה - דרייבר"
    }, {
      property: "og:description",
      content: "תצוגה חודשית של הרווח היומי."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./map-lg5OM8y7.mjs");
const Route$3 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "מפת הנסיעות - דרייבר"
    }, {
      name: "description",
      content: "כל הנסיעות של השבוע או החודש, מצוירות על המפה."
    }, {
      property: "og:title",
      content: "מפת הנסיעות - דרייבר"
    }, {
      property: "og:description",
      content: "כל הנסיעות של השבוע או החודש, מצוירות על המפה."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./reports-Dl8DT1uc.mjs").then((n) => n.r);
const Route$2 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "דוחות - דרייבר"
    }, {
      name: "description",
      content: "סיכומים ופירוט הכנסות והוצאות."
    }, {
      property: "og:title",
      content: "דוחות - דרייבר"
    }, {
      property: "og:description",
      content: "סיכומים ופירוט הכנסות והוצאות."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./settings-CY8MKNy5.mjs");
const Route$1 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "הגדרות - דרייבר"
    }, {
      name: "description",
      content: "הגדרות, יעדים ופרטי רכב."
    }, {
      property: "og:title",
      content: "הגדרות - דרייבר"
    }, {
      property: "og:description",
      content: "הגדרות, יעדים ופרטי רכב."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./trip-3LkQt8np.mjs");
const Route = createFileRoute()({
  validateSearch: (search) => ({
    action: typeof search.action === "string" ? search.action : void 0,
    mode: typeof search.mode === "string" ? search.mode : void 0
  }),
  head: () => ({
    meta: [{
      title: "דרייבר - מעקב נסיעה"
    }, {
      name: "description",
      content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת."
    }, {
      property: "og:title",
      content: "דרייבר - מעקב נסיעה"
    }, {
      property: "og:description",
      content: "מעקב GPS חי לנסיעות עבודה: ק״מ, זמן ועלות דלק משוערת."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const AddRoute = Route$7.update({
  id: "/add",
  path: "/add",
  getParentRoute: () => Route$9
});
const AppLoginRoute = Route$6.update({
  id: "/app-login",
  path: "/app-login",
  getParentRoute: () => Route$9
});
const AuthRoute = Route$5.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$9
});
const CalendarRoute = Route$4.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => Route$9
});
const MapRoute = Route$3.update({
  id: "/map",
  path: "/map",
  getParentRoute: () => Route$9
});
const ReportsRoute = Route$2.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => Route$9
});
const SettingsRoute = Route$1.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$9
});
const TripRoute = Route.update({
  id: "/trip",
  path: "/trip",
  getParentRoute: () => Route$9
});
const rootRouteChildren = {
  IndexRoute,
  AddRoute,
  AppLoginRoute,
  AuthRoute,
  CalendarRoute,
  MapRoute,
  ReportsRoute,
  SettingsRoute,
  TripRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  idlePerHour as $,
  ACTIVE_EVENT as A,
  Button as B,
  ComicBubble as C,
  appReturnLink as D,
  appCanReceiveLogin as E,
  startAppGoogleLogin as F,
  isPrivateTrip as G,
  routedTrips as H,
  splitGaps as I,
  routeStops as J,
  placeCounts as K,
  fmtDateShort as L,
  MOOD_MUMBLE as M,
  netFromIncome as N,
  effectiveFuelParams as O,
  fuelCostFor as P,
  nowHHMM as Q,
  Route$7 as R,
  soundEnabled as S,
  TAB_NONCE_KEY as T,
  hapticsEnabled as U,
  setSoundEnabled as V,
  setHapticsEnabled as W,
  canSelfUpdate as X,
  installedVersion as Y,
  installUpdate as Z,
  checkForUpdate as _,
  filterByRange as a,
  hasBackgroundTracking as a0,
  stopsText as a1,
  tripEnergy as a2,
  isPrivate as a3,
  STOP_REASONS as a4,
  sumStops as a5,
  STAND_AFTER_MS as a6,
  engineOn as a7,
  chargingNow as a8,
  writeActive as a9,
  load as aA,
  save as aB,
  router as aC,
  betweenToTrip as aa,
  requestNotifyPermission as ab,
  hushSound as ac,
  closeStop as ad,
  cleanStops as ae,
  GPS_ERROR_EVENT as af,
  workSecondsOn as ag,
  stopLabel as ah,
  trackBetweenOn as ai,
  readGpsError as aj,
  isUnconfirmedAuto as ak,
  notifyIfHidden as al,
  looksForgotten as am,
  autoToSide as an,
  startStop as ao,
  confirmAuto as ap,
  finishPath as aq,
  startBetween as ar,
  Route as as,
  totalCosts as at,
  claimAmbient as au,
  playCues as av,
  sceneCues as aw,
  TAXI_VOICE as ax,
  mergeWithMeta as ay,
  sameContent as az,
  fmtPrecise as b,
  cn as c,
  drivenKm as d,
  energyUnitLabel as e,
  fmt as f,
  filterByDate as g,
  haptic as h,
  useAuthUser as i,
  isBetween as j,
  isDrivingNow as k,
  fmtDuration as l,
  monthRange as m,
  netProfit as n,
  isSideDrive as o,
  playSound as p,
  sumIncomes as q,
  readActive as r,
  sumHours as s,
  todayISO as t,
  useAppData as u,
  categoryLabel as v,
  workTrips as w,
  isNativeApp as x,
  takeAppNonce as y,
  forgetTabSession as z
};
