import type { TransactionRow } from "@/drizzle/schema";
import { formatIdr } from "@/lib/format";

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

export function TransactionList({ items }: { items: TransactionRow[] }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-center rounded-xl border border-dashed border-border text-muted-foreground">
        Belum ada transaksi. Tambah lewat menu &quot;Tambah&quot; di bawah.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((t) => (
        <li
          key={t.id}
          className="px-4 py-3 rounded-xl border border-border bg-card text-card-foreground"
        >
          <div className="flex gap-3 justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{t.category}</p>
              {t.description ? (
                <p className="text-sm truncate text-muted-foreground">
                  {t.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatWhen(t.date ?? t.createdAt)} · dicatat{" "}
                <span className="capitalize">{t.actorName}</span>
              </p>
            </div>
            <p
              className={
                t.type === "INCOME"
                  ? "shrink-0 font-semibold text-emerald-400"
                  : "shrink-0 font-semibold text-amber-200"
              }
            >
              {t.type === "INCOME" ? "+" : "−"}
              {formatIdr(Number.parseFloat(String(t.amount)))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
