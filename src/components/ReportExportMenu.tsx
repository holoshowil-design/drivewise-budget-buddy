import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildReportCsv } from "@/lib/csv";
import { exportCsv, exportFile } from "@/lib/export-file";
import { buildReportHtml, type ReportInput } from "@/lib/report-doc";
import type { AppData } from "@/lib/store";

type Props = {
  data: AppData;
  from: string;
  to: string;
  report: Omit<ReportInput, "title" | "currency" | "vehicle" | "art">;
};

/** Export on the Reports page: a designed PDF report, or the raw CSV for a spreadsheet. */
export function ReportExportMenu({ data, from, to, report }: Props) {
  const [busy, setBusy] = useState(false);
  const name = `driver-report-${from}-to-${to}`;

  const pdf = async () => {
    setBusy(true);
    try {
      const v = data.vehicle;
      const html = buildReportHtml({
        ...report,
        title: "דוח רווחיות",
        currency: data.settings.currency,
        vehicle: [v.make, v.model, v.year].filter(Boolean).join(" ") || undefined,
        art: new URL("/characters/captain-proud.webp", window.location.origin).href,
      });
      const { renderReportPdf } = await import("@/lib/report-pdf");
      const blob = await renderReportPdf(html);
      const result = await exportFile(new File([blob], `${name}.pdf`, { type: "application/pdf" }));
      if (result === "failed") toast("כדי לשמור PDF באפליקציה צריך את הגרסה החדשה שלה.");
    } catch {
      toast("לא הצלחנו להכין את הדוח. נסה שוב.");
    } finally {
      setBusy(false);
    }
  };

  const csv = async () => {
    const result = await exportCsv(
      `${name}.csv`,
      buildReportCsv(data, {
        incomes: report.incomes,
        expenses: report.expenses,
        trips: report.trips,
      }),
    );
    if (result === "copied") toast("הדוח הועתק. אפשר להדביק אותו בגיליון, במייל או בוואטסאפ.");
    else if (result === "failed") toast("לא הצלחנו לייצא את הדוח מכאן. נסה מהדפדפן.");
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={busy}>
          {busy ? (
            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="ml-1 h-4 w-4" />
          )}
          ייצוא
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void pdf()}>
          <FileText className="ml-2 h-4 w-4" />
          דוח PDF מעוצב
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void csv()}>
          <FileSpreadsheet className="ml-2 h-4 w-4" />
          קובץ לגיליון (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
