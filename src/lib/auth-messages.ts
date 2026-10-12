/** Hebrew messages for the common Supabase auth errors (the raw ones are English). */
export function authErrorMessage(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials"))
    return "המייל או הסיסמה לא נכונים. אם נכנסת עד היום עם Google, הגדר סיסמה בהגדרות (בדפדפן) או לחץ 'שכחתי סיסמה'.";
  if (m.includes("email not confirmed")) return "המייל עוד לא אושר. חפש את מייל האישור (גם בספאם).";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "כבר יש חשבון עם המייל הזה. התחבר, או לחץ 'שכחתי סיסמה'.";
  if (m.includes("password should be at least") || m.includes("weak password"))
    return "הסיסמה קצרה מדי. לפחות 6 תווים.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "יותר מדי ניסיונות. חכה כמה דקות ונסה שוב.";
  if (m.includes("same password") || m.includes("different from the old"))
    return "זו כבר הסיסמה הנוכחית. בחר סיסמה אחרת.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "כתובת המייל לא תקינה.";
  if (m.includes("network") || m.includes("fetch")) return "אין חיבור לאינטרנט. נסה שוב.";
  return message || "שגיאה בהתחברות";
}
