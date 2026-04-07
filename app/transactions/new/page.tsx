import { NewTransactionForm } from "./_components/new-transaction-form";

export const metadata = {
  title: "Tambah transaksi · Family Ledger",
};

export default function NewTransactionPage() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">
        Tambah transaksi
      </h1>
      <p className="text-sm text-muted-foreground">
        Catat pemasukan atau pengeluaran secara manual.
      </p>
      <NewTransactionForm />
    </div>
  );
}
