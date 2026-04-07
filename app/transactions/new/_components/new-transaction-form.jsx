"use client";

import { useActionState, useCallback, useState } from "react";

import { createTransaction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRANSACTION_CATEGORIES } from "@/lib/constants/transaction-categories";
import { cn } from "@/lib/utils";

import { ReceiptScan } from "./receipt-scan";

function vibrateShort() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(12);
  }
}

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function formatRupiahInput(value) {
  if (!value) {
    return "";
  }
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) {
    return "";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function NewTransactionForm() {
  const [state, formAction, isPending] = useActionState(
    createTransaction,
    null,
  );

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [txType, setTxType] = useState("EXPENSE");
  const [actorName, setActorName] = useState("suami");

  const applyOcr = useCallback((data) => {
    if (data.total_amount != null && !Number.isNaN(data.total_amount)) {
      setAmount(String(Math.round(Number(data.total_amount))));
    }
    if (data.suggested_category) {
      setCategory(data.suggested_category);
    }
    const summaryText =
      typeof data.summary === "string" && data.summary.trim().length > 0
        ? data.summary.trim()
        : null;
    if (summaryText) {
      setDescription(summaryText);
    } else {
      const parts = [data.merchant_name, data.date].filter(Boolean);
      if (parts.length > 0) {
        setDescription(parts.join(" · "));
      }
    }
    if (
      typeof data.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.date)
    ) {
      setTransactionDate(data.date);
    }
    setTxType("EXPENSE");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(18);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">
          Foto struk (opsional)
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          AI membaca total, merchant, tanggal, dan kategori. Anda bisa
          mengoreksi sebelum menyimpan.
        </p>
        <ReceiptScan onExtracted={applyOcr} />
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="space-y-2">
          <span className="text-sm font-medium">Dicatat oleh</span>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 transition-colors duration-200",
                "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
              )}
            >
              <input
                type="radio"
                name="actorName"
                value="suami"
                checked={actorName === "suami"}
                onChange={() => setActorName("suami")}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="font-medium">Suami</span>
            </label>
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 transition-colors duration-200",
                "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
              )}
            >
              <input
                type="radio"
                name="actorName"
                value="istri"
                checked={actorName === "istri"}
                onChange={() => setActorName("istri")}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="font-medium">Istri</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Jenis</span>
          <div className="grid grid-cols-1 gap-2">
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors duration-200",
                "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
              )}
            >
              <input
                type="radio"
                name="type"
                value="EXPENSE"
                checked={txType === "EXPENSE"}
                onChange={() => setTxType("EXPENSE")}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="font-medium">Pengeluaran</span>
            </label>
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors duration-200",
                "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
              )}
            >
              <input
                type="radio"
                name="type"
                value="INCOME"
                checked={txType === "INCOME"}
                onChange={() => setTxType("INCOME")}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="font-medium">Pemasukan</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Jumlah (IDR)</Label>
          <input type="hidden" name="amount" value={amount} />
          <Input
            id="amount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Rp 85.000"
            required
            value={formatRupiahInput(amount)}
            onChange={(e) => setAmount(digitsOnly(e.target.value))}
            className="min-h-11 text-base"
          />
          <p className="text-xs text-muted-foreground">
            Hanya angka. Contoh: 85000 akan jadi Rp 85.000
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex min-h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {TRANSACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionDate">Tanggal transaksi</Label>
          <Input
            id="transactionDate"
            name="transactionDate"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="min-h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Catatan (opsional)</Label>
          <Input
            id="description"
            name="description"
            type="text"
            autoComplete="off"
            placeholder="mis. Makan siang"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-11 text-base"
          />
        </div>

        {state?.error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="min-h-12 w-full cursor-pointer text-base"
          disabled={isPending}
          onClick={() => vibrateShort()}
        >
          {isPending ? "Menyimpan…" : "Simpan transaksi"}
        </Button>
      </form>
    </div>
  );
}
