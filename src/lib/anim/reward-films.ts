import type { RewardKind } from "@/lib/rewards";
import { HEIST, PARADE, SPLASH, type Clip } from "./clips";

/** The drawn film each reward plays. */
export type RewardFilms = Partial<Record<RewardKind, Clip>>;
export type FormKind = "income" | "expense" | "fuel";

/**
 * The film the add form's Captain plays for each reward, by the form he stands on: the
 * money films belong to an income, the fuel nozzle that gushes in his face to a fuel stop.
 * Any other expense (insurance, parking, food...) has no film of its own, so he only grumbles.
 */
export const REWARD_FILMS: Record<FormKind, RewardFilms> = {
  income: { income: HEIST, trip: HEIST, "break-even": HEIST, goal: PARADE, streak: PARADE },
  fuel: { corrective: SPLASH },
  expense: {},
};

/** The strips a form may need, each once, the likeliest first. */
export const filmsToWarm = (films: RewardFilms): Clip[] => [...new Set(Object.values(films))];
