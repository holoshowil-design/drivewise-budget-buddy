import { isNativeApp } from "@/lib/location";

type Bridge = {
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

export type ExportResult = "shared" | "downloaded" | "copied" | "failed";

/**
 * Hands a CSV to the user. The installed app's WebView ignores blob downloads,
 * so there the file is written with the Filesystem plugin and handed to the
 * Share plugin (app builds from drivewise-native with both). Older app builds
 * try the WebView share sheet and copy the text as a last resort.
 */
export async function exportCsv(name: string, csv: string): Promise<ExportResult> {
  const text = "\uFEFF" + csv;
  const file = new File([text], name, { type: "text/csv" });
  if (!isNativeApp()) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking right away cancels the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return "downloaded";
  }
  const saved = await shareNativeFile(name, text);
  if (saved) return saved;
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return "shared";
    } catch (e) {
      // The user closed the share sheet.
      if ((e as Error).name === "AbortError") return "shared";
    }
  }
  return (await copyText(csv)) ? "copied" : "failed";
}

async function shareNativeFile(name: string, text: string): Promise<ExportResult | null> {
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  if (!cap?.nativePromise || !cap.Plugins?.Filesystem || !cap.Plugins?.Share) return null;
  try {
    const { uri } = (await cap.nativePromise("Filesystem", "writeFile", {
      path: name,
      data: text,
      directory: "CACHE",
      encoding: "utf8",
    })) as { uri: string };
    await cap.nativePromise("Share", "share", { title: name, files: [uri] });
    return "shared";
  } catch (e) {
    // Closing the share sheet without picking an app is not a failure.
    if (/cancel/i.test(String((e as Error)?.message ?? e))) return "shared";
    return null;
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
