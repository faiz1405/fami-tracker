"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#34D399",
  "#F43F5E",
  "#94A3B8",
];

export function CategoryPieChart({
  data,
}: {
  data: Array<{ category: string; total: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Belum ada pengeluaran di periode ini.
      </p>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={48}
            outerRadius={82}
          >
            {data.map((entry, idx) => (
              <Cell
                key={`${entry.category}-${idx}`}
                fill={COLORS[idx % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const raw = Array.isArray(value) ? value[0] : value;
              const amount =
                typeof raw === "number" ? raw : Number.parseFloat(String(raw));
              return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(Number.isNaN(amount) ? 0 : amount);
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
