import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppData, B as Button, a0 as hasBackgroundTracking, i as useAuthUser, c as cn, $ as idlePerHour, e as energyUnitLabel, S as soundEnabled, U as hapticsEnabled, V as setSoundEnabled, p as playSound, W as setHapticsEnabled, h as haptic, x as isNativeApp, X as canSelfUpdate, Y as installedVersion, Q as nowHHMM, t as todayISO, Z as installUpdate, _ as checkForUpdate } from "./router-DhZGCYXD.mjs";
import { P as PageHeader } from "./PageHeader-CyegtAFt.mjs";
import { C as Card, a as CardContent } from "./MovieStage-C7QmTclX.mjs";
import { I as Input, L as Label } from "./label-CxojLJH6.mjs";
import { S as Switch$1, a as SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D_aCOIbw.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { K as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { a as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-WGaT7ilT.mjs";
import { c as checkNumber, N as NumberField, p as parseNumber } from "./validate-CfH8ev_b.mjs";
import { a as authErrorMessage } from "./auth-messages-DgpJVAGF.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/seroval.mjs";
import { E as RefreshCw, q as Trash2, e as CloudCheck, J as LogOut, K as LogIn, P as Plus, D as Download, U as Upload, V as Volume2, O as KeyRound } from "../_libs/lucide-react.mjs";
import { o as objectType, a as arrayType, s as stringType, e as enumType, n as numberType } from "../_libs/zod.mjs";

import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/unenv.mjs";


import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getOnlineFuelPrice = createServerFn({
  method: "GET"
}).handler(createSsrRpc("bdd6f2610124b3a49d17d1fd0f9b2ec6781f77d716788ed38414469f9b3cce7a"));
const BASELINE_DATE = "0000-01-01";
const entryKey = (h) => `${h.date} ${h.time ?? "00:00"}`;
const toNumber = (s) => parseNumber(s) ?? NaN;
function FuelPriceHistoryCard() {
  const { data, ready, update } = useAppData();
  const [rows, setRows] = reactExports.useState([]);
  const [dirty, setDirty] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!ready || dirty) return;
    const sorted = [...data.settings.fuelPriceHistory ?? []].sort(
      (a, b) => entryKey(b).localeCompare(entryKey(a))
    );
    setRows(
      sorted.map((h, i) => ({
        key: `${entryKey(h)}#${i}`,
        date: h.date,
        time: h.time ?? "00:00",
        price: String(h.price),
        consumption: String(h.consumption)
      }))
    );
  }, [ready, dirty, data.settings.fuelPriceHistory]);
  const edit = (key, patch) => {
    setDirty(true);
    setRows((rs) => rs.map((r) => r.key === key ? { ...r, ...patch } : r));
  };
  const addRow = () => {
    setDirty(true);
    setRows((rs) => [
      {
        key: `new-${crypto.randomUUID()}`,
        date: todayISO(),
        time: nowHHMM(),
        price: String(data.settings.fuelPrice),
        consumption: String(data.vehicle.consumption)
      },
      ...rs
    ]);
  };
  const save = () => {
    const history = [];
    for (const r of rows) {
      const price = toNumber(r.price);
      const consumption = toNumber(r.consumption);
      if (!r.date || !/^\d{2}:\d{2}$/.test(r.time) || !(price > 0) || !(consumption > 0)) {
        toast.error("בכל שורה צריך תאריך, שעה, מחיר וצריכה גדולים מאפס");
        return;
      }
      history.push({ date: r.date, time: r.time, price, consumption });
    }
    const latest = [...history].sort((a, b) => entryKey(b).localeCompare(entryKey(a)))[0];
    update((d) => ({
      ...d,
      settings: {
        ...d.settings,
        fuelPriceHistory: history,
        ...latest ? { fuelPrice: latest.price } : {}
      },
      vehicle: latest ? { ...d.vehicle, consumption: latest.consumption } : d.vehicle
    }));
    setDirty(false);
    toast.success("היסטוריית המחירים נשמרה");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "היסטוריית מחירי דלק" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: addRow, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 ml-1" }),
        "שורה"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "כל רשומה מחושבת לפי המחיר והצריכה שהיו בתוקף בזמן שלה. אפשר לתקן כאן מחיר שנרשם לא נכון." }),
    rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "עדיין לא נרשם שינוי מחיר." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        r.date === BASELINE_DATE ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-medium text-muted-foreground", children: "לפני השינוי הראשון" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              "aria-label": "מתאריך",
              value: r.date,
              onChange: (e) => edit(r.key, { date: e.target.value })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "time",
              "aria-label": "משעה",
              value: r.time,
              onChange: (e) => edit(r.key, { time: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "decimal",
            "aria-label": "מחיר לליטר (₪)",
            placeholder: "מחיר ₪",
            value: r.price,
            onChange: (e) => edit(r.key, { price: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "decimal",
            "aria-label": "צריכה (ק״מ לליטר)",
            placeholder: "ק״מ לליטר",
            value: r.consumption,
            onChange: (e) => edit(r.key, { consumption: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          "aria-label": "מחק שורה",
          onClick: () => {
            setDirty(true);
            setRows((rs) => rs.filter((x) => x.key !== r.key));
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
        }
      )
    ] }, r.key)) }),
    dirty && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "שמור היסטוריה" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDirty(false), children: "בטל שינויים" })
    ] })
  ] }) });
}
function AppPasswordCard({ email }) {
  const [password, setPassword] = reactExports.useState("");
  const [confirm2, setConfirm] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(false);
  const mismatch = confirm2.length > 0 && confirm2 !== password;
  const tooShort = password.length > 0 && password.length < 6;
  const save = async () => {
    if (tooShort || mismatch || !password) return;
    setBusy(true);
    const { supabase } = await import("./client-y8DRiWCN.mjs");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(authErrorMessage(error.message));
      return;
    }
    setPassword("");
    setConfirm("");
    setDone(true);
    toast.success("הסיסמה נשמרה");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4 text-primary" }),
      " סיסמה לכניסה מהאפליקציה"
    ] }),
    done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "מעכשיו אפשר להתחבר באפליקציה המותקנת עם",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "font-semibold text-foreground", children: email }),
      " ",
      "והסיסמה שבחרת."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "באפליקציה המותקנת אין התחברות עם Google. הגדר כאן סיסמה, ושם התחבר עם המייל הזה והסיסמה. לא צריך מייל אישור." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "app-password", className: "text-xs text-muted-foreground", children: "סיסמה (לפחות 6 תווים)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "app-password",
            type: "password",
            dir: "ltr",
            autoComplete: "new-password",
            value: password,
            onChange: (e) => setPassword(e.target.value)
          }
        ),
        tooShort && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", children: "לפחות 6 תווים" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "app-password-confirm", className: "text-xs text-muted-foreground", children: "שוב, לאימות" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "app-password-confirm",
            type: "password",
            dir: "ltr",
            autoComplete: "new-password",
            value: confirm2,
            onChange: (e) => setConfirm(e.target.value)
          }
        ),
        mismatch && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-destructive", children: "הסיסמאות לא זהות" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          variant: "outline",
          disabled: busy || !password || tooShort || mismatch || confirm2 !== password,
          onClick: save,
          children: busy ? "שומר..." : "שמור סיסמה"
        }
      )
    ] })
  ] });
}
const SAMPLES = [
  { sound: "aooga", label: "הצופר של טורבו" },
  { sound: "smirk", label: "הקפטן מצחקק" },
  { sound: "tune", label: "הקפטן מזמזם" },
  { sound: "turbo-start", label: "טורבו מתניע" },
  { sound: "grumble", label: "הקפטן רוטן" },
  { sound: "brake", label: "בלימה" },
  { sound: "shock", label: "הקפטן נבהל" },
  { sound: "kaching", label: "קופה רושמת" },
  { sound: "victory", label: "הקפטן חוגג" },
  { sound: "womp", label: "טרומבון עצוב" },
  { sound: "whistle", label: "הקפטן שורק" },
  { sound: "fanfare", label: "תרועת ניצחון" },
  { sound: "snore", label: "הקפטן נוחר" }
];
function SoundSettingsCard() {
  const [on, setOn] = reactExports.useState(true);
  const [buzz, setBuzz] = reactExports.useState(true);
  const [heard, setHeard] = reactExports.useState(null);
  const next = reactExports.useRef(0);
  reactExports.useEffect(() => {
    setOn(soundEnabled());
    setBuzz(hapticsEnabled());
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "צלילים" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sound-on", children: "הקפטן וטורבו משמיעים קולות" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "מלמולים, נעימות, מנוע, בלימה וצופר. במצב נהיגה תמיד שקט." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          id: "sound-on",
          checked: on,
          onCheckedChange: (v) => {
            setOn(v);
            setSoundEnabled(v);
            if (v) playSound("beep");
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "haptics-on", children: "רטט קל במגע" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "בהחלקה, בהתחלה ובסיום נסיעה ובמעבר בין מסכים." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          id: "haptics-on",
          checked: buzz,
          onCheckedChange: (v) => {
            setBuzz(v);
            setHapticsEnabled(v);
            if (v) haptic("tap");
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        className: "w-full",
        disabled: !on,
        onClick: () => {
          const sample = SAMPLES[next.current % SAMPLES.length];
          next.current += 1;
          playSound(sample.sound);
          setHeard(sample.label);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4 ml-1" }),
          "השמע דוגמה"
        ]
      }
    ),
    heard && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", "aria-live": "polite", children: heard })
  ] }) });
}
function AppUpdateCard() {
  const [native, setNative] = reactExports.useState(false);
  const [supported, setSupported] = reactExports.useState(false);
  const [version, setVersion] = reactExports.useState("");
  const [latest, setLatest] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!isNativeApp()) return;
    setNative(true);
    if (!canSelfUpdate()) return;
    setSupported(true);
    void installedVersion().then((v) => v && setVersion(v));
  }, []);
  if (!native) return null;
  const check = async () => {
    setBusy("check");
    const r = await checkForUpdate();
    setBusy(null);
    if (!r) {
      toast.error("לא הצלחתי לבדוק עדכון. בדקו שיש אינטרנט ונסו שוב.");
      return;
    }
    setVersion(r.versionName);
    if (r.available) {
      setLatest(r.latestName || "חדשה");
    } else {
      setLatest(null);
      toast.success("יש לך את הגרסה האחרונה 👍");
    }
  };
  const install = async () => {
    setBusy("install");
    const started = await installUpdate();
    setBusy(null);
    if (!started) setLatest(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "עדכון האפליקציה" }),
    supported ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        version ? `גרסה מותקנת: ${version}. ` : "",
        "עדכון מתקין את הגרסה החדשה מעל הקיימת, והנתונים נשמרים."
      ] }),
      latest ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: install, disabled: busy !== null, className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 ml-1" }),
        busy === "install" ? "מוריד…" : `עדכן לגרסה ${latest}`
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: check, disabled: busy !== null, className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ml-1 ${busy === "check" ? "animate-spin" : ""}` }),
        busy === "check" ? "בודק…" : "בדוק עדכון"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "הגרסה שמותקנת אצלך עוד לא יודעת להתעדכן לבד. צריך להתקין פעם אחת את הגרסה החדשה מ-GitHub, ומשם העדכונים יגיעו מכאן." })
  ] }) });
}
const isoDate = stringType().regex(/^\d{4}-\d{2}-\d{2}$/);
const num = numberType().finite();
const incomeSchema = objectType({
  id: stringType().min(1),
  date: isoDate,
  amount: num,
  commissionPct: num.default(0),
  tip: num.default(0),
  hours: num.default(0),
  km: num.default(0),
  platform: stringType().default("פרטי")
}).passthrough();
const expenseSchema = objectType({
  id: stringType().min(1),
  date: isoDate,
  amount: num,
  category: enumType([
    "fuel",
    "insurance",
    "license",
    "maintenance",
    "parking",
    "food",
    "wash",
    "other"
  ])
}).passthrough();
const tripSchema = objectType({ id: stringType().min(1), date: isoDate, km: num, seconds: num.default(0) }).passthrough();
const priceEntrySchema = objectType({ date: stringType(), time: stringType().optional(), price: num, consumption: num }).passthrough();
const backupSchema = objectType({
  incomes: arrayType(incomeSchema),
  expenses: arrayType(expenseSchema),
  trips: arrayType(tripSchema).default([]),
  settings: objectType({ fuelPriceHistory: arrayType(priceEntrySchema).optional() }).passthrough().optional()
}).passthrough();
function parseBackup(raw) {
  const r = backupSchema.safeParse(raw);
  if (!r.success) return null;
  return {
    incomes: r.data.incomes,
    expenses: r.data.expenses,
    trips: r.data.trips,
    fuelPriceHistory: r.data.settings?.fuelPriceHistory ?? []
  };
}
const missing = (have, incoming) => {
  const ids = new Set(have.map((x) => x.id));
  return incoming.filter((x) => !ids.has(x.id));
};
function planRestore(data, b) {
  const incomes = missing(data.incomes, b.incomes).length;
  const expenses = missing(data.expenses, b.expenses).length;
  const trips = missing(data.trips ?? [], b.trips).length;
  return { incomes, expenses, trips, total: incomes + expenses + trips };
}
function applyRestore(d, b) {
  const strip = (x) => {
    const { updatedAt: _ignored, ...rest } = x;
    return rest;
  };
  const key = (h) => `${h.date} ${h.time ?? "00:00"}`;
  const history = new Map((d.settings.fuelPriceHistory ?? []).map((h) => [key(h), h]));
  for (const h of b.fuelPriceHistory) if (!history.has(key(h))) history.set(key(h), h);
  return {
    ...d,
    incomes: [...d.incomes, ...missing(d.incomes, b.incomes).map(strip)],
    expenses: [...d.expenses, ...missing(d.expenses, b.expenses).map(strip)],
    trips: [...d.trips ?? [], ...missing(d.trips ?? [], b.trips).map(strip)],
    settings: { ...d.settings, fuelPriceHistory: [...history.values()] }
  };
}
function EngineSettings() {
  const { data, updateSettings } = useAppData();
  const [text, setText] = reactExports.useState(() => String(idlePerHour(data.vehicle, data.settings)));
  const error = checkNumber(text, { min: 0, max: 10 });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "engine-charger", children: "המטען ברכב עובד רק כשהמנוע דלוק" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'כך האפליקציה יודעת לבד: הטלפון בטעינה = המנוע דלוק. בלי זה אפשר ללחוץ "המנוע דלוק" כשעומדים.' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          id: "engine-charger",
          checked: data.settings.engineByCharger === true,
          onCheckedChange: (v) => updateSettings({ engineByCharger: v })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground", children: [
        "צריכה בעמידה עם מנוע דלוק (",
        energyUnitLabel(data.vehicle),
        " לשעה)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberField,
        {
          value: text,
          onValueChange: (v) => {
            setText(v);
            const n = parseNumber(v);
            if (!checkNumber(v, { min: 0, max: 10 }) && n != null)
              updateSettings({ idlePerHour: n });
          },
          error
        }
      )
    ] })
  ] });
}
function SettingsPage() {
  const {
    data,
    ready,
    updateSettings,
    updateVehicle,
    recordFuelPriceChange,
    update
  } = useAppData();
  const [s, setS] = reactExports.useState(data.settings);
  const [v, setV] = reactExports.useState(data.vehicle);
  const [loadingPrice, setLoadingPrice] = reactExports.useState(false);
  const fetchPrice = useServerFn(getOnlineFuelPrice);
  const [origFuelPrice, setOrigFuelPrice] = reactExports.useState(data.settings.fuelPrice);
  const [origConsumption, setOrigConsumption] = reactExports.useState(data.vehicle.consumption);
  const toText = (st, ve) => ({
    dailyGoal: String(st.dailyGoal),
    fixedMonthlyExpenses: String(st.fixedMonthlyExpenses),
    workDaysPerMonth: String(st.workDaysPerMonth),
    defaultCommissionPct: String(st.defaultCommissionPct),
    consumption: String(ve.consumption),
    fuelPrice: String(st.fuelPrice)
  });
  const [t, setT] = reactExports.useState(() => toText(data.settings, data.vehicle));
  const [showErrors, setShowErrors] = reactExports.useState({});
  const setNum = (patch) => setT((x) => ({
    ...x,
    ...patch
  }));
  const goalErrors = {
    dailyGoal: checkNumber(t.dailyGoal, {
      required: true,
      min: 0
    }),
    fixedMonthlyExpenses: checkNumber(t.fixedMonthlyExpenses, {
      required: true,
      min: 0
    }),
    workDaysPerMonth: checkNumber(t.workDaysPerMonth, {
      required: true,
      min: 1,
      max: 31
    }),
    defaultCommissionPct: checkNumber(t.defaultCommissionPct, {
      required: true,
      min: 0,
      max: 100
    })
  };
  const vehicleErrors = {
    consumption: checkNumber(t.consumption, {
      required: true,
      positive: true,
      max: 100
    }),
    fuelPrice: checkNumber(t.fuelPrice, {
      required: true,
      positive: true,
      max: 50
    })
  };
  const gErr = (k) => showErrors.goals ? goalErrors[k] : void 0;
  const vErr = (k) => showErrors.vehicle ? vehicleErrors[k] : void 0;
  reactExports.useEffect(() => {
    if (ready) {
      setS(data.settings);
      setV(data.vehicle);
      setT(toText(data.settings, data.vehicle));
      setOrigFuelPrice(data.settings.fuelPrice);
      setOrigConsumption(data.vehicle.consumption);
    }
  }, [ready, data.settings, data.vehicle]);
  const syncFuelPrice = async () => {
    setLoadingPrice(true);
    try {
      const res = await fetchPrice();
      if (res.ok) {
        const stamp = (/* @__PURE__ */ new Date()).toISOString();
        setS((prev) => ({
          ...prev,
          fuelPrice: res.price,
          fuelPriceUpdatedAt: stamp
        }));
        setNum({
          fuelPrice: String(res.price)
        });
        recordFuelPriceChange(res.price, parseNumber(t.consumption) ?? origConsumption);
        setOrigFuelPrice(res.price);
        toast.success(`מחיר עודכן: ₪${res.price} לליטר — יחול מהיום ואילך`);
      } else {
        toast.error(res.error || "לא הצלחתי לעדכן מחיר");
      }
    } catch {
      toast.error("לא הצלחתי לעדכן מחיר");
    } finally {
      setLoadingPrice(false);
    }
  };
  const saveSettings = () => {
    if (Object.values(goalErrors).some(Boolean)) {
      setShowErrors((x) => ({
        ...x,
        goals: true
      }));
      return toast.error("יש שדה שצריך לתקן");
    }
    setShowErrors((x) => ({
      ...x,
      goals: false
    }));
    updateSettings({
      dailyGoal: parseNumber(t.dailyGoal),
      fixedMonthlyExpenses: parseNumber(t.fixedMonthlyExpenses),
      workDaysPerMonth: parseNumber(t.workDaysPerMonth),
      defaultCommissionPct: parseNumber(t.defaultCommissionPct),
      // fuelPrice is saved only through the price history ("שמור רכב").
      currency: s.currency || "₪"
    });
    toast.success("הגדרות נשמרו");
  };
  const saveVehicle = () => {
    if (Object.values(vehicleErrors).some(Boolean)) {
      setShowErrors((x) => ({
        ...x,
        vehicle: true
      }));
      return toast.error("יש שדה שצריך לתקן");
    }
    setShowErrors((x) => ({
      ...x,
      vehicle: false
    }));
    const newConsumption = parseNumber(t.consumption);
    const newPrice = parseNumber(t.fuelPrice);
    updateVehicle({
      make: v.make,
      model: v.model,
      year: v.year,
      plate: v.plate,
      type: v.type
    });
    if (newConsumption !== origConsumption || newPrice !== origFuelPrice) {
      recordFuelPriceChange(newPrice, newConsumption);
      setOrigConsumption(newConsumption);
      setOrigFuelPrice(newPrice);
    }
    toast.success("פרטי רכב נשמרו");
  };
  const resetAll = () => {
    if (!confirm("למחוק את כל הנתונים? פעולה זו לא ניתנת לביטול.")) return;
    update(() => ({
      incomes: [],
      expenses: [],
      trips: [],
      vehicle: v,
      settings: s
    }));
    toast.success("כל הנתונים נמחקו");
  };
  if (!ready) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "הגדרות", subtitle: "יעדים, רכב, ונתונים", scene: {
      mood: "smirk",
      prop: "wrench",
      line: "המוסך פתוח. מכוונים את המכונה 🔧",
      taxi: "tired",
      backdrop: "garage"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccountCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "יעדים ותקציב" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "יעד רווח יומי (₪)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.dailyGoal, onValueChange: (dailyGoal) => setNum({
          dailyGoal
        }), error: gErr("dailyGoal") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "הוצאות קבועות חודשיות (ביטוח, רישוי, ליסינג וכו׳)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.fixedMonthlyExpenses, onValueChange: (fixedMonthlyExpenses) => setNum({
          fixedMonthlyExpenses
        }), error: gErr("fixedMonthlyExpenses") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ימי עבודה בחודש (ממוצע)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.workDaysPerMonth, onValueChange: (workDaysPerMonth) => setNum({
          workDaysPerMonth
        }), error: gErr("workDaysPerMonth") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "עמלת חברה ברירת מחדל (%)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.defaultCommissionPct, onValueChange: (defaultCommissionPct) => setNum({
          defaultCommissionPct
        }), error: gErr("defaultCommissionPct") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveSettings, className: "w-full", children: "שמור" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "הרכב שלי" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "יצרן", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.make, onChange: (e) => setV({
            ...v,
            make: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "דגם", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.model, onChange: (e) => setV({
            ...v,
            model: e.target.value
          }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "שנה", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.year, onChange: (e) => setV({
            ...v,
            year: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "מספר רישוי", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.plate, onChange: (e) => setV({
            ...v,
            plate: e.target.value
          }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "סוג רכב", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { dir: "rtl", value: v.type, onValueChange: (val) => setV({
          ...v,
          type: val
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "petrol", children: "בנזין / סולר" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hybrid", children: "היברידי" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "electric", children: "חשמלי" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: v.type === "electric" ? "צריכה (ק״מ ל-kWh)" : "צריכה (ק״מ לליטר)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.consumption, onValueChange: (consumption) => setNum({
            consumption
          }), error: vErr("consumption") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: v.type === "electric" ? "מחיר kWh (₪)" : "מחיר ליטר (₪)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: t.fuelPrice, onValueChange: (fuelPrice) => setNum({
            fuelPrice
          }), error: vErr("fuelPrice") }) })
        ] }),
        v.type !== "electric" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", disabled: loadingPrice, onClick: syncFuelPrice, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ml-1 ${loadingPrice ? "animate-spin" : ""}` }),
          loadingPrice ? "מעדכן..." : "עדכן מחיר דלק אונליין (95)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "שינוי מחיר או צריכה נרשם עם התאריך והשעה המדויקת ויחול רק מאותו רגע והלאה — רשומות שהוזנו קודם ישמרו את המחיר והצריכה שהיו תקפים אז. המחיר האונליין הוא המחיר המרבי לצרכן בשירות עצמי.",
          s.fuelPriceUpdatedAt && ` עודכן לאחרונה: ${new Date(s.fuelPriceUpdatedAt).toLocaleString("he-IL", {
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}.`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveVehicle, className: "w-full", children: "שמור רכב" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FuelPriceHistoryCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BackupCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "זיהוי נסיעות, עצירות ומנוע" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auto-detect", children: "התחל למדוד לבד כשמזוהה נסיעה" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "אם שכחת ללחוץ, המדידה מתחילה מרגע שהרכב זז, ובסוף נשאל אם זו הייתה נסיעת עבודה" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "auto-detect", checked: data.settings.autoDetectTrip === true, onCheckedChange: (v2) => {
            updateSettings({
              autoDetectTrip: v2
            });
            if (v2) navigator.geolocation?.getCurrentPosition(() => {
            }, () => {
            });
          } })
        ] }),
        hasBackgroundTracking() && data.settings.autoDetectTrip === true && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "detect-background", children: "זהה גם כשהאפליקציה סגורה" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "מציג התראה קבועה למעלה ומשתמש קצת יותר בסוללה" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "detect-background", checked: data.settings.detectInBackground === true, onCheckedChange: (v2) => updateSettings({
            detectInBackground: v2
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "track-between", children: "מדוד גם בין נסיעות" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'אחרי סיום נסיעה הזמן והק״מ ממשיכים להימדד עד הנסיעה הבאה או עד "סיימתי לעבוד" (לא נחשב נסיעת עבודה)' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "track-between", checked: data.settings.trackBetween !== false, onCheckedChange: (v2) => updateSettings({
            trackBetween: v2
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ask-wait", children: "שאל על המתנה" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "אחרי 4 דקות עמידה במקום בזמן נסיעה" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "ask-wait", checked: data.settings.askWaiting !== false, onCheckedChange: (v2) => updateSettings({
            askWaiting: v2
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EngineSettings, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SoundSettingsCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppUpdateCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-destructive", children: "אזור מסוכן" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "מחיקה של כל ההכנסות וההוצאות. הגדרות ופרטי רכב יישמרו." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: resetAll, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 ml-1" }),
          "מחק את כל הנתונים"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-center pt-2", children: [
          data.incomes.length,
          " הכנסות · ",
          data.expenses.length,
          " הוצאות"
        ] })
      ] }) })
    ] })
  ] });
}
function AccountCard() {
  const {
    user,
    loading
  } = useAuthUser();
  if (loading) return null;
  const meta = user?.user_metadata ?? {};
  const name = meta.full_name || meta.name || "";
  const avatar = meta.avatar_url || meta.picture || "";
  const provider = user?.app_metadata?.provider || "email";
  const providerLabel = provider === "google" ? "חשבון Google" : "אימייל וסיסמה";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "card-lift animate-fade-in-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "חשבון וגיבוי בענן" }),
    user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border bg-muted/40 p-3", children: [
        avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar, alt: name || "תמונת פרופיל", className: "h-11 w-11 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary", children: (name || user.email || "?").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          name && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: "truncate text-right text-xs text-muted-foreground", children: user.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CloudCheck, { className: "h-3 w-3" }),
            " מחובר · ",
            providerLabel
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "כל שינוי נשמר אוטומטית בענן בדיוק כפי שהוא מוצג באפליקציה, וזמין בכל מכשיר שתתחבר בו לאותו חשבון." }),
      user.email && /* @__PURE__ */ jsxRuntimeExports.jsx(AppPasswordCard, { email: user.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: async () => {
        const {
          supabase
        } = await import("./client-y8DRiWCN.mjs");
        await supabase.auth.signOut();
        toast.success("התנתקת");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 ml-1" }),
        "התנתק"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "כרגע הנתונים שמורים רק בטלפון הזה. התחבר כדי לגבות אותם בענן ולראות אותם בכל מכשיר." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", onClick: () => navigateToAuth(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4 ml-1" }),
        "התחבר / הרשמה"
      ] })
    ] })
  ] }) });
}
function navigateToAuth() {
  window.location.href = "/auth";
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function BackupCard() {
  const {
    data,
    update
  } = useAppData();
  const inputId = "restore-file";
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `driver-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("קובץ גיבוי נוצר");
  };
  const importJson = async (file) => {
    let backup;
    try {
      backup = parseBackup(JSON.parse(await file.text()));
    } catch {
      backup = null;
    }
    if (!backup) {
      toast.error("קובץ לא תקין: זה לא נראה כמו גיבוי של דרייבר");
      return;
    }
    const plan = planRestore(data, backup);
    if (plan.total === 0) {
      toast.info("כל הרשומות שבקובץ כבר קיימות. לא נוסף דבר.");
      return;
    }
    const restored = backup;
    toast(`בקובץ ${plan.incomes} הכנסות, ${plan.expenses} הוצאות ו-${plan.trips} נסיעות שאינן כאן`, {
      description: "השחזור מוסיף אותן ולא מוחק רשומות קיימות.",
      duration: 15e3,
      action: {
        label: "שחזר",
        onClick: () => {
          update((d) => applyRestore(d, restored));
          toast.success("הגיבוי שוחזר ומוזג עם הנתונים הקיימים");
        }
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "גיבוי מקומי" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "שמור עותק של כל הנתונים כקובץ, ושחזר אותו בכל זמן. השחזור מוסיף רשומות חסרות (הכנסות, הוצאות ונסיעות) ולא מוחק או משנה רשומות קיימות." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: exportJson, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 ml-1" }),
        "ייצוא גיבוי"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => document.getElementById(inputId)?.click(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 ml-1" }),
        "שחזור מקובץ"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: inputId, type: "file", accept: "application/json", className: "hidden", onChange: (e) => {
      const f = e.target.files?.[0];
      if (f) void importJson(f);
      e.target.value = "";
    } })
  ] }) });
}
export {
  SettingsPage as component
};
