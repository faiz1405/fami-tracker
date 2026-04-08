import Link from "next/link";

export default function EditTransactionNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-lg font-medium">Transaksi tidak ditemukan</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Mungkin sudah dihapus atau tautan tidak valid.
      </p>
      <Link
        href="/history"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Kembali ke Riwayat
      </Link>
    </div>
  );
}
