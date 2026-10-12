import type { ReactNode } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import { ComicBubble } from "@/components/InkWorld";
import { MovieStage } from "@/components/MovieStage";

/** Painted Tel Aviv backdrops in public/backdrops. */
export type StageBackdrop = "street" | "road" | "promenade" | "garage";
export type PageScene = { mood: MascotMood; prop?: MascotProp; line: string; taxi?: TaxiMood; driving?: boolean; backdrop?: StageBackdrop };

export function PageHeader({ title, subtitle, action, scene }: { title: string; subtitle?: string; action?: ReactNode; scene?: PageScene }) {
  return (
    <header className="px-4 pb-3 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="ink-title text-[2rem] font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm font-semibold text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {scene && (
        <div className={`page-stage stage-bg stage-${scene.backdrop ?? "street"}`} aria-hidden="true">
          <MovieStage base={{ mood: scene.mood, prop: scene.prop, taxi: scene.taxi, driving: scene.driving }} mascotClass="page-stage-mascot" taxiClass="page-stage-taxi" />
          <ComicBubble side="end" className="page-stage-bubble">{scene.line}</ComicBubble>
        </div>
      )}
    </header>
  );
}
