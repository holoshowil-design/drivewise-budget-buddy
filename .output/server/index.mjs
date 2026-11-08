globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { c as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/apple-touch-icon.png": {
    "type": "image/png",
    "etag": '"66a9-vaBZIX8Tv8NBYxcSjtsYYz79hqc"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 26281,
    "path": "../public/apple-touch-icon.png"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"1b1e-Gy68dubVqjY4g9W6ere+8oH4GuU"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 6942,
    "path": "../public/favicon.ico"
  },
  "/favicon.png": {
    "type": "image/png",
    "etag": '"168e-mFSy5Q22jr8Wgu2znKry4Vj/3hM"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 5774,
    "path": "../public/favicon.png"
  },
  "/icon-192.png": {
    "type": "image/png",
    "etag": '"81be-ziFE8iaB/2tWnaYNREy+SyDE1EA"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 33214,
    "path": "../public/icon-192.png"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"2af-9NH2gTAbK2vRbgTJseE2ZktZlHk"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 687,
    "path": "../public/manifest.webmanifest"
  },
  "/icon-512.png": {
    "type": "image/png",
    "etag": '"231f1-krvEP2rGTeWh5WDEwlJsGQ6UIOk"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 143857,
    "path": "../public/icon-512.png"
  },
  "/assets/Combination-CBP2v-zm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f82-2vutbmmMPwhXsCbnlKdInb6OnsE"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 24450,
    "path": "../public/assets/Combination-CBP2v-zm.js"
  },
  "/assets/CommonAmounts-C4yBDJrN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8df-7IYc9qFAwoXeaqsfz6bAOQngANI"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 2271,
    "path": "../public/assets/CommonAmounts-C4yBDJrN.js"
  },
  "/assets/DashboardCharts-CkMOS46T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12840-+jQ6HpIx4iBuX/CwBIDBqtKBZbY"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 75840,
    "path": "../public/assets/DashboardCharts-CkMOS46T.js"
  },
  "/assets/ExpensePie-CBMBA7IU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3007-HEWXteem3HHDGKveMehRiDFXIzw"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 12295,
    "path": "../public/assets/ExpensePie-CBMBA7IU.js"
  },
  "/assets/MovieStage-CM178td2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c9c-z8obZZFSr6wt5uR4LbWUR4sNe/c"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 15516,
    "path": "../public/assets/MovieStage-CM178td2.js"
  },
  "/assets/PageHeader-BLbSI4B1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e9-A795O17ROd87eCFgbFtaHrk1gaM"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 1001,
    "path": "../public/assets/PageHeader-BLbSI4B1.js"
  },
  "/assets/RecordsList-w64OSZDU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3282-7B8kV44z3fzecsgIDV4/6hBJ5tg"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 12930,
    "path": "../public/assets/RecordsList-w64OSZDU.js"
  },
  "/assets/TripMap-CGoz3Q9q.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"3af4-DwNuVYap9sNCFe2ywhL3F4eGYuU"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 15092,
    "path": "../public/assets/TripMap-CGoz3Q9q.css"
  },
  "/assets/add-C618lG2-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"363f-/OgOx/lnlCRFtNTsgd3VNnVbs3U"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 13887,
    "path": "../public/assets/add-C618lG2-.js"
  },
  "/assets/TripMap-Ct86nJ4Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2508d-D4rEj87/fTsgxziPppaPStrlK6I"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 151693,
    "path": "../public/assets/TripMap-Ct86nJ4Y.js"
  },
  "/assets/app-login-D4beOGAF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ba3-L2Tb3yA83ZrKhyDYIZQyeJPBXAw"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 2979,
    "path": "../public/assets/app-login-D4beOGAF.js"
  },
  "/assets/auth-D2CBhOd_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18d5-o47ySYKV0tEXE8feXDVOCSf/NT0"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 6357,
    "path": "../public/assets/auth-D2CBhOd_.js"
  },
  "/assets/auth-messages-mB-RKEAq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d8-jIYLIKu61aA2hydkcV0sOBAuIss"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 1240,
    "path": "../public/assets/auth-messages-mB-RKEAq.js"
  },
  "/assets/calendar-Bn8l044c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1701-26OBJLo5HCbN4bz1hn2FMEnoirs"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 5889,
    "path": "../public/assets/calendar-Bn8l044c.js"
  },
  "/assets/chevron-down-DM8sEu15.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81-Z69RB7aUs6Tls3MDKhdLVqop7hI"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 129,
    "path": "../public/assets/chevron-down-DM8sEu15.js"
  },
  "/assets/chart-ink-DnNVwdQr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5bde1-PRJem1nMeK6bO7QOCLpfsNx2000"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 376289,
    "path": "../public/assets/chart-ink-DnNVwdQr.js"
  },
  "/assets/chevron-right-I6XGp4Sa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"83-1fpE84zPuTaxSpCmKAozulaPNXQ"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 131,
    "path": "../public/assets/chevron-right-I6XGp4Sa.js"
  },
  "/assets/chevron-left-ClQ0-Hr9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"83-LwL6cvuS7TeZFEa8xrD0lXYOX5Q"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 131,
    "path": "../public/assets/chevron-left-ClQ0-Hr9.js"
  },
  "/assets/client-Ddmi5b4G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"353a3-a5ddJ7imBtLvMphMsKiyjJYUVAM"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 218019,
    "path": "../public/assets/client-Ddmi5b4G.js"
  },
  "/assets/cloud-check-ZlsyY28l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc-JB0Ri7FBmnyDzEy9lGRakbRhZgU"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 220,
    "path": "../public/assets/cloud-check-ZlsyY28l.js"
  },
  "/assets/duration-oc-dY0Pt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ec-VJWyaY9TqPRdpPtNQnmZbG6Oz9g"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 236,
    "path": "../public/assets/duration-oc-dY0Pt.js"
  },
  "/assets/day-groups-BPfz8Fdt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a5e-Uv8gYCAyWQnxX5labiOzKEk7M0M"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 6750,
    "path": "../public/assets/day-groups-BPfz8Fdt.js"
  },
  "/assets/fuel-XwAC2Zkr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"141-b8oBQT1IdmyWEjlRWLgcaWuGUvc"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 321,
    "path": "../public/assets/fuel-XwAC2Zkr.js"
  },
  "/assets/index--I3Of8xT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25c-h0pEdhU1yADJYeF1z3dUhvrz6P4"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 604,
    "path": "../public/assets/index--I3Of8xT.js"
  },
  "/assets/index-ClsINzQg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8eff-VS+VuKO3N+D0gYMiYma2vMeTt6c"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 36607,
    "path": "../public/assets/index-ClsINzQg.js"
  },
  "/assets/html2canvas-pro.esm-BJrfSNIs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"33ed1-1xHX3XhoIYzNZsL7Ok2nnDr/kF4"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 212689,
    "path": "../public/assets/html2canvas-pro.esm-BJrfSNIs.js"
  },
  "/assets/index-CmSqX6Zt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1de3-ubCcoIwWpiJ78bv1RBixg15hmAA"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 7651,
    "path": "../public/assets/index-CmSqX6Zt.js"
  },
  "/assets/index-Dqtbi4d9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e80-bk1/0WRT28V/z2pGcJdw4dhFVeg"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 7808,
    "path": "../public/assets/index-Dqtbi4d9.js"
  },
  "/assets/index-Dqu_X5tD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"da9-LBJMFgE4Ffn/wBDu3ulBjYN1clQ"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 3497,
    "path": "../public/assets/index-Dqu_X5tD.js"
  },
  "/assets/index-RDvx3gti.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a13-DKeB96RZXfuRuNOKYpP7sczfo0I"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 2579,
    "path": "../public/assets/index-RDvx3gti.js"
  },
  "/assets/index.es-DymWm6Hi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"26ce6-F8+W6SuWE9HXz+yGuXNW7XEeDw4"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 158950,
    "path": "../public/assets/index.es-DymWm6Hi.js"
  },
  "/assets/index-BGd52rNK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6fb13-mirvPlyzA0Jpcy1G3/vlKtC+Rtw"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 457491,
    "path": "../public/assets/index-BGd52rNK.js"
  },
  "/assets/label-DxoWV5W-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"45f-+mxUW3Sp2jc/WMZv3y+YlBgFsqI"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 1119,
    "path": "../public/assets/label-DxoWV5W-.js"
  },
  "/assets/last-account-syLprpAf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10f-G0vZddEABCbwaFF8t45TSd9rjNo"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 271,
    "path": "../public/assets/last-account-syLprpAf.js"
  },
  "/assets/map-BJowS8y0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"151d-MtaADBo63XS8Ha42LvSeUyNakdI"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 5405,
    "path": "../public/assets/map-BJowS8y0.js"
  },
  "/assets/map-CSFicleR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1aa-EnRiCrIN5HVp7sCCSFeGKPxxwm8"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 426,
    "path": "../public/assets/map-CSFicleR.js"
  },
  "/assets/map-pin-Y4fwnXUk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ff-J7w8aov6nqwjUPYObMaeV+dvZcY"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 255,
    "path": "../public/assets/map-pin-Y4fwnXUk.js"
  },
  "/assets/motivation-LfZAHyps.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5e-N6ZQYjp0x16wxkIme0m3w16kvjs"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 3166,
    "path": "../public/assets/motivation-LfZAHyps.js"
  },
  "/assets/purify.es-18JuyMri.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75a6-GrQHcUq+6K0ULCdIo8VlAPOWApw"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 30118,
    "path": "../public/assets/purify.es-18JuyMri.js"
  },
  "/assets/report-pdf-fVBofAuG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a55-ReCbsGVuUs6zlEQcsBOO7YD4n00"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 2645,
    "path": "../public/assets/report-pdf-fVBofAuG.js"
  },
  "/assets/jspdf.es.min-Cu07zQOP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e484-t1XF0eICQnrPI9QZZN8U0XbYMyU"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 386180,
    "path": "../public/assets/jspdf.es.min-Cu07zQOP.js"
  },
  "/assets/html2canvas.esm-DXEQVQnt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"31151-TyUyRNm9rR2JDwpyAxcruTmmr6A"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 201041,
    "path": "../public/assets/html2canvas.esm-DXEQVQnt.js"
  },
  "/assets/reports-CexU5Utg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aacb-Qw3MFKTRZUHGdHirYfFzKEyFNCc"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 43723,
    "path": "../public/assets/reports-CexU5Utg.js"
  },
  "/assets/select-Dn1jY96N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c0c7-WKu+NKwOy05RhoXg5nHvqKVdxjs"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 49351,
    "path": "../public/assets/select-Dn1jY96N.js"
  },
  "/assets/settings-ClKaWZr9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"163c6-2vZuKExsnGS/7HjulOr+75V9B5I"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 91078,
    "path": "../public/assets/settings-ClKaWZr9.js"
  },
  "/assets/styles-BarNWoRk.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"22fe0-jZwoVHX6CIK4tyfsbyUxX71Y6AU"',
    "mtime": "2026-11-08T16:01:46.823Z",
    "size": 143328,
    "path": "../public/assets/styles-BarNWoRk.css"
  },
  "/assets/sync-client-BNbkjwvY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a43-LZK72sQnlVz5rEFV7agTygyXwkI"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 2627,
    "path": "../public/assets/sync-client-BNbkjwvY.js"
  },
  "/assets/tabs-CyqZW9Ed.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d92-0QR5bVA3xBXTwLF7RQHHFoFfhU0"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 7570,
    "path": "../public/assets/tabs-CyqZW9Ed.js"
  },
  "/assets/trending-up-PPZcPn0O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-GxLnR13mDg2AmBoEwbEhW3hUexI"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 176,
    "path": "../public/assets/trending-up-PPZcPn0O.js"
  },
  "/assets/triangle-alert-CxsSSYx5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10a-r0ujHVfxieOpsmr0jQThULb7dRE"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 266,
    "path": "../public/assets/triangle-alert-CxsSSYx5.js"
  },
  "/characters/captain-grumpy.webp": {
    "type": "image/webp",
    "etag": '"439c-vcLqJVp0ch9nxGc/VFbeuylWzD8"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 17308,
    "path": "../public/characters/captain-grumpy.webp"
  },
  "/assets/tslib.es6-CmEaCU22.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"43a-E3Kfr2k4mlZ2+rfA/RFmdMbjgcQ"',
    "mtime": "2026-11-08T16:01:46.831Z",
    "size": 1082,
    "path": "../public/assets/tslib.es6-CmEaCU22.js"
  },
  "/characters/captain-proud.webp": {
    "type": "image/webp",
    "etag": '"4946-J1Hk//dRNR8/9SzVgVodCHAujzQ"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 18758,
    "path": "../public/characters/captain-proud.webp"
  },
  "/assets/trip-Dy7oJtA7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8668-EO60ESK2hLDFCfIJXRU1sP5hpIU"',
    "mtime": "2026-11-08T16:01:46.829Z",
    "size": 34408,
    "path": "../public/assets/trip-Dy7oJtA7.js"
  },
  "/characters/captain-sleepy.webp": {
    "type": "image/webp",
    "etag": '"49de-6XgKW/cNeb7RtI6Nn+CUrOBzIWw"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 18910,
    "path": "../public/characters/captain-sleepy.webp"
  },
  "/characters/captain-sly.webp": {
    "type": "image/webp",
    "etag": '"3cac-DAu5CzRba2PdbPJbCT9gD/9AsTI"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 15532,
    "path": "../public/characters/captain-sly.webp"
  },
  "/characters/captain-stunned.webp": {
    "type": "image/webp",
    "etag": '"43e8-+RkwhHaUzLjLCi8EgRl44Jup6H8"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 17384,
    "path": "../public/characters/captain-stunned.webp"
  },
  "/characters/captain-triumphant.webp": {
    "type": "image/webp",
    "etag": '"5d1a-RXJnLMxJD1yausDC3DAWWtwhTAA"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 23834,
    "path": "../public/characters/captain-triumphant.webp"
  },
  "/characters/taxi-coughing.webp": {
    "type": "image/webp",
    "etag": '"9052-RUnf7CbqN07qrhVx0KZsW6d/bBM"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 36946,
    "path": "../public/characters/taxi-coughing.webp"
  },
  "/characters/taxi-happy.webp": {
    "type": "image/webp",
    "etag": '"898e-24qDBBmaktlMNhoVwYP3ClF5OEY"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 35214,
    "path": "../public/characters/taxi-happy.webp"
  },
  "/characters/taxi-exhausted.webp": {
    "type": "image/webp",
    "etag": '"8f74-ApKfiyrd1ifLW00QwEsAThhqNB0"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 36724,
    "path": "../public/characters/taxi-exhausted.webp"
  },
  "/characters/taxi-honking.webp": {
    "type": "image/webp",
    "etag": '"bad8-Rf4ueEMSS+GMlapyFoenLIq1PRQ"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 47832,
    "path": "../public/characters/taxi-honking.webp"
  },
  "/characters/taxi-speeding.webp": {
    "type": "image/webp",
    "etag": '"a8c0-4C7vCNuvI6S6zF4Aplj+CjOO2PY"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 43200,
    "path": "../public/characters/taxi-speeding.webp"
  },
  "/characters/taxi-startled.webp": {
    "type": "image/webp",
    "etag": '"b00a-j2HEX4RHcQbnA9yqrJ+8td6HdDE"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 45066,
    "path": "../public/characters/taxi-startled.webp"
  },
  "/backdrops/promenade.webp": {
    "type": "image/webp",
    "etag": '"c1de-WJLAiQ/XvXGI+v280nnPWWYzygg"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 49630,
    "path": "../public/backdrops/promenade.webp"
  },
  "/backdrops/road.webp": {
    "type": "image/webp",
    "etag": '"a5b2-TchVdIRdIoosKhspe5De8FZzxBY"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 42418,
    "path": "../public/backdrops/road.webp"
  },
  "/backdrops/garage.webp": {
    "type": "image/webp",
    "etag": '"d0a0-8UoQEfZROLuyAURfUf0jTrDxWpE"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 53408,
    "path": "../public/backdrops/garage.webp"
  },
  "/textures/paper.webp": {
    "type": "image/webp",
    "etag": '"2350-L6Zn08Wrz7XI6qP9KzJaZLfUOHc"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 9040,
    "path": "../public/textures/paper.webp"
  },
  "/backdrops/street.webp": {
    "type": "image/webp",
    "etag": '"14242-jJ0Sek6CYZx+QmEefidSMIEM8eI"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 82498,
    "path": "../public/backdrops/street.webp"
  },
  "/anim/captain/count.webp": {
    "type": "image/webp",
    "etag": '"7e3f0-7e4fgrdLg4cYHSKHNf2ruVpnQQk"',
    "mtime": "2026-11-08T16:01:48.492Z",
    "size": 517104,
    "path": "../public/anim/captain/count.webp"
  },
  "/anim/captain/heist.webp": {
    "type": "image/webp",
    "etag": '"5a0ba-C7Xen2MVDn41g3oRyVcwVQ7IRD8"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 368826,
    "path": "../public/anim/captain/heist.webp"
  },
  "/anim/captain/morning.webp": {
    "type": "image/webp",
    "etag": '"75488-7GNVchHEAU4IAecQvr4B5NvtiLY"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 480392,
    "path": "../public/anim/captain/morning.webp"
  },
  "/anim/captain/phone.webp": {
    "type": "image/webp",
    "etag": '"635f4-msKATBMjIElK2ouN43mEGF27IVo"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 407028,
    "path": "../public/anim/captain/phone.webp"
  },
  "/anim/captain/snooze.webp": {
    "type": "image/webp",
    "etag": '"3bfd0-o2XiC0NUCS5hxWFmUCWUDCcHbbg"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 245712,
    "path": "../public/anim/captain/snooze.webp"
  },
  "/anim/taxi/drive.webp": {
    "type": "image/webp",
    "etag": '"2e49a-e5609UAkcIm8jtQ/i7qeSMRt0KY"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 189594,
    "path": "../public/anim/taxi/drive.webp"
  },
  "/sounds/captain/excited-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"4a75-IwcVm83yfjRyV7VqbxyFM0SKHmM"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 19061,
    "path": "../public/sounds/captain/excited-1.mp3"
  },
  "/sounds/captain/excited-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"3055-djXaMlX5NPgFUmh0Ea8sevG2vhA"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 12373,
    "path": "../public/sounds/captain/excited-2.mp3"
  },
  "/sounds/captain/grumble-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"3c94-TJtXontGhuDhqbtvDS0pzA3pp7k"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 15508,
    "path": "../public/sounds/captain/grumble-1.mp3"
  },
  "/sounds/captain/grumble-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"353b-Y++NGuq0CupZu1Z2Ccv10Vc7Gm8"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 13627,
    "path": "../public/sounds/captain/grumble-2.mp3"
  },
  "/sounds/captain/one.mp3": {
    "type": "audio/mpeg",
    "etag": '"29cd-1/b68GrfjRKXvmtppn/fwompa9s"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 10701,
    "path": "../public/sounds/captain/one.mp3"
  },
  "/anim/taxi/brake.webp": {
    "type": "image/webp",
    "etag": '"7ea46-1AaDrgjMrRtwjxg6mgcLXBMpepI"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 518726,
    "path": "../public/anim/taxi/brake.webp"
  },
  "/sounds/captain/pain-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"431c-Aw/wpA2oeHQ2k/qID1J+EdvPqkk"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 17180,
    "path": "../public/sounds/captain/pain-1.mp3"
  },
  "/sounds/captain/pain-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"43ed-X6/0l99mdm+j75cwLdj+tNjI0BA"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 17389,
    "path": "../public/sounds/captain/pain-2.mp3"
  },
  "/sounds/captain/shock-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"21a4-7Hnt2hztc/mQDPq1vN7GMmGnzAw"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 8612,
    "path": "../public/sounds/captain/shock-1.mp3"
  },
  "/sounds/captain/shock-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"20d3-VR0qZRrkfYPlGbrRxpNXkWoFSv4"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 8403,
    "path": "../public/sounds/captain/shock-2.mp3"
  },
  "/sounds/captain/sleepy-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"55e2-1kUi6Fj+kOXfWKaNKbNTMgg2cSY"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 21986,
    "path": "../public/sounds/captain/sleepy-1.mp3"
  },
  "/sounds/captain/sleepy-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"40a9-8zMuWDPxpq4Lb8X22wXOSUAqxAc"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 16553,
    "path": "../public/sounds/captain/sleepy-2.mp3"
  },
  "/sounds/captain/smirk-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"44be-tV6LN3KM2B5DBYzr+7wa9DZ1iTw"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 17598,
    "path": "../public/sounds/captain/smirk-2.mp3"
  },
  "/sounds/captain/smirk-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"3c94-ITBs1yZkqyn+mOaJJAutBsqb3Iw"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 15508,
    "path": "../public/sounds/captain/smirk-1.mp3"
  },
  "/sounds/captain/three.mp3": {
    "type": "audio/mpeg",
    "etag": '"268a-4LSdNMlNZcYUqJrKy16S19yDAkc"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 9866,
    "path": "../public/sounds/captain/three.mp3"
  },
  "/sounds/captain/snore.mp3": {
    "type": "audio/mpeg",
    "etag": '"75b9-9sFOZebO3qEEhcgYoF9zXIqTq0A"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 30137,
    "path": "../public/sounds/captain/snore.mp3"
  },
  "/anim/captain/parade.webp": {
    "type": "image/webp",
    "etag": '"80be6-2JVIJfeWseX/W5oojEkyT98krFM"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 527334,
    "path": "../public/anim/captain/parade.webp"
  },
  "/anim/captain/splash.webp": {
    "type": "image/webp",
    "etag": '"88ac8-PXpaJcvfCvTwWHFORPrSjPTXX+o"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 559816,
    "path": "../public/anim/captain/splash.webp"
  },
  "/anim/captain/wipe.webp": {
    "type": "image/webp",
    "etag": '"87aae-i/TdpeoiRiMd9Ru4PDSLd1ogWW4"',
    "mtime": "2026-11-08T16:01:48.493Z",
    "size": 555694,
    "path": "../public/anim/captain/wipe.webp"
  },
  "/sounds/captain/tune.mp3": {
    "type": "audio/mpeg",
    "etag": '"924b-CNBFpbUiBaTcK6ZrGrQRUuYmsWk"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 37451,
    "path": "../public/sounds/captain/tune.mp3"
  },
  "/sounds/captain/two.mp3": {
    "type": "audio/mpeg",
    "etag": '"268a-y5sB48w48ZaP9GpxgckNk6E0KFU"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 9866,
    "path": "../public/sounds/captain/two.mp3"
  },
  "/sounds/captain/victory-1.mp3": {
    "type": "audio/mpeg",
    "etag": '"6a4b-xUDOCPK7cmDNKpRL2ELbQWtpLTI"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 27211,
    "path": "../public/sounds/captain/victory-1.mp3"
  },
  "/sounds/captain/victory-2.mp3": {
    "type": "audio/mpeg",
    "etag": '"3a21-xTwoHOll1NuDRN02e12lMHH1Kc0"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 14881,
    "path": "../public/sounds/captain/victory-2.mp3"
  },
  "/sounds/captain/yes.mp3": {
    "type": "audio/mpeg",
    "etag": '"2d11-/XCvNuVPcILryAakanaB6fnAczk"',
    "mtime": "2026-11-08T16:01:48.494Z",
    "size": 11537,
    "path": "../public/sounds/captain/yes.mp3"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_moadco = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_moadco };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
