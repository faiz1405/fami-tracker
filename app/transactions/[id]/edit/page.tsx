import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateForDateInput } from "@/lib/format";
import { getTransactionById } from "@/lib/queries/transaction-by-id";

import { EditTransactionForm } from "./_components/edit-transaction-form";

export const metadata = {
  title: "Edit transaksi · Family Ledger",
};

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tx = await getTransactionById(id);
  if (!tx) {
    notFound();
  }

  const initialAmount = String(
    Math.round(Number.parseFloat(String(tx.amount))),
  );
  const initialDate = formatDateForDateInput(tx.date);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link
          href="/history"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Riwayat
        </Link>
      </div>
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Pencil
          className="size-7 shrink-0 text-violet-500 dark:text-violet-400"
          aria-hidden
        />
        Edit transaksi
      </h1>
      <p className="text-sm text-muted-foreground">
        Ubah jumlah, kategori, atau tanggal lalu simpan.
      </p>
      <EditTransactionForm
        transactionId={tx.id}
        initialAmount={initialAmount}
        initialCategory={tx.category}
        initialDescription={tx.description ?? ""}
        initialActorName={tx.actorName}
        initialType={tx.type === "INCOME" ? "INCOME" : "EXPENSE"}
        initialDate={initialDate}
      />
    </div>
  );
}
