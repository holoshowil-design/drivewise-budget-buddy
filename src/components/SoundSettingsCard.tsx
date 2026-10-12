import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { playSound, setSoundEnabled, soundEnabled, type SoundName } from "@/lib/sound";

/** The samples button walks through these, so it is easy to say which one to change. */
const SAMPLES: readonly { sound: SoundName; label: string }[] = [
  { sound: "aooga", label: "הצופר של טורבו" },
  { sound: "tune", label: "הקפטן מזמזם" },
  { sound: "turbo-start", label: "טורבו מתניע" },
  { sound: "grumble", label: "הקפטן רוטן" },
  { sound: "brake", label: "בלימה" },
  { sound: "whistle", label: "הקפטן שורק" },
  { sound: "kaching", label: "קופה רושמת" },
  { sound: "victory", label: "הקפטן חוגג" },
  { sound: "womp", label: "טרומבון עצוב" },
  { sound: "fanfare", label: "תרועת ניצחון" },
  { sound: "snore", label: "הקפטן נוחר" },
];

export function SoundSettingsCard() {
  const [on, setOn] = useState(true);
  const [heard, setHeard] = useState<string | null>(null);
  const next = useRef(0);
  useEffect(() => setOn(soundEnabled()), []);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-semibold">צלילים</h3>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="sound-on">הקפטן וטורבו משמיעים קולות</Label>
            <p className="text-xs text-muted-foreground">
              מלמולים, נעימות, מנוע, בלימה וצופר. במצב נהיגה תמיד שקט.
            </p>
          </div>
          <Switch
            id="sound-on"
            checked={on}
            onCheckedChange={(v) => {
              setOn(v);
              setSoundEnabled(v);
              if (v) playSound("beep");
            }}
          />
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={!on}
          onClick={() => {
            const sample = SAMPLES[next.current % SAMPLES.length];
            next.current += 1;
            playSound(sample.sound);
            setHeard(sample.label);
          }}
        >
          <Volume2 className="h-4 w-4 ml-1" />
          השמע דוגמה
        </Button>
        {heard && (
          <p className="text-xs text-muted-foreground text-center" aria-live="polite">
            {heard}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
