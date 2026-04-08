/**
 * Kelas Tailwind untuk kartu dengan aksen gradien lembut — dipakai konsisten
 * di beranda, riwayat, analitik, konsultan, dll.
 */
export const cheerfulCard = {
  emerald:
    "border-0 bg-gradient-to-br from-card via-card to-emerald-500/[0.07] shadow-md ring-1 ring-emerald-500/20 transition-shadow duration-200 hover:shadow-lg dark:to-emerald-400/10 dark:ring-emerald-400/25",
  violet:
    "border-0 bg-gradient-to-br from-card via-card to-violet-500/[0.06] shadow-md ring-1 ring-violet-500/20 transition-shadow duration-200 hover:shadow-lg dark:to-violet-400/10 dark:ring-violet-400/25",
  amber:
    "border-0 bg-gradient-to-br from-card via-card to-amber-500/[0.07] shadow-md ring-1 ring-amber-500/20 transition-shadow duration-200 hover:shadow-lg dark:to-amber-400/10 dark:ring-amber-400/25",
  sky: "border-0 bg-gradient-to-br from-card via-card to-sky-500/[0.07] shadow-md ring-1 ring-sky-500/20 transition-shadow duration-200 hover:shadow-lg dark:to-sky-400/10 dark:ring-sky-400/25",
  rose: "border-0 bg-gradient-to-br from-card via-card to-rose-500/[0.06] shadow-md ring-1 ring-rose-500/20 transition-shadow duration-200 hover:shadow-lg dark:to-rose-400/10 dark:ring-rose-400/25",
} as const;

/** Panel filter periode (analytics / riwayat) */
export const periodFilterSurface =
  "rounded-2xl border border-foreground/10 bg-gradient-to-br from-muted/45 via-card to-card p-3 shadow-sm ring-1 ring-foreground/10 dark:from-muted/20 dark:via-card dark:to-muted/10";
