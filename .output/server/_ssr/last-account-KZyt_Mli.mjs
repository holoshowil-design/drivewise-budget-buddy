const KEY = "driver-last-account";
function saveLastAccount(a) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
  }
}
function loadLastAccount() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}
export {
  loadLastAccount as l,
  saveLastAccount as s
};
