import { useEffect, useState } from "react";

export type MascotMood = "sleepy" | "grumble" | "smirk" | "victory" | "excited";
export type MascotProp = "coffee" | "cash" | "wheel" | "pump" | "stamp" | "wrench" | "chart" | "none";

/**
 * "הקפטן" — hand-inked 1961 xerox-style caricature driver.
 * Pose-to-pose acting: every mood swaps mouth/brow drawings (not just CSS),
 * while the global #ink-boil filter keeps the line alive.
 */
export function DriverMascot({ mood, prop, className = "", reactive = true }: { mood: MascotMood; prop?: MascotProp; className?: string; reactive?: boolean }) {
  const [pose, setPose] = useState<MascotMood>(mood);
  const [beat, setBeat] = useState(0);

  useEffect(() => setPose(mood), [mood]);
  useEffect(() => {
    if (!reactive) return;
    let timer: number | undefined;
    const onReward = (e: Event) => {
      const kind = (e as CustomEvent<{ kind?: string }>).detail?.kind;
      setPose(kind === "corrective" ? "grumble" : "victory");
      setBeat((b) => b + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPose(mood), 3400);
    };
    window.addEventListener("driver-reward", onReward);
    return () => { window.removeEventListener("driver-reward", onReward); window.clearTimeout(timer); };
  }, [mood, reactive]);

  const held: MascotProp = prop ?? (pose === "sleepy" ? "coffee" : pose === "victory" || pose === "excited" ? "cash" : "none");

  return (
    <span className={`mascot mascot-${pose} ${className}`} key={`${pose}-${beat}`} aria-hidden="true">
      <svg viewBox="0 0 200 240" width="100%" height="100%" overflow="visible">
        <ellipse className="m-shadow" cx="100" cy="232" rx="52" ry="6" />
        <g className="m-ink">
          <g className="m-body">
            {/* legs — long, angular, pointy shoes */}
            <g className="m-legs">
              <path className="m-pants" d="M78 160 L70 222 L86 222 L94 168 Z" />
              <path className="m-pants" d="M106 168 L114 222 L130 222 L124 160 Z" />
              <path className="m-shoe" d="M86 222 L58 224 Q56 230 62 231 L88 230 Z" />
              <path className="m-shoe" d="M114 222 L142 224 Q146 230 140 231 L114 230 Z" />
            </g>
            {/* torso — sharp-shouldered emerald jacket */}
            <g className="m-torso">
              <path className="m-jacket" d="M62 110 Q66 94 86 90 L114 90 Q134 94 140 110 L130 168 L72 168 Z" />
              <path className="m-shirt" d="M88 90 L100 116 L112 90 Z" />
              <path className="m-tie" d="M97 98 L103 98 L106 126 L100 134 L94 126 Z" />
              <path className="m-line" d="M86 90 L96 132 M114 90 L104 132" />
              <path className="m-hatch" d="M72 150 l8 -8 M76 158 l10 -10 M122 150 l6 -6 M118 160 l10 -10" />
              <rect className="m-badge" x="116" y="112" width="14" height="9" rx="2" />
            </g>
            {/* back arm */}
            <g className="m-arm-l">
              <path className="m-jacket" d="M66 104 L44 140 L54 148 L74 120" />
              <path className="m-skin" d="M44 140 q-8 6 -4 13 q6 4 13 -4 Z" />
            </g>
            {/* head */}
            <g className="m-head">
              <path className="m-skin" d="M94 82 L92 94 L108 94 L106 82 Z" />
              <path className="m-skin" d="M70 54 Q66 86 88 92 L112 92 Q134 86 130 54 Q128 30 100 28 Q72 30 70 54 Z" />
              <path className="m-skin" d="M128 56 q10 -2 9 10 q-1 10 -10 8" />
              <path className="m-stubble" d="M78 76 Q100 100 122 76" />
              <g className="m-stubble-dots"><circle cx="86" cy="84" r=".9" /><circle cx="92" cy="88" r=".9" /><circle cx="108" cy="88" r=".9" /><circle cx="114" cy="84" r=".9" /><circle cx="100" cy="90" r=".9" /></g>
              <g className="m-eyes">
                <ellipse className="m-eyewhite" cx="86" cy="56" rx="8" ry="9" />
                <ellipse className="m-eyewhite" cx="112" cy="56" rx="8" ry="9" />
                <g className="m-pupils"><circle className="m-pupil" cx="88" cy="58" r="3.4" /><circle className="m-pupil" cx="114" cy="58" r="3.4" /></g>
                <g className="m-lids"><path className="m-lid" d="M77 54 Q86 44 95 54 Z" /><path className="m-lid" d="M103 54 Q112 44 121 54 Z" /></g>
              </g>
              {pose === "grumble" ? <><path className="m-brow" d="M76 44 L95 50" /><path className="m-brow" d="M122 44 L103 50" /></>
                : pose === "smirk" ? <><path className="m-brow" d="M76 44 L95 46" /><path className="m-brow" d="M104 42 Q114 34 123 40" /></>
                : pose === "sleepy" ? <><path className="m-brow" d="M76 46 Q86 48 95 46" /><path className="m-brow" d="M103 46 Q112 48 122 46" /></>
                : <><path className="m-brow" d="M76 42 Q86 34 95 40" /><path className="m-brow" d="M103 40 Q112 34 122 42" /></>}
              <path className="m-nose" d="M100 58 Q96 66 84 74 Q92 80 102 76" />
              {pose === "sleepy" && <ellipse className="m-mouth-fill" cx="100" cy="82" rx="5" ry="6" />}
              {pose === "grumble" && <path className="m-mouth" d="M88 84 Q100 76 112 84" />}
              {pose === "smirk" && <path className="m-mouth" d="M90 82 Q104 84 114 76" />}
              {(pose === "victory" || pose === "excited") && <path className="m-mouth-fill" d="M86 78 Q100 96 116 78 Z" />}
              {/* flat cap, cocked */}
              <g className="m-cap">
                <path className="m-capfill" d="M66 46 Q70 18 102 18 Q130 20 132 42 Q100 34 66 46 Z" />
                <path className="m-capfill" d="M66 46 L40 50 Q48 38 72 38" />
                <path className="m-line" d="M80 30 Q100 24 122 30" />
              </g>
            </g>
            {/* front arm + prop */}
            <g className="m-arm-r">
              <path className="m-jacket" d="M134 104 L160 132 L152 142 L128 122" />
              <path className="m-skin" d="M160 132 q9 2 6 12 q-7 4 -13 -3 Z" />
              <Prop kind={held} />
            </g>
          </g>
          <g className="m-fx-grr"><path d="M60 22 l-10 -8 M140 22 l10 -8 M100 6 l0 -10" /><text x="140" y="16" className="m-comic">#@!</text></g>
          <g className="m-fx-win"><path d="M30 60 l-14 -4 M170 60 l14 -4 M38 26 l-10 -10 M162 26 l10 -10 M100 0 l0 -14" /></g>
          <text x="134" y="20" className="m-zzz">Z</text>
          <text x="152" y="4" className="m-zzz m-zzz-2">z</text>
        </g>
      </svg>
    </span>
  );
}

function Prop({ kind }: { kind: MascotProp }) {
  switch (kind) {
    case "coffee":
      return <g className="m-cup"><path className="m-cupbody" d="M156 118 L172 118 L170 138 L158 138 Z" /><path className="m-line" d="M172 122 q6 0 5 6 q-1 5 -6 5" /><path className="m-steam" d="M162 112 q-5 -6 0 -11 q5 -5 0 -11" /><path className="m-steam m-steam-2" d="M168 112 q-4 -5 0 -9 q4 -4 0 -9" /></g>;
    case "cash":
      return <g className="m-bill"><g transform="rotate(-24 172 120)"><rect className="m-cash" x="156" y="110" width="34" height="18" rx="2" /><circle className="m-cashring" cx="173" cy="119" r="6" /><text x="169" y="123" className="m-cashtxt">₪</text></g></g>;
    case "wheel":
      return <g className="m-wheel"><circle className="m-wheelrim" cx="164" cy="132" r="20" /><circle className="m-line" cx="164" cy="132" r="5" /><path className="m-line" d="M164 112 L164 127 M146 140 L159 134 M182 140 L169 134" /></g>;
    case "pump":
      return <g className="m-pump"><path className="m-pumpbody" d="M156 124 L178 118 L182 126 L162 134 Z" /><path className="m-line" d="M178 120 L190 116" /><path className="m-drop" d="M192 120 q-3 5 0 7 q3 -2 0 -7" /></g>;
    case "stamp":
      return <g className="m-stamp"><rect className="m-stampwood" x="156" y="108" width="16" height="16" rx="3" /><rect className="m-stampbase" x="150" y="124" width="28" height="8" rx="1" /></g>;
    case "wrench":
      return <g className="m-wrench"><path className="m-metal" d="M158 140 L184 108 L190 112 L164 144 Z" /><path className="m-metal" d="M184 108 q-2 -10 8 -12 l-3 6 l5 3 l5 -4 q0 10 -10 11 Z" /></g>;
    case "chart":
      return <g className="m-chart"><rect className="m-paper" x="150" y="100" width="34" height="42" rx="2" transform="rotate(-8 167 121)" /><path className="m-line" d="M156 132 L164 122 L170 128 L180 112" transform="rotate(-8 167 121)" /></g>;
    default:
      return null;
  }
}
