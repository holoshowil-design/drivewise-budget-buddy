import { useEffect, useId, useState } from "react";

export type MascotMood = "sleepy" | "grumble" | "smirk" | "victory";

/**
 * Hand-inked caricature driver (1961 xerox-line spirit): angular silhouette,
 * "boiling" scratchy outline, pose-to-pose acting driven by the day's money state.
 */
export function DriverMascot({ mood }: { mood: MascotMood }) {
  const uid = useId().replace(/:/g, "");
  const [pose, setPose] = useState<MascotMood>(mood);
  const [beat, setBeat] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => setPose(mood), [mood]);
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let timer: number | undefined;
    const onReward = (e: Event) => {
      const kind = (e as CustomEvent<{ kind?: string }>).detail?.kind;
      setPose(kind === "corrective" ? "grumble" : "victory");
      setBeat((b) => b + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPose(mood), 3200);
    };
    window.addEventListener("driver-reward", onReward);
    return () => { window.removeEventListener("driver-reward", onReward); window.clearTimeout(timer); };
  }, [mood]);

  const f = `ink-${uid}`;
  return (
    <span className={`mascot mascot-${pose}`} key={`${pose}-${beat}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <defs>
          <filter id={f} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="1">
              {!still && <animate attributeName="seed" values="1;4;7;2" dur="0.5s" repeatCount="indefinite" calcMode="discrete" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
        </defs>
        <ellipse className="m-shadow" cx="60" cy="113" rx="30" ry="4" />
        <g filter={`url(#${f})`} className="m-ink">
          <g className="m-body">
            {/* jacket: angular, broad sharp shoulders */}
            <path className="m-jacket" d="M30 112 L36 80 Q40 70 52 68 L68 68 Q81 70 86 80 L92 112 Z" />
            <path className="m-shirt" d="M53 68 L60 82 L67 68" />
            <path className="m-line" d="M60 82 L60 110" />
            {/* arms */}
            <g className="m-arm-l"><path className="m-jacket" d="M36 80 L22 96 L28 100 L40 88" /><circle className="m-skin" cx="24" cy="98" r="4" /></g>
            <g className="m-arm-r">
              <path className="m-jacket" d="M84 80 L98 94 L93 99 L82 88" />
              <circle className="m-skin" cx="96" cy="97" r="4" />
              <g className="m-cup"><path className="m-cupbody" d="M92 84 L100 84 L99 94 L93 94 Z" /><path className="m-steam" d="M95 80 q-3 -4 0 -7 q3 -3 0 -7" /></g>
              <g className="m-bill"><rect className="m-cash" x="92" y="76" width="16" height="9" rx="1" transform="rotate(-18 100 80)" /><text x="96" y="83" className="m-cashtxt" transform="rotate(-18 100 80)">₪</text></g>
            </g>
            {/* head: long angular caricature */}
            <g className="m-head">
              <path className="m-skin" d="M46 42 Q44 62 54 68 L66 68 Q76 62 74 42 Q72 30 60 30 Q48 30 46 42 Z" />
              <path className="m-stubble" d="M50 58 Q60 70 70 58" />
              <path className="m-skin" d="M58 48 L52 58 L60 58" />{/* big nose */}
              <g className="m-eyes">
                <ellipse className="m-eyewhite" cx="53" cy="45" rx="4" ry="4.5" />
                <ellipse className="m-eyewhite" cx="66" cy="45" rx="4" ry="4.5" />
                <circle className="m-pupil" cx="54" cy="46" r="1.7" />
                <circle className="m-pupil" cx="67" cy="46" r="1.7" />
                <path className="m-lid" d="M48.5 43 Q53 41 57.5 43 L57.5 45 L48.5 45 Z M61.5 43 Q66 41 70.5 43 L70.5 45 L61.5 45 Z" />
              </g>
              <path className="m-brow m-brow-l" d="M48 38 L57 40" />
              <path className="m-brow m-brow-r" d="M63 40 L72 38" />
              <path className="m-mouth" d="M54 62 Q60 64 66 61" />
              <ellipse className="m-yawn" cx="60" cy="63" rx="3.5" ry="4" />
              {/* flat cap, cocked */}
              <g className="m-cap">
                <path className="m-capfill" d="M43 37 Q46 22 62 23 Q77 24 77 36 Z" />
                <path className="m-capfill" d="M43 37 L28 40 Q34 34 46 33" />
              </g>
            </g>
          </g>
          {/* action lines / sparks */}
          <g className="m-fx-grr"><path d="M38 28 l-6 -5 M82 28 l6 -5 M60 14 l0 -7" /></g>
          <g className="m-fx-win"><path d="M18 40 l-8 -2 M102 40 l8 -2 M22 22 l-6 -6 M98 22 l6 -6 M60 10 l0 -8" /></g>
          <text x="80" y="22" className="m-zzz">z</text>
        </g>
      </svg>
    </span>
  );
}
