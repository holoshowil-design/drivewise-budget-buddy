import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nowHHMM, todayISO, useAppData, type FuelPriceEntry } from "@/lib/store";
import { parseNumber } from "@/lib/number";

/** Date used for the "before the first change" baseline entry. */
const BASELINE_DATE = "0000-01-01";

type Row = { key: string; date: string; time: string; price: string; consumption: string };

const entryKey = (h: FuelPriceEntry) => `${h.date} ${h.time ?? "00:00"}`;
const toNumber = (s: string) => parseNumber(s) ?? NaN;

/** Price & consumption history: every change, editable by hand. */
export function FuelPriceHistoryCard() {
  const { data, ready, update } = useAppData();
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!ready || dirty) return;
    const sorted = [...(data.settings.fuelPriceHistory ?? [])].sort((a, b) =>
      entryKey(b).localeCompare(entryKey(a)),
    );
    setRows(
      sorted.map((h, i) => ({
        key: `${entryKey(h)}#${i}`,
        date: h.date,
        time: h.time ?? "00:00",
        price: String(h.price),
        consumption: String(h.consumption),
      })),
    );
  }, [ready, dirty, data.settings.fuelPriceHistory]);

  const edit = (key: string, patch: Partial<Row>) => {
    setDirty(true);
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setDirty(true);
    setRows((rs) => [
      {
        key: `new-${crypto.randomUUID()}`,
        date: todayISO(),
        time: nowHHMM(),
        price: String(data.settings.fuelPrice),
        consumption: String(data.vehicle.consumption),
      },
      ...rs,
    ]);
  };

  const save = () => {
    const history: FuelPriceEntry[] = [];
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
        ...(latest ? { fuelPrice: latest.price } : {}),
      },
      vehicle: latest ? { ...d.vehicle, consumption: latest.consumption } : d.vehicle,
    }));
    setDirty(false);
    toast.success("היסטוריית המחירים נשמרה");
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">היסטוריית מחירי דלק</h3>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 ml-1" />
            שורה
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          כל רשומה מחושבת לפי המחיר והצריכה שהיו בתוקף בזמן שלה. אפשר לתקן כאן מחיר שנרשם לא נכון.
        </p>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">עדיין לא נרשם שינוי מחיר.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-2">
                <div className="grid grid-cols-2 gap-2">
                  {r.date === BASELINE_DATE ? (
                    <div className="col-span-2 text-xs font-medium text-muted-foreground">
                      לפני השינוי הראשון
                    </div>
                  ) : (
                    <>
                      <Input
                        type="date"
                        aria-label="מתאריך"
                        value={r.date}
                        onChange={(e) => edit(r.key, { date: e.target.value })}
                      />
                      <Input
                        type="time"
                        aria-label="משעה"
                        value={r.time}
                        onChange={(e) => edit(r.key, { time: e.target.value })}
                      />
                    </>
                  )}
                  <Input
                    inputMode="decimal"
                    aria-label="מחיר לליטר (₪)"
                    placeholder="מחיר ₪"
                    value={r.price}
                    onChange={(e) => edit(r.key, { price: e.target.value })}
                  />
                  <Input
                    inputMode="decimal"
                    aria-label="צריכה (ק״מ לליטר)"
                    placeholder="ק״מ לליטר"
                    value={r.consumption}
                    onChange={(e) => edit(r.key, { consumption: e.target.value })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="מחק שורה"
                  onClick={() => {
                    setDirty(true);
                    setRows((rs) => rs.filter((x) => x.key !== r.key));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {dirty && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={save}>שמור היסטוריה</Button>
            <Button variant="outline" onClick={() => setDirty(false)}>
              בטל שינויים
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
