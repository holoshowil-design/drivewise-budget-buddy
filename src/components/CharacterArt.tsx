import { useEffect, useState } from "react";
import type { MascotMood, MascotProp } from "@/components/DriverMascot";
import type { TaxiMood } from "@/components/CaricatureTaxi";
import { FrameStrip } from "@/components/anim/FrameStrip";
import { HEIST, PARADE, SPLASH, clipMs, clipReady, loadClip, type Clip } from "@/lib/anim/clips";
import { filmsWanted, motionAllowed } from "@/lib/anim/motion";
import type { RewardDetail, RewardKind } from "@/lib/rewards";

/** Higgsfield-painted poses, one image per mood. Same props as the SVG characters so callers swap freely. */
const CAPTAIN: Record<MascotMood, string> = {
  sleepy: "captain-sleepy",
  grumble: "captain-grumpy",
  smirk: "captain-sly",
  victory: "captain-triumphant",
  excited: "captain-proud",
  shock: "captain-stunned",
  pain: "captain-grumpy",
};

const TAXI: Record<TaxiMood, string> = {
  happy: "taxi-happy",
  tired: "taxi-exhausted",
  zoom: "taxi-speeding",
  honk: "taxi-honking",
  cough: "taxi-coughing",
  shock: "taxi-startled",
};

const src = (name: string) => `/characters/${name}.webp`;

/** The drawn film the add form's Captain plays for each reward, once it has loaded. */
const REWARD_FILM: Partial<Record<RewardKind, Clip>> = { income: HEIST, trip: HEIST, "break-even": HEIST, goal: PARADE, streak: PARADE, corrective: SPLASH };

// Warm the cache so pose swaps inside a scene never flash empty.
if (typeof window !== "undefined") {
  for (const name of [...new Set([...Object.values(CAPTAIN), ...Object.values(TAXI)])]) new Image().src = src(name);
}

export function CaptainArt({ mood, className = "", reactive = true }: { mood: MascotMood; prop?: MascotProp; className?: string; reactive?: boolean }) {
  const [pose, setPose] = useState<MascotMood>(mood);
  const [beat, setBeat] = useState(0);
  const [film, setFilm] = useState<Clip | null>(null);

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
    return () => { window.removeEventListener("driver-reward", onReward); window.clearTimeout(timer); };
  }, [mood, reactive]);
  // a reward plays its drawn film once that has loaded; the film outlasts mood changes
  useEffect(() => {
    if (!reactive) return;
    let timer: number | undefined;
    const onReward = (e: Event) => {
      const kind = (e as CustomEvent<RewardDetail>).detail?.kind;
      const clip = kind && REWARD_FILM[kind];
      if (!clip || !clipReady(clip) || !motionAllowed()) return;
      setFilm(clip);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFilm(null), clipMs(clip) + (clip.jig ? 2200 : 300));
    };
    window.addEventListener("driver-reward", onReward);
    const warm = window.setTimeout(() => { if (filmsWanted()) new Set(Object.values(REWARD_FILM)).forEach((c) => void loadClip(c)); }, 2500);
    return () => { window.removeEventListener("driver-reward", onReward); window.clearTimeout(timer); window.clearTimeout(warm); };
  }, [reactive]);

  return (
    <span className={`mascot art-captain art-pose-${pose} ${film ? "art-filmed" : ""} ${className}`} key={film ? `film-${beat}` : `${pose}-${beat}`} aria-hidden="true">
      {film ? <FrameStrip clip={film} className="art-film" /> : <img src={src(CAPTAIN[pose])} alt="" draggable={false} decoding="async" />}
    </span>
  );
}

/** `film` puts Turbo in a drawn film instead of his still pose (the stage moves him along). */
export function TaxiArt({ mood = "happy", driving = false, film, className = "" }: { mood?: TaxiMood; driving?: boolean; film?: Clip; className?: string }) {
  return (
    <span className={`taxi art-taxi art-taxi-${mood} ${driving ? "taxi-driving" : ""} ${film ? "art-filmed" : ""} ${className}`} key={film ? film.src : mood} aria-hidden="true">
      {film ? <FrameStrip clip={film} className="art-film" /> : <img src={src(TAXI[mood])} alt="" draggable={false} decoding="async" />}
    </span>
  );
}
