"use client";

import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteTransaction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
      <div className="flex items-start justify-between gap-2 px-3 py-3.5 sm:gap-3 sm:px-4">
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

      <Dialog.Root
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setError(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup
              data-testid="transaction-delete-confirm"
              aria-labelledby={`delete-title-${t.id}`}
              aria-describedby={`delete-desc-${t.id}`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                      "bg-destructive/12 text-destructive ring-destructive/20",
                      "dark:bg-destructive/18 dark:ring-destructive/30",
                    )}
                    aria-hidden
                  >
                    <Trash2 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                    <Dialog.Title
                      id={`delete-title-${t.id}`}
                      className="text-base font-semibold leading-snug tracking-tight text-foreground"
                    >
                      Hapus transaksi ini?
                    </Dialog.Title>
                    <Dialog.Description
                      id={`delete-desc-${t.id}`}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      Tindakan tidak bisa dibatalkan. Transaksi{" "}
                      <span className="font-medium text-foreground">
                        {t.category}
                      </span>{" "}
                      akan dihapus permanen.
                    </Dialog.Description>
                  </div>
                </div>

                {error ? (
                  <p
                    className="text-center text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-row items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-1/2 cursor-pointer sm:min-h-10"
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
                    className="min-h-11 w-1/2 cursor-pointer sm:min-h-10"
                    disabled={pending}
                    onClick={handleDelete}
                  >
                    {pending ? "Menghapus…" : "Hapus"}
                  </Button>
                </div>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </li>
  );
}
