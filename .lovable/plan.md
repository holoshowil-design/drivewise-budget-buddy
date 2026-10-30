# תיקון שגיאת ה-CI (npm ci)

## הבעיה
קובץ הנעילה `package-lock.json` לא עודכן כשהגרסאות ב-`package.json` שונו:
- `html2canvas-pro`: ב-package.json ‏2.5.3, בנעילה 2.6.0
- `@lovable.dev/vite-tanstack-config`: ב-package.json ‏2.26.5, בנעילה 2.25.3

`npm ci` נכשל כשהשניים לא תואמים. בנוסף, html2canvas-pro 2.5.3 דורש Node 24, וה-CI רץ על Node 22 (כרגע רק אזהרה).

## השלבים
1. לסנכרן את `package-lock.json` עם `npm install --package-lock-only --ignore-scripts`, כך שמתעדכנות רק שתי הרשומות האלה. `bun.lock` לא נוגעים.
2. לעדכן ב-`.github/workflows/ci.yml` את `node-version` מ-22 ל-24, כדי שאזהרת המנוע תיעלם.
3. לבדוק עם `npm ci --dry-run` שהנעילה תואמת, ולהריץ את הטסטים.

אחרי האישור צריך לפתוח PR מענף, כמו בכל שינוי, ולמזג אותו.
