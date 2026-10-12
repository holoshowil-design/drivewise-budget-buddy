# פרומפטים לסבב חקר הדמויות (שלב ב)

**מטרה:** 6 גרסאות לקפטן ו-6 לטורבו. אַרי בוחר אחת מכל דמות, והיא הופכת לתמונת הייחוס של כל השלבים הבאים.
**מודל:** `nano_banana_pro` ב-Higgsfield, 2 קרדיטים לתמונה, 24 קרדיטים לכל הסבב.
**כלל:** הפרומפטים מתארים את תכונות הסגנון, ולא מזכירים את הסרט, את דיסני או אמנים בשמם. אחרת המודל נוטה להחזיר את הדמויות המקוריות.

כל פרומפט מורכב מ**בסיס הסגנון** ומ**תיאור הגרסה**.

## בסיס הסגנון (משותף לכל 12)

```text
Original cartoon character design, not based on any existing character.
STYLE: early-1960s hand-drawn feature animation printed by xerography.
THIN, nervous graphite pencil line (about 1% of the head height) transferred
straight to cel: scratchy, subtle variable line weight, tapered ends, small
breaks, small interior lines for wrinkles, folds and knuckles, a few
construction lines left in. Flat gouache colour fills, slightly misregistered
from the line (2-4 px), no gradients, no highlights, no soft shading.
Economical British-style caricature with believable anatomy, fleshy shapes
and clear joints. Expressive hands with articulated knuckles.
PALETTE ONLY: warm ink #231F1C, cream paper #F3EAD3, muted green #4E8C5E,
mustard #E8B43A, slate #4A5B70, vermilion accent #D8553A.
FRAMING: single character, full body, centred, plain cream paper background,
no text, no logo, no frame.
AVOID: thick marker outline, uniform bold stroke, clean vector line, brown flat
cap, green flat cap, orange scarf, bald head with spiky tufts, turtleneck
sweater, dalmatians, spotted dogs, stubble, 3D render, glossy vector, anime,
pixar style, photo.
```

## הקפטן (יחס 2:3, מבט 3/4 שמאלה, ידיים על המותניים)

| # | הכיוון | תיאור הגרסה (נוסף לבסיס) |
| --- | --- | --- |
| C1 | הבסיס מהמפרט | `CHARACTER: a tall, lanky Israeli taxi driver, about 4.5 heads tall, narrow sloping shoulders, long arms. Long face with an angular jaw and a big hooked nose, small heavy-lidded eyes under thick eyebrows, a thick broad moustache. Peaked driver's cap in slate with a small mustard steering-wheel badge. Muted green jacket, thin vermilion tie, slate trousers, long pointed black shoes. POSE: three-quarter view facing left, both fists on hips, chin raised, smug quiet confidence.` |
| C2 | גבוה וכפוף | `CHARACTER: an extremely tall, stooped taxi driver with a long neck pushed forward like a heron, peaked slate driver's cap pushed back on the head, big hooked nose, moustache with curled-up ends, tiny eyes, muted green jacket hanging loosely, thin vermilion tie, slate trousers, huge pointed shoes. POSE: three-quarter view facing left, one hand on hip, the other pointing up with a raised index finger, as if announcing a plan.` |
| C3 | פנים אגס | `CHARACTER: a tall thin taxi driver with a pear-shaped head: narrow forehead, heavy drooping jowls, droopy walrus moustache, heavy-lidded sleepy eyes, big fleshy nose. Peaked slate driver's cap slightly too small for his head, mustard badge. Muted green jacket, thin vermilion tie, slate trousers. POSE: three-quarter view facing left, hands on hips, eyes glancing sideways at the viewer.` |
| C4 | ראש טריז | `CHARACTER: a lanky taxi driver with a wedge-shaped head, sharp angular cheekbones, big hooked nose, very bushy eyebrows that hide most of his small eyes, a wide bristly moustache that hides his mouth. Peaked slate driver's cap tilted forward over the brows, mustard steering-wheel badge. Muted green jacket with sharp lapels, thin vermilion tie, slate trousers, long pointed shoes. POSE: three-quarter view facing left, arms crossed, one eyebrow raised.` |
| C5 | ראש קטן על גוף ארוך | `CHARACTER: a taxi driver with a small head on a very long thin body and long thin legs, big hooked nose, thick moustache, smug half-smile, small eyes. Tall peaked slate driver's cap with a mustard badge. Muted green driver's jacket buttoned high, thin vermilion tie, slate trousers. POSE: three-quarter view facing left, one hand on hip, the other holding a folded banknote between two fingers.` |
| C6 | אפוד וז'קט פתוח | `CHARACTER: a tall lanky taxi driver, long angular face, big hooked nose, thick broad moustache, heavy-lidded eyes, deep smile lines. Peaked slate driver's cap with a mustard badge. Open muted green jacket over a cream waistcoat, thin vermilion tie, slate trousers, long pointed shoes. POSE: three-quarter view facing left, thumbs hooked in the waistcoat pockets, leaning back with pride.` |

## טורבו (יחס 3:2, מהצד, החזית פונה שמאלה)

| # | הכיוון | תיאור הגרסה (נוסף לבסיס) |
| --- | --- | --- |
| T1 | בועה עגולה | `CHARACTER: a small round 1950s-style taxi car with a face, body almost fits inside a circle, mustard paint with a black-and-cream checker band along the side, a small cream roof sign, slate-blue windows. The headlights are big round eyes with chrome eyelids, the grille is a wide smiling mouth with chrome teeth, the side mirrors are ears. Generic invented car, no real brand, no badge. POSE: side view facing left, face turned slightly toward the viewer, happy and eager, slight bounce on its suspension.` |
| T2 | ביצה גבוהה | `CHARACTER: a tall egg-shaped little taxi car with a face, big chrome bumper like a jutting chin, mustard paint, checker band, small roof sign, round headlight eyes with chrome eyelids, grille mouth with teeth, mirror ears. Generic invented car, no real brand. POSE: side view facing left, leaning forward eagerly on its front wheels.` |
| T3 | נמוך ורחב | `CHARACTER: a squat, wide, low little taxi car with a bulldog stance and fat tyres, mustard paint, checker band, small roof sign, heavy-lidded round headlight eyes, wide grille mouth, mirror ears. Generic invented car, no real brand. POSE: side view facing left, chest out, determined.` |
| T4 | לחיים בכנפיים | `CHARACTER: a rounded little taxi car whose front fenders bulge like chubby cheeks, mustard paint, checker band, small roof sign, round headlight eyes set in the cheeks, small grille mouth, mirror ears, windshield wipers like eyebrows. Generic invented car, no real brand. POSE: side view facing left, cheeks puffed, about to honk.` |
| T5 | גלגלים גדולים | `CHARACTER: a small round taxi car with oversized cartoon wheels like big feet, mustard paint, checker band, small roof sign, round headlight eyes, grille mouth with teeth, mirror ears. Generic invented car, no real brand. POSE: side view facing left, mid-hop with all four wheels off the ground, joyful.` |
| T6 | מצח שמשה | `CHARACTER: a rounded little taxi car with a tall curved windshield like a big forehead, wipers as expressive eyebrows, mustard paint, checker band, small roof sign, round headlight eyes, grille mouth, mirror ears. Generic invented car, no real brand. POSE: side view facing left, wipers raised in surprise.` |

## תוצאות הסבב (12 באוקטובר 2026)

12 תמונות, 24 קרדיטים, בגודל 1696x2528 (קפטן) ו-2528x1696 (טורבו). המודל בפועל: `nano_banana_2`.
**Claude לא ראה את התמונות:** רשת סביבת הענן חוסמת את `d8j0ntlcm91z4.cloudfront.net`. אַרי בוחר ומדווח.

| # | מזהה ב-Higgsfield | קישור |
| --- | --- | --- |
| C1 | `fdc94334-5162-4d65-bb28-9c7bfd9eca8c` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162620_fdc94334-5162-4d65-bb28-9c7bfd9eca8c_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162620_fdc94334-5162-4d65-bb28-9c7bfd9eca8c.png) |
| C2 | `09bc7afb-d249-40ef-82d7-3a704020bc5f` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162620_09bc7afb-d249-40ef-82d7-3a704020bc5f_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162620_09bc7afb-d249-40ef-82d7-3a704020bc5f.png) |
| C3 | `d208ad44-3104-4d80-a377-74384da5105d` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_d208ad44-3104-4d80-a377-74384da5105d_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_d208ad44-3104-4d80-a377-74384da5105d.png) |
| C4 | `c686844c-0244-4064-b012-83cf1622c99f` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162621_c686844c-0244-4064-b012-83cf1622c99f_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162621_c686844c-0244-4064-b012-83cf1622c99f.png) |
| C5 | `2caaa279-7e53-418d-9b7c-d2caf6821efb` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162700_2caaa279-7e53-418d-9b7c-d2caf6821efb_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162700_2caaa279-7e53-418d-9b7c-d2caf6821efb.png) |
| C6 | `0f9903c8-a401-4c42-8c3c-73121d6868e1` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_0f9903c8-a401-4c42-8c3c-73121d6868e1_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_0f9903c8-a401-4c42-8c3c-73121d6868e1.png) |
| T1 | `a93ede9e-8309-4d11-ba78-e1201813bf9f` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_a93ede9e-8309-4d11-ba78-e1201813bf9f_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_a93ede9e-8309-4d11-ba78-e1201813bf9f.png) |
| T2 | `40ba1580-3560-41af-abff-ebb74030ea07` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_40ba1580-3560-41af-abff-ebb74030ea07_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_40ba1580-3560-41af-abff-ebb74030ea07.png) |
| T3 | `133f5b30-7aa3-4f0f-ae2f-3095add8ba2d` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_133f5b30-7aa3-4f0f-ae2f-3095add8ba2d_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162734_133f5b30-7aa3-4f0f-ae2f-3095add8ba2d.png) |
| T4 | `43c82811-3c90-444f-acfe-92e62f6c20ac` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_43c82811-3c90-444f-acfe-92e62f6c20ac_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_43c82811-3c90-444f-acfe-92e62f6c20ac.png) |
| T5 | `4fd20f3e-9184-4db6-88c2-ce9b3f5f832f` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_4fd20f3e-9184-4db6-88c2-ce9b3f5f832f_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162515_4fd20f3e-9184-4db6-88c2-ce9b3f5f832f.png) |
| T6 | `ec0f4c19-a339-44f5-b851-49acfe3005c5` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162801_ec0f4c19-a339-44f5-b851-49acfe3005c5_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_162801_ec0f4c19-a339-44f5-b851-49acfe3005c5.png) |

## סבב 2 (12 באוקטובר 2026)

**ההחלטה של אַרי:** קפטן 4, "טיפה מצחיק יותר". במקום טורבו המונית: **מכונית רגילה, לא מונית, בלי עיניים ובלי חיוך**, מצחיקה יותר, ובסגנון רטרו של שנות ה-30. לוקחים את סגנון התקופה, לא את המכונית מהסרט (בגלל זכויות).
**גרסאות הקפטן** נוצרו עם קפטן 4 כתמונת ייחוס (`c686844c-0244-4064-b012-83cf1622c99f`). 8 תמונות, 16 קרדיטים.

| גרסה | מזהה ב-Higgsfield | קישור |
| --- | --- | --- |
| קפטן 4א: מוגזם יותר, ידיים שלובות, גבה מורמת | `1ed3611f-7970-4122-8fd9-c25aa68e7be2` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_1ed3611f-7970-4122-8fd9-c25aa68e7be2_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_1ed3611f-7970-4122-8fd9-c25aa68e7be2.png) |
| קפטן 4ב: טופח על האף, "יש לי תוכנית" | `480182a1-fb0e-4c57-9331-6b5866e82dcf` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_480182a1-fb0e-4c57-9331-6b5866e82dcf_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_480182a1-fb0e-4c57-9331-6b5866e82dcf.png) |
| קפטן 4ג: כובע גדול מדי שנופל על הגבות | `ea533f13-86ba-4345-be5e-f57a543005dc` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_ea533f13-86ba-4345-be5e-f57a543005dc_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164506_ea533f13-86ba-4345-be5e-f57a543005dc.png) |
| קפטן 4ד: סופר שטרות, עיניים מצטלבות | `992dcfb4-dbd4-4a7d-8f7f-480f5cba14ac` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164508_992dcfb4-dbd4-4a7d-8f7f-480f5cba14ac_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164508_992dcfb4-dbd4-4a7d-8f7f-480f5cba14ac.png) |
| מכונית 1: מכסה מנוע ארוך עד אבסורד | `19ae34d4-65e6-442c-aa55-58c3a1ac2052` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164639_19ae34d4-65e6-442c-aa55-58c3a1ac2052_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164639_19ae34d4-65e6-442c-aa55-58c3a1ac2052.png) |
| מכונית 2: גבוהה וצרה, על סף נפילה | `3180961f-301b-4412-b683-45ad4bd042b9` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164639_3180961f-301b-4412-b683-45ad4bd042b9_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164639_3180961f-301b-4412-b683-45ad4bd042b9.png) |
| מכונית 3: קטנה ושמנמנה שרוצה להיות לימוזינה | `280355d2-d155-4ed9-b9ae-bcb981d3210c` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164752_280355d2-d155-4ed9-b9ae-bcb981d3210c_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164752_280355d2-d155-4ed9-b9ae-bcb981d3210c.png) |
| מכונית 4: רודסטר עם פלסטר על הכנף | `2c5f170d-1ca1-4253-8a44-3d8d9d96c39d` | [תצוגה מקדימה](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164751_2c5f170d-1ca1-4253-8a44-3d8d9d96c39d_min.webp) · [מקור](https://d8j0ntlcm91z4.cloudfront.net/user_309K9wPIJh1X1hzt8BxeAFSNp5a/hf_20261012_164751_2c5f170d-1ca1-4253-8a44-3d8d9d96c39d.png) |

## אחרי הסבב

1. מציגים לאַרי את 12 התמונות.
2. כל תמונה עוברת את רשימת הבדיקה בסעיף 10 של `visual-art-direction.md`.
3. התמונה שנבחרת נשמרת כתמונת ייחוס, ומשם מייצרים את דף הדמויות (שלב ג).
