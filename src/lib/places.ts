import { haversine } from "@/lib/active-trip";

/**
 * Towns and cities in Israel with a rough center and reach (km), for naming the
 * start and end of a trip on the trips map without asking any online service.
 */
type Place = { name: string; lat: number; lon: number; r: number };

const PLACES: Place[] = [
  { name: "ירושלים", lat: 31.778, lon: 35.215, r: 9 },
  { name: "תל אביב", lat: 32.08, lon: 34.78, r: 5 },
  { name: "חיפה", lat: 32.794, lon: 34.99, r: 7 },
  { name: "בני ברק", lat: 32.084, lon: 34.834, r: 2.5 },
  { name: "רמת גן", lat: 32.068, lon: 34.824, r: 2.5 },
  { name: "גבעתיים", lat: 32.072, lon: 34.81, r: 1.5 },
  { name: "פתח תקווה", lat: 32.087, lon: 34.887, r: 4 },
  { name: "בת ים", lat: 32.017, lon: 34.75, r: 2.5 },
  { name: "חולון", lat: 32.011, lon: 34.78, r: 3 },
  { name: "ראשון לציון", lat: 31.964, lon: 34.804, r: 5 },
  { name: "רחובות", lat: 31.894, lon: 34.811, r: 4 },
  { name: "נס ציונה", lat: 31.929, lon: 34.799, r: 2.5 },
  { name: "לוד", lat: 31.951, lon: 34.895, r: 3 },
  { name: "רמלה", lat: 31.928, lon: 34.87, r: 3 },
  { name: "מודיעין", lat: 31.898, lon: 35.01, r: 5 },
  { name: "מודיעין עילית", lat: 31.932, lon: 35.043, r: 2.5 },
  { name: "בית שמש", lat: 31.745, lon: 34.988, r: 5 },
  { name: "ביתר עילית", lat: 31.697, lon: 35.115, r: 2.5 },
  { name: "מבשרת ציון", lat: 31.802, lon: 35.15, r: 2.5 },
  { name: "מעלה אדומים", lat: 31.777, lon: 35.3, r: 3 },
  { name: "גבעת זאב", lat: 31.862, lon: 35.168, r: 2 },
  { name: "אשדוד", lat: 31.804, lon: 34.655, r: 6 },
  { name: "אשקלון", lat: 31.669, lon: 34.574, r: 6 },
  { name: "יבנה", lat: 31.877, lon: 34.739, r: 3 },
  { name: "גן יבנה", lat: 31.787, lon: 34.706, r: 2 },
  { name: "קריית גת", lat: 31.61, lon: 34.77, r: 4 },
  { name: "קריית מלאכי", lat: 31.732, lon: 34.745, r: 2.5 },
  { name: "שדרות", lat: 31.525, lon: 34.597, r: 3 },
  { name: "נתיבות", lat: 31.421, lon: 34.588, r: 3 },
  { name: "אופקים", lat: 31.314, lon: 34.62, r: 3 },
  { name: "באר שבע", lat: 31.252, lon: 34.791, r: 8 },
  { name: "דימונה", lat: 31.069, lon: 35.033, r: 4 },
  { name: "ערד", lat: 31.259, lon: 35.213, r: 4 },
  { name: "אילת", lat: 29.558, lon: 34.952, r: 6 },
  { name: "הרצליה", lat: 32.166, lon: 34.843, r: 4 },
  { name: "רמת השרון", lat: 32.146, lon: 34.839, r: 2.5 },
  { name: "רעננה", lat: 32.184, lon: 34.871, r: 3 },
  { name: "כפר סבא", lat: 32.178, lon: 34.907, r: 3.5 },
  { name: "הוד השרון", lat: 32.155, lon: 34.892, r: 3 },
  { name: "ראש העין", lat: 32.096, lon: 34.957, r: 3.5 },
  { name: "אלעד", lat: 32.052, lon: 34.951, r: 2 },
  { name: "אור יהודה", lat: 32.03, lon: 34.853, r: 2 },
  { name: "יהוד", lat: 32.033, lon: 34.89, r: 2 },
  { name: "קריית אונו", lat: 32.063, lon: 34.855, r: 2 },
  { name: "שוהם", lat: 31.999, lon: 34.946, r: 2.5 },
  { name: "נתניה", lat: 32.321, lon: 34.853, r: 6 },
  { name: "חדרה", lat: 32.434, lon: 34.919, r: 5 },
  { name: "כפר יונה", lat: 32.316, lon: 34.936, r: 2.5 },
  { name: "טייבה", lat: 32.266, lon: 35.01, r: 3 },
  { name: "אום אל-פחם", lat: 32.52, lon: 35.153, r: 3.5 },
  { name: "זכרון יעקב", lat: 32.571, lon: 34.954, r: 3 },
  { name: "קריית אתא", lat: 32.81, lon: 35.106, r: 3 },
  { name: "קריית ביאליק", lat: 32.837, lon: 35.088, r: 2.5 },
  { name: "קריית מוצקין", lat: 32.837, lon: 35.077, r: 2 },
  { name: "קריית ים", lat: 32.849, lon: 35.069, r: 2 },
  { name: "טירת כרמל", lat: 32.761, lon: 34.971, r: 2.5 },
  { name: "נשר", lat: 32.767, lon: 35.043, r: 2.5 },
  { name: "יוקנעם", lat: 32.659, lon: 35.105, r: 3 },
  { name: "עכו", lat: 32.928, lon: 35.084, r: 4 },
  { name: "נהריה", lat: 33.006, lon: 35.098, r: 4 },
  { name: "כרמיאל", lat: 32.915, lon: 35.296, r: 4 },
  { name: "צפת", lat: 32.965, lon: 35.496, r: 4 },
  { name: "טבריה", lat: 32.795, lon: 35.531, r: 4 },
  { name: "נצרת", lat: 32.702, lon: 35.297, r: 4 },
  { name: "נוף הגליל", lat: 32.717, lon: 35.326, r: 3 },
  { name: "עפולה", lat: 32.608, lon: 35.289, r: 4 },
  { name: "בית שאן", lat: 32.497, lon: 35.497, r: 3 },
  { name: "קריית שמונה", lat: 33.207, lon: 35.571, r: 3.5 },
  { name: "אריאל", lat: 32.104, lon: 35.174, r: 3 },
  { name: "עמנואל", lat: 32.161, lon: 35.135, r: 2 },
  { name: "קריית ארבע", lat: 31.534, lon: 35.122, r: 2.5 },
  { name: "אפרת", lat: 31.656, lon: 35.153, r: 2.5 },
  { name: "נתב״ג", lat: 32.005, lon: 34.886, r: 3 },
];

/** The place a point is in (the closest center within its reach), or null out of all towns. */
export function nearestPlace(
  lat: number,
  lon: number,
): { name: string; lat: number; lon: number } | null {
  let best: Place | null = null;
  let bestScore = Infinity;
  for (const p of PLACES) {
    const d = haversine({ lat, lon }, p);
    if (d > p.r) continue;
    // Closest relative to the town's size, so a small town inside a big one's reach still wins.
    const score = d / p.r;
    if (score < bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best ? { name: best.name, lat: best.lat, lon: best.lon } : null;
}
