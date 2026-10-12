/** The first idle scene on a page comes soon, then one every so often (ms, from..to). */
export const IDLE_FIRST_MS = [6000, 10000] as const;
export const IDLE_GAP_MS = [14000, 22000] as const;

/** How long to wait for the next idle scene; `random` is 0..1. */
export function idleDelay(first: boolean, random: () => number = Math.random) {
  const [from, to] = first ? IDLE_FIRST_MS : IDLE_GAP_MS;
  return Math.round(from + random() * (to - from));
}

/** Every scene once, in a fresh order, and never the one that just played first. */
export function shuffledRound<T>(pool: readonly T[], last?: T, random: () => number = Math.random) {
  const round = [...pool];
  for (let i = round.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [round[i], round[j]] = [round[j], round[i]];
  }
  if (round.length > 1 && round[0] === last) {
    [round[0], round[round.length - 1]] = [round[round.length - 1], round[0]];
  }
  return round;
}
