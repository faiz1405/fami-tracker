"use client";

import type { ChangeEvent } from "react";
import { useActionState, useMemo, useState } from "react";

import { parseNaturalInput } from "@/app/actions/natural-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NaturalInputForm() {
  const [actorName, setActorName] = useState<"suami" | "istri">("suami");
  const [text, setText] = useState("");
  const [state, action, pending] = useActionState(parseNaturalInput, null);

  const successText = useMemo(() => {
    if (!state?.success || !state.parsed) {
      return null;
    }
    const sign = state.parsed.type === "INCOME" ? "+" : "-";
    const amount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(state.parsed.amount);
    return `${sign}${amount} · ${state.parsed.category} · ${state.parsed.actorName}`;
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label
          className={cn(
            "flex gap-2 justify-center items-center px-4 py-2 text-sm rounded-xl border transition-colors duration-200 cursor-pointer min-h-11 border-input bg-card",
            "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
          )}
        >
          <input
            type="radio"
            name="actorNameFallback"
            value="suami"
            checked={actorName === "suami"}
            onChange={() => setActorName("suami")}
            className="size-4 accent-primary"
          />
          Suami
        </label>
        <label
          className={cn(
            "flex gap-2 justify-center items-center px-4 py-2 text-sm rounded-xl border transition-colors duration-200 cursor-pointer min-h-11 border-input bg-card",
            "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-ring/40",
          )}
        >
          <input
            type="radio"
            name="actorNameFallback"
            value="istri"
            checked={actorName === "istri"}
            onChange={() => setActorName("istri")}
            className="size-4 accent-primary"
          />
          Istri
        </label>
      </div>

      <div className="flex gap-2 items-center">
        <Input
          name="text"
          type="text"
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setText(e.target.value)
          }
          placeholder='Contoh: "Tadi sore jajan kopi 35rb"'
          className="text-base min-h-12"
          autoComplete="off"
          required
        />
        <Button type="submit" className="px-4 min-h-12" disabled={pending}>
          {pending ? "Proses..." : "AI"}
        </Button>
      </div>

      {state?.error ? (
        <p className="px-3 py-2 text-sm rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
          {state.error}
        </p>
      ) : null}
      {successText ? (
        <p className="px-3 py-2 text-sm text-emerald-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
          Tersimpan: {successText}
        </p>
      ) : null}
    </form>
  );
}
