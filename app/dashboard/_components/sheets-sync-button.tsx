"use client";

import { Sheet, UploadCloud } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { syncTransactionsToGoogleSheets } from "@/app/actions/sheets-sync";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);

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
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-xs",
          "border-sky-500/30 bg-sky-500/8 text-sky-700 hover:bg-sky-500/15",
          "dark:border-sky-400/35 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/18",
        )}
        onClick={() => setOpen(true)}
      >
        <Sheet className="size-3.5" aria-hidden />
        Sync Sheets
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup data-testid="sheets-sync-popup">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25">
                    <Sheet className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <Dialog.Title className="text-base font-semibold leading-tight">
                      Sync Google Sheets
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Pilih bulan lalu sinkronkan transaksi ke tab bulanan.
                    </Dialog.Description>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={month}
                    onValueChange={(v) => {
                      if (v) setMonth(v);
                    }}
                  >
                    <SelectTrigger className="min-h-11 w-full">
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
                    <SelectTrigger className="min-h-11 w-full">
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

                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
