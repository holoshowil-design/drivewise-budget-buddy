import { loadClip, type Clip } from "./clips";
import { filmsWanted } from "./motion";

/** A strip that hasn't arrived after this long stops holding up the ones behind it. */
const STALL_MS = 15_000;

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let line: Promise<unknown> = Promise.resolve();

/**
 * Fetches films one after another, in the order asked, so the first is ready as soon as the
 * link allows instead of every one arriving late together. Resolves true once all of them are
 * ready; false when films aren't wanted (reduced motion, data saver) or one failed or stalled.
 */
export function warmClips(clips: readonly Clip[]): Promise<boolean> {
  if (!filmsWanted()) return Promise.resolve(false);
  const runs = [...new Set(clips)].map((clip) => {
    const run = line.then(() => Promise.race([loadClip(clip), pause(STALL_MS).then(() => false)]));
    line = run;
    return run;
  });
  return Promise.all(runs).then((all) => all.every(Boolean));
}
