export type LastAccount = {
  email: string;
  name?: string;
  avatar?: string;
  provider?: string;
};

const KEY = "driver-last-account";

export function saveLastAccount(a: LastAccount) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage unavailable */
  }
}

export function loadLastAccount(): LastAccount | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastAccount;
    return parsed && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}
