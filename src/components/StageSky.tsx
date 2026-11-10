/**
 * Life in the sky of a painted stage, between the painting and its frame: a sun that
 * crosses the sky with the clock, two flat clouds drifting by day, stars that blink and a
 * shooting star at night, and (on the home stage) a little plane towing a banner with one
 * true fact from the driver's numbers. Hard-edged cel shapes, like the films. Everything is
 * still with reduced motion and on the drive screen; the garage has no sky.
 */
export function StageSky({ banner }: { banner?: string | null }) {
  return (
    <span className="stage-sky" aria-hidden="true">
      <svg className="sky-sun" viewBox="0 0 40 40">
        <g className="sky-sun-rays">
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d="M20 1.5 L22.2 8 L17.8 8 Z" transform={`rotate(${i * 36} 20 20)`} />
          ))}
        </g>
        <circle cx="20" cy="20" r="9.5" />
      </svg>
      <svg className="sky-cloud sky-cloud-a" viewBox="0 0 64 26">
        <path d="M8 22 a8 8 0 0 1 3 -15 a11 11 0 0 1 21 -2 a9 9 0 0 1 16 4 a7.5 7.5 0 0 1 6 13 Z" />
      </svg>
      <svg className="sky-cloud sky-cloud-b" viewBox="0 0 64 26">
        <path d="M8 22 a8 8 0 0 1 3 -15 a11 11 0 0 1 21 -2 a9 9 0 0 1 16 4 a7.5 7.5 0 0 1 6 13 Z" />
      </svg>
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} className={`sky-star sky-star-${i}`} viewBox="0 0 12 12">
          <path d="M6 0 L7.3 4.7 L12 6 L7.3 7.3 L6 12 L4.7 7.3 L0 6 L4.7 4.7 Z" />
        </svg>
      ))}
      <span className="sky-shooting" />
      {banner && (
        <span className="sky-plane">
          <span className="sky-plane-bob">
            <span className="sky-banner">{banner}</span>
            <svg className="sky-rope" viewBox="0 0 14 10">
              <path d="M0 2 L14 5 M0 8 L14 5" />
            </svg>
            <svg className="sky-plane-art" viewBox="0 0 46 26">
              {/* tail, body, wings, wheel, cockpit, propeller: a plain little biplane */}
              <path
                className="pl-body"
                d="M3 9 L1 3 L7 3 L11 10 L30 9 Q41 9 42 14 Q41 19 31 19 L12 18 Q5 16 3 9 Z"
              />
              <path className="pl-wing" d="M14 4 L33 4 Q36 5 33 7 L14 7 Q11 5.5 14 4 Z" />
              <path className="pl-wing" d="M15 15 L33 15 Q36 16.5 33 18 L15 18 Q12 16.5 15 15 Z" />
              <path className="pl-strut" d="M18 7 L18 15 M29 7 L29 15" />
              <path className="pl-strut" d="M24 19 L26 23" />
              <circle className="pl-wheel" cx="26.5" cy="23.5" r="2.2" />
              <path className="pl-glass" d="M30 9.4 Q35 9.6 36.5 12 L30 12 Z" />
              <ellipse className="pl-prop" cx="43.4" cy="14" rx="1.2" ry="8" />
            </svg>
          </span>
        </span>
      )}
    </span>
  );
}
