import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumberField } from "@/components/NumberField";
import { energyUnitLabel, idlePerHour, useAppData } from "@/lib/store";
import { parseNumber } from "@/lib/number";
import { checkNumber } from "@/lib/validate";

/** Settings for standing time: how the app knows the engine is on, and what it burns. */
export function EngineSettings() {
  const { data, updateSettings } = useAppData();
  const [text, setText] = useState(() => String(idlePerHour(data.vehicle, data.settings)));
  const error = checkNumber(text, { min: 0, max: 10 });
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="engine-charger">המטען ברכב עובד רק כשהמנוע דלוק</Label>
          <p className="text-xs text-muted-foreground">
            כך האפליקציה יודעת לבד: הטלפון בטעינה = המנוע דלוק. בלי זה אפשר ללחוץ "המנוע דלוק"
            כשעומדים.
          </p>
        </div>
        <Switch
          id="engine-charger"
          checked={data.settings.engineByCharger === true}
          onCheckedChange={(v) => updateSettings({ engineByCharger: v })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          צריכה בעמידה עם מנוע דלוק ({energyUnitLabel(data.vehicle)} לשעה)
        </Label>
        <NumberField
          value={text}
          onValueChange={(v) => {
            setText(v);
            const n = parseNumber(v);
            if (!checkNumber(v, { min: 0, max: 10 }) && n != null)
              updateSettings({ idlePerHour: n });
          }}
          error={error}
        />
      </div>
    </>
  );
}
