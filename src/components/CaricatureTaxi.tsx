/** "טורבו" — retro caricature taxi: headlight eyes, grille mouth, spinning wheels, comic exhaust clouds. */
export function CaricatureTaxi({ mood = "happy", driving = false, className = "" }: { mood?: "happy" | "tired" | "zoom"; driving?: boolean; className?: string }) {
  return (
    <span className={`taxi taxi-${mood} ${driving ? "taxi-driving" : ""} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 140" width="100%" height="100%" overflow="visible">
        <ellipse className="m-shadow" cx="120" cy="132" rx="96" ry="6" />
        <g className="taxi-puffs">
          <circle className="taxi-puff" cx="222" cy="108" r="9" />
          <circle className="taxi-puff taxi-puff-2" cx="232" cy="98" r="7" />
          <circle className="taxi-puff taxi-puff-3" cx="238" cy="112" r="5" />
        </g>
        {driving && <g className="taxi-speed"><path d="M226 60 h18 M230 76 h12 M222 44 h10" /></g>}
        <g className="taxi-body">
          <path className="taxi-paint" d="M16 98 Q14 74 40 70 L66 68 Q78 36 112 34 L150 34 Q178 36 192 66 L210 70 Q226 74 224 100 L222 112 L18 112 Z" />
          <rect className="taxi-sign" x="110" y="18" width="40" height="16" rx="4" />
          <text x="130" y="30" className="taxi-signtxt">TAXI</text>
          <path className="taxi-glass" d="M78 68 Q88 44 112 42 L126 42 L126 68 Z" />
          <path className="taxi-glass" d="M134 42 L150 42 Q172 44 182 68 L134 68 Z" />
          <path className="taxi-check" d="M24 92 h196" />
          <path className="m-line" d="M130 70 L130 110 M60 78 q4 -2 8 0" />
          {/* headlight eyes */}
          <g className="taxi-eyes">
            <ellipse className="m-eyewhite" cx="30" cy="84" rx="10" ry="11" />
            <circle className="m-pupil taxi-pupil" cx="27" cy="86" r="4.2" />
            {mood === "tired" && <path className="m-lid" d="M20 82 Q30 70 40 82 Z" />}
          </g>
          {mood === "zoom" ? <path className="m-mouth-fill" d="M18 100 Q30 114 44 100 Z" /> : <path className="m-mouth" d={mood === "tired" ? "M20 106 Q30 100 42 106" : "M20 102 Q30 110 42 102"} />}
          <rect className="taxi-bumper" x="10" y="108" width="40" height="7" rx="3" />
          <rect className="taxi-bumper" x="196" y="108" width="34" height="7" rx="3" />
        </g>
        <g className="taxi-wheel" style={{ transformOrigin: "62px 114px" }}><circle className="taxi-tire" cx="62" cy="114" r="17" /><circle className="taxi-hub" cx="62" cy="114" r="7" /><path className="m-line" d="M62 100 v28 M48 114 h28" /></g>
        <g className="taxi-wheel" style={{ transformOrigin: "178px 114px" }}><circle className="taxi-tire" cx="178" cy="114" r="17" /><circle className="taxi-hub" cx="178" cy="114" r="7" /><path className="m-line" d="M178 100 v28 M164 114 h28" /></g>
      </svg>
    </span>
  );
}
