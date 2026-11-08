import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-CHpQblhr.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";

import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const CACHE_MS = 3 * 60 * 60 * 1e3;
let cached = null;
const getOnlineFuelPrice_createServerFn_handler = createServerRpc({
  id: "bdd6f2610124b3a49d17d1fd0f9b2ec6781f77d716788ed38414469f9b3cce7a",
  name: "getOnlineFuelPrice",
  filename: "src/lib/fuel-price.functions.ts"
}, (opts) => getOnlineFuelPrice.__executeServer(opts));
const getOnlineFuelPrice = createServerFn({
  method: "GET"
}).handler(getOnlineFuelPrice_createServerFn_handler, async () => {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const result = await fetchPrice();
  if (result.ok) cached = {
    at: Date.now(),
    value: result
  };
  return result;
});
async function fetchPrice() {
  try {
    const res = await fetch("https://www.autocom.co.il/wp-json/wp/v2/posts?search=%D7%A2%D7%93%D7%9B%D7%95%D7%9F%20%D7%9E%D7%97%D7%99%D7%A8%D7%99%20%D7%94%D7%93%D7%9C%D7%A7&per_page=5", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      }
    });
    if (!res.ok) return {
      ok: false,
      error: `HTTP ${res.status}`
    };
    const posts = await res.json();
    const relevant = posts.filter((p) => p.title.rendered.includes("מחירי הדלק")).sort((a, b) => a.date < b.date ? 1 : -1);
    for (const p of relevant) {
      const text = p.content.rendered.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"');
      const m = text.match(/לא יעלה על\s*([0-9]+(?:\.[0-9]+)?)/);
      if (m?.[1]) {
        const price = parseFloat(m[1]);
        if (price > 2 && price < 20) {
          return {
            ok: true,
            price,
            updatedAt: p.date,
            label: p.title.rendered.replace(/&[^;]+;/g, " ").trim()
          };
        }
      }
    }
    return {
      ok: false,
      error: "לא נמצא מחיר עדכני"
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "שגיאת רשת"
    };
  }
}
export {
  getOnlineFuelPrice_createServerFn_handler
};
