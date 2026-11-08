import { toast } from "sonner";

/**
 * In-app updates of the Android app, through the AppUpdate plugin in
 * drivewise-native. Every function is a no-op (null / false) in the browser
 * and in app builds from before the plugin.
 */

type Bridge = {
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

export type UpdateCheck = {
  versionCode: number;
  versionName: string;
  available: boolean;
  latestCode?: number;
  latestName?: string;
};

function bridge(): Bridge | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  return cap?.nativePromise && cap.Plugins?.AppUpdate ? cap : null;
}

/** True in an installed app that can update itself. */
export function canSelfUpdate(): boolean {
  return bridge() !== null;
}

export async function installedVersion(): Promise<string | null> {
  const cap = bridge();
  if (!cap) return null;
  try {
    return ((await cap.nativePromise!("AppUpdate", "info")) as UpdateCheck).versionName;
  } catch {
    return null;
  }
}

/** Asks the server for the latest version; null when it can't be checked. */
export async function checkForUpdate(): Promise<UpdateCheck | null> {
  const cap = bridge();
  if (!cap) return null;
  try {
    return (await cap.nativePromise!("AppUpdate", "check")) as UpdateCheck;
  } catch {
    return null;
  }
}

/**
 * Downloads and installs the latest version, telling the user what happens
 * next. Returns false when there was nothing to install or it failed.
 */
export async function installUpdate(): Promise<boolean> {
  const cap = bridge();
  if (!cap) return false;
  try {
    const r = (await cap.nativePromise!("AppUpdate", "install")) as { status: string };
    if (r.status === "needs-permission") {
      toast.message("אשרו ל״דרייבר״ להתקין אפליקציות וחזרו. ההתקנה תמשיך לבד.");
    } else if (r.status === "up-to-date") {
      toast.success("יש לך את הגרסה האחרונה");
      return false;
    } else {
      toast.message("לחצו ״עדכן״ במסך שנפתח. הנתונים נשמרים.");
    }
    return true;
  } catch {
    toast.error("ההורדה נכשלה. נסו שוב בעוד רגע.");
    return false;
  }
}
