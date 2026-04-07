import { WifiOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sedang Offline · Family Ledger",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <WifiOff aria-hidden className="size-10 text-primary" />
      <h1 className="text-xl font-semibold">Koneksi terputus</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Anda sedang offline. Data yang sudah tersimpan masih bisa dibuka, lalu
        coba lagi saat internet kembali.
      </p>
      <Button asChild className="min-h-11 w-full max-w-xs">
        <Link href="/dashboard">Coba lagi</Link>
      </Button>
    </div>
  );
}
