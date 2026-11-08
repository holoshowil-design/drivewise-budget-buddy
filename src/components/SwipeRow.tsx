import { useRef, useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

/** Pixels the row must travel before letting go acts. */
const ACT_AT = 96;

/**
 * A list row that swipes: to the left deletes (the list already offers undo),
 * to the right edits. Vertical scrolling stays with the browser; the row only
 * moves once the finger clearly goes sideways. The buttons in the row keep
 * working, so the swipe is only a shortcut.
 */
export function SwipeRow({
  children,
  onDelete,
  onEdit,
}: {
  children: ReactNode;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const locked = useRef<"x" | "y" | null>(null);
  const past = useRef(false);
  const swiped = useRef(false);
  const [dx, setDx] = useState(0);
  const [moving, setMoving] = useState(false);

  const reset = () => {
    start.current = null;
    locked.current = null;
    past.current = false;
    setMoving(false);
    setDx(0);
  };

  return (
    <div className="relative overflow-hidden">
      {dx !== 0 && (
        <div
          className={`absolute inset-0 flex items-center px-5 text-sm font-bold ${
            dx < 0
              ? "justify-end bg-destructive text-destructive-foreground"
              : "justify-start bg-primary text-primary-foreground"
          }`}
          dir="ltr"
          aria-hidden="true"
        >
          <span
            className="flex items-center gap-1.5"
            style={{ opacity: Math.min(1, Math.abs(dx) / ACT_AT) }}
          >
            {dx < 0 ? (
              <>
                מחיקה <Trash2 className="h-4 w-4" />
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" /> עריכה
              </>
            )}
          </span>
        </div>
      )}
      <div
        className={`relative bg-card ${moving ? "" : "transition-transform duration-150 motion-reduce:transition-none"}`}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, touchAction: "pan-y" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          locked.current = null;
          swiped.current = false;
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) return;
          const mx = e.clientX - s.x;
          const my = e.clientY - s.y;
          if (!locked.current) {
            if (Math.abs(my) > 8 && Math.abs(my) > Math.abs(mx)) locked.current = "y";
            else if (Math.abs(mx) > 12) {
              locked.current = "x";
              swiped.current = true;
              setMoving(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }
          if (locked.current !== "x") return;
          const now = Math.abs(mx) >= ACT_AT;
          if (now !== past.current) {
            past.current = now;
            if (now) haptic("light");
          }
          setDx(mx);
        }}
        onPointerUp={() => {
          const go = locked.current === "x" && past.current;
          const dir = dx;
          reset();
          if (!go) return;
          haptic(dir < 0 ? "warning" : "tap");
          if (dir < 0) onDelete();
          else onEdit();
        }}
        onPointerCancel={reset}
        onClickCapture={(e) => {
          // A swipe that ended over a button must not also press it.
          if (swiped.current) {
            e.stopPropagation();
            e.preventDefault();
            swiped.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
