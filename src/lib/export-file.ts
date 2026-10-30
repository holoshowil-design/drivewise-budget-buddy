import { isNativeApp } from "@/lib/location";

export type ExportResult = "shared" | "downloaded" | "copied" | "failed";

/**
 * Hands a CSV to the user. The installed app's WebView ignores blob downloads,
 * so there the share sheet is tried and the text is copied as a last resort.
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
