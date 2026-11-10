import { useEffect, useState } from "react";

const CX = 110;
const CY = 112;
const R = 86;

/** A point on the dial: `t` runs 0 (left end) to 1 (right end) over the top half. */
function at(t: number, r: number): [number, number] {
  const a = Math.PI - t * Math.PI;
  return [CX + Math.cos(a) * r, CY - Math.sin(a) * r];
}
const arc = (r: number, from = 0, to = 1) => {
  const [x1, y1] = at(from, r);
  const [x2, y2] = at(to, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/** Round numbers for the dial face: 500 -> 0, 125, 250, 375, 500. */
function faceNumbers(goal: number): string[] {
  if (!(goal > 0)) return ["0", "25", "50", "75", "100"];
  return [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = goal * f;
    return v >= 10000 ? `${Math.round(v / 1000)}K` : String(Math.round(v));
  });
}

/**
 * The daily-profit instrument, drawn like the dashboard dial of a 1961 taxi: a cream face
 * in a chrome ring, inked ticks and numbers, a red needle on a hub, and a small flag at the
 * break-even point. Flat cel colours only, like the rest of the paper world.
 */
export function MeterDial({
  pct,
  goal,
  breakEvenPct,
  passedBreakEven,
  label,
}: {
  pct: number; // 0-100 of the daily goal
  goal: number;
  breakEvenPct: number | null; // where break-even sits on the dial, null when off it
  passedBreakEven: boolean;
  label: string;
}) {
  const t = Math.max(0, Math.min(1, pct / 100));
  const numbers = faceNumbers(goal);
  return (
    <svg
      viewBox="0 0 220 124"
      className="meter-dial h-full w-full overflow-visible"
      role="img"
      aria-label={label}
    >
      {/* chrome ring, then the face */}
      <path
        d={`${arc(R + 9)} L ${CX + R + 9} ${CY + 6} L ${CX - R - 9} ${CY + 6} Z`}
        className="meter-bezel"
      />
      <path d={`${arc(R + 4.5)}`} className="meter-bezel-shine" />
      <path d={`${arc(R)} L ${CX + R} ${CY + 2} L ${CX - R} ${CY + 2} Z`} className="meter-face" />
      {/* coloured band: how far the day has come */}
      <path d={arc(R - 7)} className="meter-band" />
      {t > 0.004 && (
        <path
          d={arc(R - 7, 0, t)}
          className="meter-band-value"
          stroke={passedBreakEven ? "var(--success)" : "var(--mustard)"}
        />
      )}
      <g className="meter-ticks">
        {Array.from({ length: 21 }, (_, i) => {
          const major = i % 5 === 0;
          const [x1, y1] = at(i / 20, R - (major ? 22 : 17));
          const [x2, y2] = at(i / 20, R - 12);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 2.2 : 1.1} />;
        })}
      </g>
      <g className="meter-numbers">
        {numbers.map((n, i) => {
          const [x, y] = at([0.07, 0.25, 0.5, 0.75, 0.93][i], R - 34);
          return (
            <text key={i} x={x} y={y + 3.5} textAnchor="middle">
              {n}
            </text>
          );
        })}
      </g>
      {breakEvenPct !== null && (
        <g
          className={`meter-flag ${passedBreakEven ? "meter-flag-passed" : ""}`}
          style={{ transform: `rotate(${-90 + breakEvenPct * 1.8}deg)` }}
        >
          <line x1={CX} y1={CY - R + 12} x2={CX} y2={CY - R - 6} />
          <path d={`M ${CX} ${CY - R - 6} l 9 3.5 l -9 3.5 Z`} />
        </g>
      )}
      <g className="gauge-needle meter-needle" style={{ transform: `rotate(${-90 + t * 180}deg)` }}>
        <path d={`M ${CX} ${CY - R + 14} L ${CX - 3.6} ${CY + 9} L ${CX + 3.6} ${CY + 9} Z`} />
      </g>
      <circle cx={CX} cy={CY} r="9.5" className="meter-hub" />
      <circle cx={CX - 2.6} cy={CY - 2.8} r="2.4" className="meter-hub-shine" />
    </svg>
  );
}

/**
 * The amount on taxi-meter drums: every digit sits in its own inked window and rolls to
 * its place. Screen readers get the plain amount.
 */
export function MeterDrums({
  value,
  text,
  currency,
}: {
  value: number;
  text: string;
  currency: string;
}) {
  const n = Math.round(value);
  const digits = String(Math.abs(n)).padStart(3, "0").split("");
  const lead = digits.length - String(Math.abs(n)).length; // leading zeros, drawn faint
  // Start at zero and roll up once mounted.
  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRolled(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="meter-drums" dir="ltr">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="meter-drums-row">
        {n < 0 && <span className="meter-sign">−</span>}
        {digits.map((d, i) => (
          <span
            key={digits.length - i}
            className={`meter-drum ${i < lead ? "meter-drum-lead" : ""}`}
          >
            <span
              className="meter-reel"
              style={{
                transform: `translateY(-${(rolled ? Number(d) : 0) * 10}%)`,
                transitionDelay: `${(digits.length - 1 - i) * 90}ms`,
              }}
            >
              {"0123456789".split("").map((c) => (
                <span key={c}>{c}</span>
              ))}
            </span>
          </span>
        ))}
        <span className="meter-currency">{currency}</span>
      </span>
    </div>
  );
}
