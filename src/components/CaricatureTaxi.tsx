export type TaxiMood = "happy" | "tired" | "zoom" | "honk" | "cough" | "shock";

/** "טורבו" — bulbous 1950s checker cab: lidded headlight eyes, grille mouth with teeth, mirror ears,
 * rubber-hose body on springs, spoked wheels, wipers, dust and comic exhaust. Visual only. */
export function CaricatureTaxi({
  mood = "happy",
  driving = false,
  className = "",
}: {
  mood?: TaxiMood;
  driving?: boolean;
  className?: string;
}) {
  const lid =
    mood === "tired" || mood === "cough"
      ? "M18 80 Q30 66 42 80 Z"
      : mood === "zoom"
        ? "M18 76 Q30 70 42 77 Z"
        : null;
  return (
    <span
      className={`taxi taxi-${mood} ${driving ? "taxi-driving" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 140" width="100%" height="100%" overflow="visible">
        <ellipse className="m-shadow taxi-shadow" cx="120" cy="133" rx="98" ry="6" />
        <g className="taxi-puffs">
          <circle className="taxi-puff" cx="226" cy="108" r="9" />
          <circle className="taxi-puff taxi-puff-2" cx="234" cy="96" r="7" />
          <circle className="taxi-puff taxi-puff-3" cx="240" cy="112" r="5" />
        </g>
        <g className="taxi-dust">
          <path d="M196 128 q8 -8 16 0 q6 -6 12 0" />
          <path d="M80 130 q6 -6 12 0" />
        </g>
        {driving && (
          <g className="taxi-speed">
            <path d="M232 54 h22 M236 70 h14 M228 38 h12 M240 86 h10" />
          </g>
        )}
        <g className="taxi-body">
          <g className="taxi-signwrap">
            <path className="taxi-sign" d="M106 34 L108 20 Q130 14 152 20 L154 34 Z" />
            <text x="130" y="30" className="taxi-signtxt">
              מונית
            </text>
          </g>
          <path
            className="taxi-paint"
            d="M14 100 Q10 78 34 72 L60 70 Q72 40 108 36 L152 36 Q184 38 198 68 L214 72 Q234 78 230 102 Q228 113 216 115 L24 115 Q12 113 14 100 Z"
          />
          <path className="taxi-fender" d="M38 114 Q40 92 62 92 Q84 92 86 114" />
          <path className="taxi-fender" d="M154 114 Q156 92 178 92 Q200 92 202 114" />
          <path className="taxi-glass" d="M74 68 Q84 46 108 43 L126 43 L126 68 Z" />
          <path className="taxi-glass" d="M134 43 L152 43 Q176 46 186 68 L134 68 Z" />
          <path className="taxi-glint" d="M88 60 l10 -12 M96 62 l6 -8 M146 60 l8 -10" />
          <g className="taxi-wiper">
            <path d="M80 66 L102 50" />
          </g>
          <path className="taxi-check" d="M22 90 h200" />
          <path className="taxi-chrome" d="M30 98 Q120 102 224 98" />
          <path className="m-line" d="M130 70 L130 112 M108 80 h10 M142 80 h10" />
          <g className="taxi-mirror">
            <path className="taxi-paint" d="M70 64 l-10 -8 q-6 0 -6 6 l8 6 Z" />
          </g>
          {/* face: two headlight eyes in 3/4 view */}
          <g className="taxi-eyes">
            <ellipse className="m-eyewhite taxi-eye-back" cx="48" cy="80" rx="7" ry="9" />
            <ellipse className="m-eyewhite" cx="30" cy="82" rx="11" ry="12" />
            <circle
              className="m-pupil taxi-pupil"
              cx={mood === "shock" ? 30 : 27}
              cy="84"
              r={mood === "shock" ? 2 : 4.4}
            />
            <circle className="m-pupil taxi-pupil" cx="46" cy="82" r={mood === "shock" ? 1.4 : 3} />
            {lid && <path className="m-lid taxi-lid" d={lid} />}
            <path
              className="taxi-brow"
              d={
                mood === "tired" || mood === "cough"
                  ? "M18 66 Q30 70 42 68"
                  : mood === "shock"
                    ? "M18 62 Q30 52 42 62"
                    : mood === "zoom"
                      ? "M18 70 L42 64"
                      : "M18 66 Q30 58 42 64"
              }
            />
          </g>
          <TaxiMouth mood={mood} />
          <rect className="taxi-bumper" x="8" y="108" width="42" height="8" rx="4" />
          <rect className="taxi-bumper" x="194" y="108" width="38" height="8" rx="4" />
        </g>
        <Wheel cx={62} />
        <Wheel cx={178} />
        <text x="4" y="40" className="taxi-beeptxt">
          בִּיפּ!
        </text>
      </svg>
    </span>
  );
}

function TaxiMouth({ mood }: { mood: TaxiMood }) {
  if (mood === "zoom" || mood === "honk")
    return (
      <g>
        <path className="m-mouth-fill" d="M14 96 Q30 116 48 96 Z" />
        <path className="taxi-teeth" d="M18 98 h28 M24 98 v4 M30 98 v5 M36 98 v5 M42 98 v4" />
      </g>
    );
  if (mood === "tired" || mood === "cough")
    return (
      <g>
        <path className="m-mouth" d="M18 104 Q30 98 44 104" />
        {mood === "cough" && <ellipse className="m-mouth-fill" cx="30" cy="103" rx="4" ry="4" />}
      </g>
    );
  if (mood === "shock") return <ellipse className="m-mouth-fill" cx="30" cy="102" rx="6" ry="7" />;
  return (
    <g>
      <path className="m-mouth-fill" d="M16 98 Q30 110 46 98 Q30 103 16 98 Z" />
      <path className="taxi-teeth" d="M20 99 h22" />
    </g>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="taxi-wheel" style={{ transformOrigin: `${cx}px 114px` }}>
      <circle className="taxi-tire" cx={cx} cy="114" r="18" />
      <circle className="taxi-hub" cx={cx} cy="114" r="9" />
      <path
        className="taxi-spokes"
        d={`M${cx} 105 v18 M${cx - 8} 110 l16 8 M${cx + 8} 110 l-16 8`}
      />
    </g>
  );
}
