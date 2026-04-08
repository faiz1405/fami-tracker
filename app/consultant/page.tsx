import { MessageCircle } from "lucide-react";

import { ConsultantChat } from "@/app/consultant/_components/consultant-chat";

export const dynamic = "force-dynamic";

export default function ConsultantPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <MessageCircle
            className="size-7 shrink-0 text-violet-500 dark:text-violet-400"
            aria-hidden
          />
          Tanya Keuangan
        </h1>
        <p className="text-sm text-muted-foreground">
          Tanyakan analisis pengeluaran, pola belanja, dan rekomendasi hemat
          berbasis data transaksi keluarga.
        </p>
      </header>
      <ConsultantChat />
    </div>
  );
}
