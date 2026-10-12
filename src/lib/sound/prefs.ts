/** Sound on/off lives on the device only (its own key, not part of the synced app data). */
export const SOUND_KEY = "driver-sound";

export function readSoundPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function writeSoundPref(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // private mode: the switch still works for this visit
  }
}
