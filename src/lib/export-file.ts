import { isNativeApp } from "@/lib/location";

type Bridge = {
  Plugins?: Record<string, unknown>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

export type ExportResult = "shared" | "downloaded" | "copied" | "failed";

/** Hands a CSV to the user; see exportFile. Old app builds copy the text instead. */
export function exportCsv(name: string, csv: string): Promise<ExportResult> {
  return exportFile(new File(["\uFEFF" + csv], name, { type: "text/csv" }), csv);
}

/**
 * Hands a file to the user. The installed app's WebView ignores blob downloads,
 * so there the file is written with the Filesystem plugin and handed to the
 * Share plugin (app builds from drivewise-native with both). Older app builds
 * try the WebView share sheet, then copy `copyFallback` when there is one.
 */
export async function exportFile(file: File, copyFallback?: string): Promise<ExportResult> {
  if (!isNativeApp()) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking right away cancels the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return "downloaded";
  }
  const saved = await shareNativeFile(file);
  if (saved) return saved;
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name });
      return "shared";
    } catch (e) {
      // The user closed the share sheet.
      if ((e as Error).name === "AbortError") return "shared";
    }
  }
  if (copyFallback == null) return "failed";
  return (await copyText(copyFallback)) ? "copied" : "failed";
}

async function shareNativeFile(file: File): Promise<ExportResult | null> {
  const cap = (window as unknown as { Capacitor?: Bridge }).Capacitor;
  if (!cap?.nativePromise || !cap.Plugins?.Filesystem || !cap.Plugins?.Share) return null;
  try {
    // Without an encoding the Filesystem plugin takes base64, which suits any file.
    const { uri } = (await cap.nativePromise("Filesystem", "writeFile", {
      path: file.name,
      data: await toBase64(file),
      directory: "CACHE",
    })) as { uri: string };
    await cap.nativePromise("Share", "share", { title: file.name, files: [uri] });
    return "shared";
  } catch (e) {
    // Closing the share sheet without picking an app is not a failure.
    if (/cancel/i.test(String((e as Error)?.message ?? e))) return "shared";
    return null;
  }
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
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
