function fmtDurationWords(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s} שנ׳`;
  const totalMin = Math.round(s / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} דק׳`;
  if (m === 0) return `${h} ש׳`;
  return `${h} ש׳ ${String(m).padStart(2, "0")} דק׳`;
}
export {
  fmtDurationWords as f
};
