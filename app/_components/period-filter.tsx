"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { periodFilterSurface } from "@/lib/cheerful-card";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const SELECT_CLASS = cn(
  "min-h-10 w-full min-w-0 cursor-pointer rounded-xl border border-input bg-background/90 px-2 py-2 text-xs shadow-sm ring-1 ring-foreground/5 transition-colors",
  "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  "sm:min-h-11 sm:px-3 sm:text-sm",
  "dark:bg-input/40",
);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function PeriodFilter({
  month,
  year,
  day,
}: {
  month: number;
  year: number;
  day: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i,
  );

  const maxDay = useMemo(() => daysInMonth(year, month), [year, month]);

  function update(next: {
    month?: number;
    year?: number;
    day?: number | null;
  }) {
    const nextMonth = next.month ?? month;
    const nextYear = next.year ?? year;
    let nextDay = next.day !== undefined ? next.day : day;
    if (nextDay !== null) {
      const cap = daysInMonth(nextYear, nextMonth);
      if (nextDay > cap) {
        nextDay = null;
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(nextMonth));
    params.set("year", String(nextYear));
    params.set("page", "1");
    if (nextDay === null) {
      params.delete("day");
    } else {
      params.set("day", String(nextDay));
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className={cn(periodFilterSurface)}>
      <div className="grid grid-cols-3 gap-2">
        <label className="min-w-0 space-y-1">
          <span className="block truncate text-xs text-muted-foreground">
            Tanggal
          </span>
          <select
            className={SELECT_CLASS}
            value={day === null ? "" : String(day)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                update({ day: null });
              } else {
                update({ day: Number.parseInt(v, 10) });
              }
            }}
          >
            <option value="">Semua hari</option>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 space-y-1">
          <span className="block truncate text-xs text-muted-foreground">
            Bulan
          </span>
          <select
            className={SELECT_CLASS}
            value={month}
            onChange={(e) =>
              update({ month: Number.parseInt(e.target.value, 10) })
            }
          >
            {MONTHS.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 space-y-1">
          <span className="block truncate text-xs text-muted-foreground">
            Tahun
          </span>
          <select
            className={SELECT_CLASS}
            value={year}
            onChange={(e) =>
              update({ year: Number.parseInt(e.target.value, 10) })
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
