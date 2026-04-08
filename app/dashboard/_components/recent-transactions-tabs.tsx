"use client";

import { LayoutGrid, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import type { TransactionRow } from "@/drizzle/schema";
import { cn } from "@/lib/utils";

import { TransactionList } from "./transaction-list";

type FilterKey = "all" | "INCOME" | "EXPENSE";

function tabIds(scope: "recent" | "history") {
  const p = scope === "history" ? "history" : "recent";
  return {
    all: `${p}-tab-all`,
    income: `${p}-tab-income`,
    expense: `${p}-tab-expense`,
    panel: `${p}-tx-panel`,
  } as const;
}

export function RecentTransactionsTabs({
  items,
  scope = "recent",
}: {
  items: TransactionRow[];
  /** `history`: label/id untuk halaman Riwayat; default untuk Beranda */
  scope?: "recent" | "history";
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") {
      return items;
    }
    return items.filter((t) => t.type === filter);
  }, [items, filter]);

  const emptyLabel = useMemo(() => {
    if (items.length === 0 || filtered.length > 0) {
      return undefined;
    }
    if (filter === "INCOME") {
      return scope === "history"
        ? "Tidak ada pemasukan dalam tampilan ini."
        : "Tidak ada pemasukan dalam daftar terbaru.";
    }
    if (filter === "EXPENSE") {
      return scope === "history"
        ? "Tidak ada pengeluaran dalam tampilan ini."
        : "Tidak ada pengeluaran dalam daftar terbaru.";
    }
    return undefined;
  }, [items.length, filtered.length, filter, scope]);

  const ids = tabIds(scope);
  const TABS: {
    key: FilterKey;
    id: string;
    label: string;
    Icon: typeof LayoutGrid;
  }[] = [
    { key: "all", id: ids.all, label: "Semua", Icon: LayoutGrid },
    {
      key: "INCOME",
      id: ids.income,
      label: "Pemasukan",
      Icon: TrendingUp,
    },
    {
      key: "EXPENSE",
      id: ids.expense,
      label: "Pengeluaran",
      Icon: TrendingDown,
    },
  ];

  const activeTabId = TABS.find((t) => t.key === filter)?.id ?? ids.all;

  const tablistLabel =
    scope === "history"
      ? "Filter riwayat transaksi"
      : "Filter transaksi terbaru";

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={tablistLabel}
        className="flex gap-1 rounded-2xl border border-foreground/10 bg-gradient-to-b from-muted/70 to-muted/40 p-1.5 shadow-inner dark:from-muted/50 dark:to-muted/25"
      >
        {TABS.map(({ key, id, label, Icon }) => {
          const selected = filter === key;
          return (
            <button
              key={key}
              id={id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setFilter(key)}
              className={cn(
                "flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-semibold transition-all duration-200 touch-manipulation sm:flex-row sm:gap-1.5 sm:text-sm",
                selected
                  ? "bg-gradient-to-b from-card to-card/95 text-foreground shadow-md ring-1 ring-foreground/10 dark:from-card dark:to-muted/30"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground hover:shadow-sm",
                selected &&
                  key === "all" &&
                  "ring-sky-500/30 dark:ring-sky-400/35",
                selected &&
                  key === "INCOME" &&
                  "ring-emerald-500/35 dark:ring-emerald-400/40",
                selected &&
                  key === "EXPENSE" &&
                  "ring-amber-500/35 dark:ring-amber-400/40",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  !selected && "opacity-70",
                  selected &&
                    (key === "all"
                      ? "text-sky-500 dark:text-sky-400"
                      : key === "INCOME"
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"),
                )}
                aria-hidden
              />
              <span className="leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={ids.panel} aria-labelledby={activeTabId}>
        <TransactionList items={filtered} emptyLabel={emptyLabel} />
      </div>
    </div>
  );
}
