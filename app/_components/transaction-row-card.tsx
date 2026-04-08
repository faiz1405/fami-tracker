"use client";

import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteTransaction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import type { TransactionRow } from "@/drizzle/schema";
import { formatIdr } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatWhen(value: Date | null): string {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function TransactionRowCard({
  transaction: t,
}: {
  transaction: TransactionRow;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const income = t.type === "INCOME";

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteTransaction(t.id);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setConfirmOpen(false);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-2xl border-0 text-card-foreground shadow-sm ring-1 transition-shadow duration-200 hover:shadow-md",
        income
          ? "border-l-4 border-l-emerald-500 bg-gradient-to-br from-card via-card to-emerald-500/[0.06] ring-emerald-500/15 dark:border-l-emerald-400 dark:to-emerald-400/[0.08] dark:ring-emerald-400/20"
          : "border-l-4 border-l-amber-500 bg-gradient-to-br from-card via-card to-amber-500/[0.06] ring-amber-500/15 dark:border-l-amber-400 dark:to-amber-400/[0.08] dark:ring-amber-400/20",
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-2 px-3 py-3.5 sm:gap-3 sm:px-4",
          confirmOpen && "pointer-events-none opacity-40",
        )}
      >
        <div className="flex min-w-0 flex-1 gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
              income
                ? "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
            )}
          >
            {income ? (
              <ArrowUpRight className="size-5" aria-hidden />
            ) : (
              <ArrowDownRight className="size-5" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">{t.category}</p>
            {t.description ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {t.description}
              </p>
            ) : null}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {formatWhen(t.date ?? t.createdAt)} · dicatat{" "}
              <span className="capitalize">{t.actorName}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p
            className={cn(
              "tabular-nums text-sm font-bold tracking-tight sm:text-base",
              income
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-300",
            )}
          >
            {income ? "+" : "−"}
            {formatIdr(Number.parseFloat(String(t.amount)))}
          </p>
          <div className="flex flex-row items-center gap-2">
            <Link
              href={`/transactions/${t.id}/edit`}
              className={cn(
                "cursor-pointer rounded-xl border border-sky-500/40 bg-sky-500/10 p-2 text-sky-600 transition-colors duration-200",
                "hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
                "dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/20",
              )}
              aria-label={`Edit transaksi ${t.category}`}
            >
              <Pencil className="size-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setConfirmOpen(true);
              }}
              className={cn(
                "cursor-pointer rounded-xl border border-destructive/35 bg-destructive/5 p-2 text-destructive transition-colors duration-200",
                "hover:bg-destructive/15 focus-visible:border-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30",
                "dark:border-destructive/50 dark:bg-destructive/10 dark:hover:bg-destructive/20",
              )}
              aria-label={`Hapus transaksi ${t.category}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div
          className={cn(
            "absolute inset-0 z-10 box-border flex min-h-full flex-col items-center justify-center overflow-y-auto overscroll-contain",
            "bg-background/92 px-6 backdrop-blur-sm sm:px-8",
            "pt-[max(2.75rem,calc(1rem+env(safe-area-inset-top,0px)))]",
            "pb-[max(6.5rem,calc(2rem+env(safe-area-inset-bottom,0px)))] sm:pb-[max(7.5rem,calc(2.25rem+env(safe-area-inset-bottom,0px)))]",
          )}
          data-testid="transaction-delete-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${t.id}`}
        >
          <div className="flex w-full max-w-sm flex-col items-center gap-2 pb-1">
            <p
              id={`delete-title-${t.id}`}
              className="text-center text-sm font-medium leading-relaxed text-foreground"
            >
              Hapus transaksi ini? Tindakan tidak bisa dibatalkan.
            </p>
            {error ? (
              <p className="text-center text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full cursor-pointer sm:min-h-10 sm:flex-1"
                disabled={pending}
                onClick={() => {
                  setConfirmOpen(false);
                  setError(null);
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11 w-full cursor-pointer sm:min-h-10 sm:flex-1"
                disabled={pending}
                onClick={handleDelete}
              >
                {pending ? "Menghapus…" : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}
