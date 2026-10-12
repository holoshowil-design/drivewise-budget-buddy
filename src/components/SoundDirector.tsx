import { useEffect } from "react";
import type { RewardDetail } from "@/lib/rewards";
import {
  loadTakes,
  playCues,
  refreshSoundPref,
  resumeSound,
  soundEnabled,
  suspendSound,
  unlockSound,
} from "@/lib/sound";
import { REWARD_CUES } from "@/lib/sound/cues";
import { SOUND_KEY } from "@/lib/sound/prefs";

/** Wires sound into the app: wakes audio on the first touch, voices every reward, goes quiet in the background. */
export function SoundDirector() {
  useEffect(() => {
    const onGesture = () => unlockSound();
    const onReward = (e: Event) => {
      const kind = (e as CustomEvent<RewardDetail>).detail?.kind;
      if (kind && REWARD_CUES[kind]) playCues(REWARD_CUES[kind]);
    };
    const onVisibility = () => (document.hidden ? suspendSound() : resumeSound());
    const onStorage = (e: StorageEvent) => {
      if (e.key === SOUND_KEY) refreshSoundPref();
    };
    const gesture = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", onGesture, gesture);
    window.addEventListener("touchend", onGesture, gesture);
    window.addEventListener("keydown", onGesture, gesture);
    window.addEventListener("driver-reward", onReward);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    // load the Captain's voice once the page has settled, so it is ready by the first touch
    const prefetch = window.setTimeout(() => soundEnabled() && loadTakes(), 2000);
    return () => {
      window.clearTimeout(prefetch);
      window.removeEventListener("pointerdown", onGesture, gesture);
      window.removeEventListener("touchend", onGesture, gesture);
      window.removeEventListener("keydown", onGesture, gesture);
      window.removeEventListener("driver-reward", onReward);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return null;
}
