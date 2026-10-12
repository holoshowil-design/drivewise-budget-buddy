/** Shared ink filter for the comic reward burst. Static on purpose: the paper world has no live filters. */
export function InkWorld() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="ink-boil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
      </defs>
    </svg>
  );
}

/** Comic speech bubble with an inked tail. */
export function ComicBubble({ children, side = "start", tone = "default", className = "" }: { children: React.ReactNode; side?: "start" | "end"; tone?: "default" | "warn" | "win"; className?: string }) {
  return <div className={`comic-bubble comic-bubble-${side} comic-bubble-${tone} ${className}`}>{children}</div>;
}
