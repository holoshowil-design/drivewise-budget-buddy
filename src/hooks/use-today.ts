import { useEffect, useRef, useState } from "react";
import { todayISO } from "@/lib/store";

/** Today's date (YYYY-MM-DD) that updates after midnight. */
export function useTodayISO() {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const check = () => setToday(todayISO());
    const id = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return today;
}

/**
 * Moves a form's date to the new day after midnight, but only if the user
 * left it on "today" (a date picked by hand is kept).
 */
export function useRollingDate(date: string, setDate: (d: string) => void) {
  const today = useTodayISO();
  const prev = useRef(today);
  useEffect(() => {
    if (prev.current !== today && date === prev.current) setDate(today);
    prev.current = today;
  }, [today, date, setDate]);
}
