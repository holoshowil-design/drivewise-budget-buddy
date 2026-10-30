import { useEffect, useState } from "react";

export type MascotMood = "sleepy" | "grumble" | "smirk" | "victory" | "excited" | "shock" | "pain";
export type MascotProp =
  "coffee" | "cash" | "wheel" | "pump" | "stamp" | "wrench" | "chart" | "phone" | "rag" | "none";
type HandShape = "open" | "fist" | "point" | "grip";

/**
 * "הקפטן" — lanky 1961 xerox-style caricature (Milt Kahl school): hunched pear torso,
 * jutting jaw, hooked nose, articulated shoulders/elbows/hands. Pose-to-pose acting swaps
 * drawn mouth, brow and hand shapes; the global #ink-boil filter keeps the line alive.
 */
export function DriverMascot({
  mood,
  prop,
  className = "",
  reactive = true,
}: {
  mood: MascotMood;
  prop?: MascotProp;
  className?: string;
  reactive?: boolean;
}) {
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
    return () => {
      window.removeEventListener("driver-reward", onReward);
      window.clearTimeout(timer);
    };
  }, [mood, reactive]);

  const held: MascotProp =
    prop ??
    (pose === "sleepy" ? "coffee" : pose === "victory" || pose === "excited" ? "cash" : "none");
  const backHand: HandShape =
    pose === "grumble" || pose === "pain" ? "fist" : pose === "smirk" ? "grip" : "open";
  const frontHand: HandShape =
    held !== "none" ? "grip" : pose === "grumble" ? "fist" : pose === "smirk" ? "point" : "open";

  return (
    <span
      className={`mascot mascot-${pose} ${className}`}
      key={`${pose}-${beat}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 240" width="100%" height="100%" overflow="visible">
        <ellipse className="m-shadow" cx="100" cy="232" rx="50" ry="6" />
        <g className="m-ink">
          <g className="m-body">
            {/* legs: long, knock-kneed, enormous pointed shoes */}
            <g className="m-legs">
              <path
                className="m-pants"
                d="M80 164 Q76 190 82 200 Q78 212 76 224 L90 224 Q92 210 94 200 Q96 184 98 168 Z"
              />
              <path
                className="m-pants"
                d="M104 168 Q106 186 110 200 Q112 212 112 224 L126 224 Q124 210 122 198 Q126 182 124 164 Z"
              />
              <path
                className="m-hatch"
                d="M84 186 l6 -4 M86 206 l6 -3 M112 190 l6 -4 M114 208 l6 -3"
              />
              <path
                className="m-shoe"
                d="M90 222 Q70 220 56 226 Q50 232 58 233 L92 232 Q94 226 90 222 Z"
              />
              <path
                className="m-shoe"
                d="M112 222 Q132 219 148 224 Q158 230 150 233 L112 232 Q108 227 112 222 Z"
              />
              <path className="m-shine" d="M62 228 q8 -3 16 -3 M136 226 q6 0 10 2" />
            </g>
            {/* torso: hunched pear, sharp lapels, skinny tie */}
            <g className="m-torso">
              <path
                className="m-jacket"
                d="M70 106 Q74 96 90 97 L112 97 Q128 99 134 112 Q141 140 132 170 Q102 176 74 170 Q63 140 70 106 Z"
              />
              <path className="m-shirt" d="M90 97 L101 122 L112 97 Z" />
              <path className="m-lapel" d="M90 97 L84 118 L97 128 Z M112 97 L118 118 L105 128 Z" />
              <path
                className="m-tie"
                d="M98 104 L104 104 L108 134 Q104 142 101 144 Q96 140 94 134 Z"
              />
              <path className="m-line" d="M74 152 Q102 160 132 152" />
              <path className="m-pocket" d="M112 140 L126 138 L127 146 L113 148 Z" />
              <path className="m-pen" d="M118 140 L120 130 L123 131 L121 140" />
              <path
                className="m-hatch"
                d="M76 128 l6 -6 M74 140 l9 -9 M76 162 l10 -10 M126 124 l5 -5 M128 160 l4 -6"
              />
              <path className="m-crease" d="M84 150 q4 6 2 12 M118 152 q-3 6 -1 12" />
            </g>
            {/* back arm: shoulder → elbow → hand */}
            <g className="m-arm-l">
              <path className="m-jacket" d="M72 104 L82 112 L66 140 L55 134 Z" />
              <g className="m-fore-l">
                <path className="m-jacket" d="M55 134 L66 140 L58 162 L47 158 Z" />
                <path className="m-cuff" d="M47 158 L58 162 L57 166 L46 162 Z" />
                <Hand shape={backHand} x={50} y={168} rot={100} />
              </g>
            </g>
            {/* head */}
            <g className="m-head">
              <path className="m-skin" d="M93 84 L91 100 L106 100 L104 84 Z" />
              <path className="m-line" d="M95 92 q4 2 8 0" />
              <path className="m-skin" d="M68 58 q-11 -4 -11 8 q0 11 11 10 Z" />
              <path className="m-line" d="M63 62 q3 3 0 8" />
              <path
                className="m-skin m-sil"
                d="M74 50 Q72 32 92 29 Q116 26 123 42 Q128 54 124 66 Q130 82 118 92 Q104 100 88 96 Q76 92 76 80 Q70 66 74 50 Z"
              />
              <path className="m-hair" d="M72 46 l-6 5 l6 1 l-5 6 l7 -1 l-3 6" />
              <path className="m-stubble" d="M80 80 Q84 94 100 96 Q114 96 120 86" />
              <g className="m-stubble-dots">
                <circle cx="84" cy="88" r=".9" />
                <circle cx="90" cy="92" r=".9" />
                <circle cx="97" cy="94" r=".9" />
                <circle cx="110" cy="93" r=".9" />
                <circle cx="116" cy="89" r=".9" />
                <circle cx="88" cy="85" r=".9" />
                <circle cx="113" cy="85" r=".9" />
              </g>
              <path className="m-line" d="M86 64 q6 4 12 0 M106 62 q5 3 10 0" />
              <g className="m-eyes">
                <ellipse className="m-eyewhite" cx="92" cy="55" rx="7" ry="8" />
                <ellipse className="m-eyewhite" cx="110" cy="53" rx="6" ry="7.5" />
                <g className="m-pupils">
                  <circle className="m-pupil" cx="94" cy="57" r={pose === "shock" ? 1.6 : 2.8} />
                  <circle className="m-pupil" cx="112" cy="55" r={pose === "shock" ? 1.6 : 2.6} />
                </g>
                <g className="m-lids">
                  <path className="m-lid" d="M84 53 Q92 44 100 53 Z" />
                  <path className="m-lid" d="M103 51 Q110 43 117 51 Z" />
                </g>
              </g>
              <Brows pose={pose} />
              <Mouth pose={pose} />
              <path
                className="m-skin m-nose"
                d="M102 50 Q110 58 120 68 Q131 78 125 85 Q117 90 108 83 Q104 80 106 74"
              />
              <path className="m-line" d="M114 81 q3 2 6 -1" />
              {/* flat cap, cocked forward */}
              <g className="m-cap">
                <path
                  className="m-capfill"
                  d="M70 48 Q71 22 98 19 Q124 18 129 38 Q104 32 70 48 Z"
                />
                <path className="m-capfill" d="M110 36 Q134 32 143 41 Q130 47 112 45 Z" />
                <path className="m-line" d="M80 34 Q98 26 122 30 M92 22 Q96 30 94 40" />
                <circle className="m-capbtn" cx="99" cy="20" r="2.4" />
              </g>
            </g>
            {/* front arm + prop */}
            <g className="m-arm-r">
              <path className="m-jacket" d="M124 104 L134 110 L150 136 L139 142 Z" />
              <g className="m-fore-r">
                <path className="m-jacket" d="M139 142 L150 136 L166 148 L159 157 Z" />
                <path className="m-cuff" d="M159 157 L166 148 L170 151 L163 160 Z" />
                <g transform="translate(4 26)">
                  <Prop kind={held} />
                </g>
                <Hand shape={frontHand} x={168} y={156} rot={-30} />
              </g>
            </g>
          </g>
          <g className="m-fx-grr">
            <path d="M60 18 l-10 -8 M140 18 l10 -8 M100 4 l0 -10" />
            <text x="140" y="12" className="m-comic">
              #@!
            </text>
          </g>
          <g className="m-fx-win">
            <path d="M30 60 l-14 -4 M170 60 l14 -4 M38 26 l-10 -10 M162 26 l10 -10 M100 0 l0 -14" />
          </g>
          <g className="m-fx-shock">
            <path d="M70 14 l-6 -12 M100 8 l0 -14 M130 14 l6 -12" />
            <text x="132" y="8" className="m-comic">
              !?
            </text>
          </g>
          <g className="m-fx-sweat">
            <path d="M70 44 q-4 6 0 9 q4 -3 0 -9" />
          </g>
          <text x="134" y="18" className="m-zzz">
            Z
          </text>
          <text x="152" y="2" className="m-zzz m-zzz-2">
            z
          </text>
        </g>
      </svg>
    </span>
  );
}

function Brows({ pose }: { pose: MascotMood }) {
  switch (pose) {
    case "grumble":
    case "pain":
      return (
        <>
          <path className="m-browfill" d="M82 44 L100 50 L99 54 L82 48 Z" />
          <path className="m-browfill" d="M120 40 L104 48 L104 52 L121 44 Z" />
        </>
      );
    case "smirk":
      return (
        <>
          <path className="m-browfill" d="M82 46 L100 46 L100 50 L82 50 Z" />
          <path className="m-browfill" d="M103 40 Q112 30 121 36 L120 40 Q112 35 104 44 Z" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path className="m-browfill" d="M82 46 Q91 49 100 47 L100 50 Q91 52 82 50 Z" />
          <path className="m-browfill" d="M103 45 Q111 48 119 45 L119 48 Q111 51 103 48 Z" />
        </>
      );
    case "shock":
      return (
        <>
          <path className="m-browfill" d="M82 36 Q91 28 100 34 L99 38 Q91 33 83 40 Z" />
          <path className="m-browfill" d="M103 32 Q112 24 121 30 L120 34 Q112 29 104 36 Z" />
        </>
      );
    default:
      return (
        <>
          <path className="m-browfill" d="M82 42 Q91 33 100 39 L99 43 Q91 38 83 46 Z" />
          <path className="m-browfill" d="M103 38 Q112 30 121 37 L120 41 Q112 35 104 42 Z" />
        </>
      );
  }
}

function Mouth({ pose }: { pose: MascotMood }) {
  switch (pose) {
    case "sleepy":
      return (
        <g className="m-yawn">
          <ellipse className="m-mouth-fill" cx="98" cy="86" rx="6" ry="7" />
          <path className="m-tongue" d="M93 89 q5 4 10 0 q-5 -3 -10 0" />
        </g>
      );
    case "grumble":
      return (
        <g>
          <path className="m-mouth-fill" d="M86 88 Q98 80 110 88 L108 92 Q98 86 88 92 Z" />
          <path className="m-teeth" d="M89 88 h18" />
        </g>
      );
    case "smirk":
      return <path className="m-mouth" d="M84 86 Q96 90 104 86 Q110 84 114 78" />;
    case "shock":
      return <ellipse className="m-mouth-fill" cx="97" cy="88" rx="4" ry="6" />;
    case "pain":
      return <path className="m-mouth" d="M84 88 l5 -4 l5 4 l5 -4 l5 4 l5 -4" />;
    default:
      return (
        <g>
          <path className="m-mouth-fill" d="M82 82 Q98 102 114 80 Q98 88 82 82 Z" />
          <path className="m-teeth-fill" d="M85 83 Q98 89 111 82 L110 86 Q98 91 86 87 Z" />
          <path className="m-tongue" d="M92 94 q6 -4 12 -1 q-6 4 -12 1" />
        </g>
      );
  }
}

function Hand({ shape, x, y, rot }: { shape: HandShape; x: number; y: number; rot: number }) {
  const t = `translate(${x} ${y}) rotate(${rot})`;
  if (shape === "open")
    return (
      <g transform={t} className="m-hand">
        <path
          className="m-skin"
          d="M-5 -5 Q2 -8 6 -4 L16 -9 Q19 -8 17 -5 L9 -1 L19 -1 Q20 2 17 3 L8 3 L16 8 Q16 11 13 10 L5 6 L9 13 Q7 15 4 13 L-1 7 Q-7 6 -7 0 Z"
        />
      </g>
    );
  if (shape === "point")
    return (
      <g transform={t} className="m-hand">
        <path
          className="m-skin"
          d="M-5 -6 Q6 -9 10 -4 L22 -6 Q24 -3 21 -1 L10 1 Q11 7 4 8 Q-5 9 -7 2 Z"
        />
        <path className="m-line" d="M1 2 q3 1 5 0" />
      </g>
    );
  return (
    <g transform={t} className="m-hand">
      <path className="m-skin" d="M-5 -6 Q7 -10 11 -2 Q13 6 4 9 Q-5 10 -7 2 Z" />
      <path className="m-line" d="M3 -5 q3 3 1 7 M8 -3 q2 3 0 6" />
    </g>
  );
}

function Prop({ kind }: { kind: MascotProp }) {
  switch (kind) {
    case "coffee":
      return (
        <g className="m-cup">
          <path className="m-cupbody" d="M156 118 L172 118 L170 138 L158 138 Z" />
          <path className="m-line" d="M172 122 q6 0 5 6 q-1 5 -6 5" />
          <path className="m-cupband" d="M157 126 h14" />
          <path className="m-steam" d="M162 112 q-5 -6 0 -11 q5 -5 0 -11" />
          <path className="m-steam m-steam-2" d="M168 112 q-4 -5 0 -9 q4 -4 0 -9" />
        </g>
      );
    case "cash":
      return (
        <g className="m-bill">
          <g transform="rotate(-24 172 120)">
            <rect className="m-cash" x="156" y="110" width="34" height="18" rx="2" />
            <circle className="m-cashring" cx="173" cy="119" r="6" />
            <text x="169" y="123" className="m-cashtxt">
              ₪
            </text>
          </g>
          <g transform="rotate(-8 172 120)">
            <rect className="m-cash" x="154" y="114" width="34" height="18" rx="2" />
          </g>
        </g>
      );
    case "wheel":
      return (
        <g className="m-wheel">
          <circle className="m-wheelrim" cx="164" cy="132" r="20" />
          <circle className="m-line" cx="164" cy="132" r="5" />
          <path className="m-line" d="M164 112 L164 127 M146 140 L159 134 M182 140 L169 134" />
        </g>
      );
    case "pump":
      return (
        <g className="m-pump">
          <path className="m-pumpbody" d="M156 124 L178 118 L182 126 L162 134 Z" />
          <path className="m-line" d="M178 120 L190 116" />
          <path className="m-drop" d="M192 120 q-3 5 0 7 q3 -2 0 -7" />
        </g>
      );
    case "stamp":
      return (
        <g className="m-stamp">
          <rect className="m-stampwood" x="156" y="108" width="16" height="16" rx="3" />
          <rect className="m-stampbase" x="150" y="124" width="28" height="8" rx="1" />
        </g>
      );
    case "wrench":
      return (
        <g className="m-wrench">
          <path className="m-metal" d="M158 140 L184 108 L190 112 L164 144 Z" />
          <path className="m-metal" d="M184 108 q-2 -10 8 -12 l-3 6 l5 3 l5 -4 q0 10 -10 11 Z" />
        </g>
      );
    case "chart":
      return (
        <g className="m-chart">
          <rect
            className="m-paper"
            x="150"
            y="100"
            width="34"
            height="42"
            rx="2"
            transform="rotate(-8 167 121)"
          />
          <path
            className="m-line"
            d="M156 132 L164 122 L170 128 L180 112"
            transform="rotate(-8 167 121)"
          />
        </g>
      );
    case "phone":
      return (
        <g className="m-phone">
          <rect
            className="m-phonebody"
            x="158"
            y="104"
            width="13"
            height="22"
            rx="3"
            transform="rotate(-14 164 115)"
          />
          <path className="m-line m-ring" d="M176 100 q4 4 0 8 M181 96 q7 8 0 16" />
        </g>
      );
    case "rag":
      return (
        <g className="m-rag">
          <path
            className="m-ragcloth"
            d="M154 116 Q164 108 176 114 Q172 124 178 132 Q166 136 156 130 Q160 122 154 116 Z"
          />
          <path className="m-line" d="M160 120 q6 -2 10 2" />
        </g>
      );
    default:
      return null;
  }
}
