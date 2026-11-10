/**
 * Life in the sky of a painted stage: two flat clouds drifting by day, a few stars that
 * blink at night. Hard-edged cel shapes moving "on twos" (stepped), like the films. Still
 * with reduced motion and on the drive screen; the garage has no sky.
 */
export function StageSky() {
  return (
    <span className="stage-sky" aria-hidden="true">
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
    </span>
  );
}
