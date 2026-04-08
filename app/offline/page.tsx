import { WifiOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cheerfulCard } from "@/lib/cheerful-card";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sedang Offline · Family Ledger",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <Card className={cn(cheerfulCard.sky, "w-full max-w-sm")}>
        <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6">
          <WifiOff
            aria-hidden
            className="size-12 text-sky-600 dark:text-sky-400"
          />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Koneksi terputus</h1>
            <p className="text-sm text-muted-foreground">
              Anda sedang offline. Data yang sudah tersimpan masih bisa dibuka,
              lalu coba lagi saat internet kembali.
            </p>
          </div>
          <Button asChild className="min-h-11 w-full cursor-pointer">
            <Link href="/dashboard">Coba lagi</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
