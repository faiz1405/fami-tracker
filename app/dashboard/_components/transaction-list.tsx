import { TransactionRowCard } from "@/app/_components/transaction-row-card";
import type { TransactionRow } from "@/drizzle/schema";

const DEFAULT_EMPTY =
  'Belum ada transaksi. Tambah lewat menu "Tambah" di bawah.';

export function TransactionList({
  items,
  emptyLabel,
}: {
  items: TransactionRow[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/5">
        {emptyLabel ?? DEFAULT_EMPTY}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((t) => (
        <TransactionRowCard key={t.id} transaction={t} />
      ))}
    </ul>
  );
}
