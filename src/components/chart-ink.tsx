/**
 * Paper-world pieces for the recharts cards: a flat colour that slips off an inked line
 * (like every card and button), pencil hatching, and a tooltip drawn as a small cel.
 */

export const INK_TOOLTIP = {
  background: "var(--card)",
  border: "var(--line) solid var(--ink)",
  borderRadius: "10px 12px 9px 11px / 11px 9px 12px 10px",
  boxShadow: "3px 3px 0 var(--paper-shade)",
  color: "var(--ink)",
  fontSize: 12,
  fontWeight: 700,
  direction: "rtl" as const,
};

export const INK_GRID = { stroke: "var(--ink)", strokeOpacity: 0.18, strokeDasharray: "2 6" };

export const INK_TICK = { fill: "var(--ink)", fillOpacity: 0.65, fontSize: 10, fontWeight: 700 };

/**
 * Hatch patterns, referenced as url(#ink-hatch) and url(#ink-hatch-loss). Same ids in every chart, same content.
 * Call it as `{inkPatterns()}`: recharts drops child components it does not know, but keeps a plain <defs>.
 */
export function inkPatterns() {
  return (
    <defs>
      <pattern
        id="ink-hatch"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <rect width="5" height="5" fill="var(--green-tint)" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="5"
          stroke="var(--primary)"
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />
      </pattern>
      <pattern
        id="ink-hatch-loss"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <rect width="5" height="5" fill="var(--vermilion-tint)" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="5"
          stroke="var(--vermilion)"
          strokeOpacity="0.5"
          strokeWidth="1.6"
        />
      </pattern>
    </defs>
  );
}

type BarShape = { x?: number; y?: number; width?: number; height?: number; fill?: string };

/** A bar as a cel: the flat fill printed 1.5px off, the ink line on top. */
export function InkBar({ x = 0, y = 0, width = 0, height = 0, fill }: BarShape) {
  // a bar below the zero line can arrive with a negative height
  const top = height < 0 ? y + height : y;
  const h = Math.abs(height);
  if (!width || !h) return null;
  return (
    <g>
      <rect x={x + 1.5} y={top + 1.5} width={width} height={h} rx={2} fill={fill} />
      <rect
        x={x}
        y={top}
        width={width}
        height={h}
        rx={2}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.2}
      />
    </g>
  );
}

/** Legend swatch: a small inked square, or a line with its dot. */
export function InkKey({
  fill,
  label,
  line = false,
}: {
  fill: string;
  label: string;
  line?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {line ? (
        <svg width="16" height="8" aria-hidden="true">
          <line x1="1" y1="4" x2="15" y2="4" stroke="var(--ink)" strokeWidth="1.6" />
          <circle cx="8" cy="4" r="2.6" fill={fill} stroke="var(--ink)" strokeWidth="1" />
        </svg>
      ) : (
        <span
          className="h-2.5 w-2.5 rounded-[2px] border border-[color:var(--ink)]"
          style={{ background: fill }}
        />
      )}
      {label}
    </span>
  );
}
