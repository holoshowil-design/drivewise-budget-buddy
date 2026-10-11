import type { ReactNode } from "react";
import { DriverMascot, type MascotMood, type MascotProp } from "@/components/DriverMascot";
import { CaricatureTaxi } from "@/components/CaricatureTaxi";
import { ComicBubble } from "@/components/InkWorld";

export type PageScene = { mood: MascotMood; prop?: MascotProp; line: string; taxi?: "happy" | "tired" | "zoom"; driving?: boolean };

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
        <div className="page-stage" aria-hidden="true">
          <span className="page-stage-floor" />
          {scene.taxi && <CaricatureTaxi mood={scene.taxi} driving={scene.driving} className="page-stage-taxi" />}
          <DriverMascot mood={scene.mood} prop={scene.prop} className="page-stage-mascot" />
          <ComicBubble side="end" className="page-stage-bubble">{scene.line}</ComicBubble>
        </div>
      )}
    </header>
  );
}
