"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Bulan</span>
          <select
            className="min-h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm"
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
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Tahun</span>
          <select
            className="min-h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm"
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
      <label className="space-y-1">
        <span className="text-xs text-muted-foreground">Tanggal</span>
        <select
          className="min-h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm"
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
          <option value="">Semua hari (bulan penuh)</option>
          {dayOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
