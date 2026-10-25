import type { SceneName } from "./films";

/** The scenes a stage plays while nothing else happens. */
const IDLE: SceneName[] = ["wipe", "count", "phone", "snooze", "drive", "brake"];

/**
 * Scenes that need Turbo on the stage: he is the car the Captain polishes, the honk that
 * wakes him, and the one who drives and brakes. Without him the Captain would polish thin air.
 */
const NEEDS_TAXI: SceneName[] = ["wipe", "snooze", "drive", "brake"];

/** The idle scenes that make sense on a stage, with or without Turbo standing on it. */
export const idlePool = (taxi: boolean): SceneName[] =>
  taxi ? IDLE : IDLE.filter((name) => !NEEDS_TAXI.includes(name));
