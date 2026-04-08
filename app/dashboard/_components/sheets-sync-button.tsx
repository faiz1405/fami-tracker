"use client";

import { Sheet, UploadCloud } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { syncTransactionsToGoogleSheets } from "@/app/actions/sheets-sync";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS: { value: string; label: string }[] = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function yearOptions(baseYear: number): string[] {
  return [baseYear - 1, baseYear, baseYear + 1].map(String);
}

export function SheetsSyncButton() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [state, formAction, pending] = useActionState(
    syncTransactionsToGoogleSheets,
    null,
  );

  const years = useMemo(() => yearOptions(now.getFullYear()), [now]);

  const status =
    state?.success === true
      ? {
          tone: "success" as const,
          text: `Berhasil: ${state.appendedRows} baris → ${state.tabName}`,
        }
      : state?.success === false
        ? { tone: "error" as const, text: state.error }
        : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25">
            <Sheet className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">
              Sync Google Sheets
            </p>
            <p className="text-xs text-muted-foreground">
              Ekspor transaksi ke tab bulanan.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={month}
            onValueChange={(v) => {
              if (v) setMonth(v);
            }}
          >
            <SelectTrigger className="w-full min-h-11 sm:w-42">
              <SelectValue className="" placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent className="" align="start">
              {MONTHS.map((m) => (
                <SelectItem className="" key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year}
            onValueChange={(v) => {
              if (v) setYear(v);
            }}
          >
            <SelectTrigger className="w-full min-h-11 sm:w-25">
              <SelectValue className="" placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent className="" align="end">
              {years.map((y) => (
                <SelectItem className="" key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="year" value={year} />

        <Button
          type="submit"
          variant="outline"
          className={cn(
            "min-h-11 w-full cursor-pointer justify-center gap-2 rounded-xl",
            "border-foreground/10 bg-linear-to-b from-background to-muted/20",
            "hover:bg-muted/60",
            "dark:border-foreground/10 dark:from-muted/40 dark:to-muted/10",
          )}
          disabled={pending}
        >
          <UploadCloud className="size-4" aria-hidden />
          {pending ? "Menyinkronkan…" : "Sync ke Google Sheets"}
        </Button>
      </form>

      {status ? (
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-xs leading-relaxed",
            status.tone === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.text}
        </p>
      ) : null}
    </div>
  );
}
