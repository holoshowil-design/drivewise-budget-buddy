import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/unenv.mjs";



import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
const RESULT = "lovable-preview-auth:result";
function readBrokerReply(data, requestId) {
  if (typeof data !== "object" || data === null) return null;
  if (!("type" in data) || data.type !== RESULT) return null;
  if (!("requestId" in data) || data.requestId !== requestId) return null;
  return {
    ok: "ok" in data && Boolean(data.ok),
    value: "value" in data && typeof data.value === "string" ? data.value : null
  };
}
function brokeredPreviewStorage() {
  if (typeof window === "undefined") return void 0;
  const host = location.hostname;
  const PREVIEW_ZONES = ["lovableproject.com", "lovableproject-dev.com", "lovable.app", "gpt-eng.com", "gptengineer.run"];
  const onPreviewZone = PREVIEW_ZONES.some((z) => host === z || host.endsWith("." + z));
  const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
  const projectId = onPreviewZone ? new RegExp("^(?:id-preview(?:-[a-z0-9]+)?|project)--(" + UUID + ")(?:-dev)?(?=\\.|$)", "i").exec(host)?.[1] ?? new RegExp("^(" + UUID + ")(?=[.-])", "i").exec(host)?.[1] : void 0;
  const parentWindow = window.parent;
  const framed = parentWindow !== null && parentWindow !== window;
  if (!projectId || !framed) return localStorage;
  const dev = host.endsWith(".lovableproject-dev.com") || host.endsWith(".gpt-eng.com");
  const EDITOR = dev ? /^https:\/\/([a-z0-9-]+\.)*(lovable\.dev|gptengineer\.app)$|^http:\/\/localhost:3000$/ : /^https:\/\/([a-z0-9-]+\.)*(lovable\.dev|gptengineer\.app)$/;
  const ancestorOrigins = location.ancestorOrigins;
  const ancestor = ancestorOrigins?.[0] ?? (document.referrer ? new URL(document.referrer).origin : "");
  const editorOrigins = ancestor && EDITOR.test(ancestor) ? [ancestor] : dev ? ["https://lovable.dev", "http://localhost:3000"] : ["https://lovable.dev"];
  const TIMEOUT = 2e3;
  const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  const request = (type, key, value) => new Promise((resolve) => {
    const requestId = newId();
    let done = false;
    const finish = (reply) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(reply);
    };
    const onMessage = (e) => {
      if (!editorOrigins.includes(e.origin)) return;
      const reply = readBrokerReply(e.data, requestId);
      if (reply) finish(reply);
    };
    window.addEventListener("message", onMessage);
    const timer = setTimeout(() => {
      finish(null);
    }, TIMEOUT);
    const msg = { type, requestId, projectId, key };
    if (value !== void 0) msg.value = value;
    for (const origin of editorOrigins) window.parent.postMessage(msg, origin);
  });
  let firstGet = true;
  const RETRY_DELAY = 250;
  const readLocal = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return void 0;
    }
  };
  return {
    getItem: async (key) => {
      const local = readLocal(key);
      let res = await request("lovable-preview-auth:get", key, local ?? void 0);
      if (!res && firstGet) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        res = await request("lovable-preview-auth:get", key, local ?? void 0);
      }
      firstGet = false;
      if (res?.ok && res.value !== null) {
        if (res.value === "") {
          if (local !== void 0 && readLocal(key) === local) localStorage.removeItem(key);
          return null;
        }
        if (local === null && readLocal(key) === null) {
          try {
            localStorage.setItem(key, res.value);
          } catch {
          }
        }
        return res.value;
      }
      return localStorage.getItem(key);
    },
    setItem: (key, value) => {
      localStorage.setItem(key, value);
      return request("lovable-preview-auth:set", key, value).then((res) => {
        if (res?.ok && res.value !== null && localStorage.getItem(key) === value) {
          if (res.value === "") localStorage.removeItem(key);
          else localStorage.setItem(key, res.value);
        }
      });
    },
    removeItem: (key) => {
      const local = readLocal(key);
      localStorage.removeItem(key);
      return request("lovable-preview-auth:remove", key, local ?? void 0).then(() => {
      });
    }
  };
}
function isNewSupabaseApiKey(value) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}
function createSupabaseClient() {
  const SUPABASE_URL = "https://zivpcncxlyxxqrqisodm.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LbSYBmK4eKF-XL_jI7SgHQ_rB0Iz-e9";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY)
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase
};
