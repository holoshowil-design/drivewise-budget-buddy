import { createServerFn } from "@tanstack/react-start";

type Post = { date: string; title: { rendered: string }; content: { rendered: string } };

/** Fetches the current official max consumer price for 95 octane (self service) in Israel. */
export const getOnlineFuelPrice = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch(
      "https://www.autocom.co.il/wp-json/wp/v2/posts?search=%D7%A2%D7%93%D7%9B%D7%95%D7%9F%20%D7%9E%D7%97%D7%99%D7%A8%D7%99%20%D7%94%D7%93%D7%9C%D7%A7&per_page=5",
      { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } },
    );
    if (!res.ok) return { ok: false as const, error: `HTTP ${res.status}` };
    const posts = (await res.json()) as Post[];
    const relevant = posts
      .filter((p) => p.title.rendered.includes("מחירי הדלק"))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    for (const p of relevant) {
      const text = p.content.rendered.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"');
      const m = text.match(/לא יעלה על\s*([0-9]+(?:\.[0-9]+)?)/);
      if (m?.[1]) {
        const price = parseFloat(m[1]);
        if (price > 2 && price < 20) {
          return {
            ok: true as const,
            price,
            updatedAt: p.date,
            label: p.title.rendered.replace(/&[^;]+;/g, " ").trim(),
          };
        }
      }
    }
    return { ok: false as const, error: "לא נמצא מחיר עדכני" };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "שגיאת רשת" };
  }
});
