import { CirclePlus } from "lucide-react";

import { NewTransactionForm } from "./_components/new-transaction-form";

export const metadata = {
  title: "Tambah transaksi · Family Ledger",
};

export default function NewTransactionPage() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <CirclePlus
          className="size-7 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        Tambah transaksi
      </h1>
      <p className="text-sm text-muted-foreground">
        Catat pemasukan atau pengeluaran secara manual.
      </p>
      <NewTransactionForm />
    </div>
  );
}
