"use client";

import { Camera } from "lucide-react";
import { useActionState, useCallback, useEffect, useRef } from "react";

import { scanReceipt } from "@/app/actions/receipt-ocr";
import { Button } from "@/components/ui/button";

/**
 * Form terpisah dari form transaksi (HTML tidak mengizinkan form bersarang).
 */
export function ReceiptScan({ onExtracted }) {
  const [state, formAction, pending] = useActionState(scanReceipt, null);
  const inputRef = useRef(null);
  const lastAppliedKey = useRef(null);

  const stableOnExtracted = useCallback(
    (data) => {
      onExtracted(data);
    },
    [onExtracted],
  );

  useEffect(() => {
    if (state?.success && state.data) {
      const key = JSON.stringify(state.data);
      if (lastAppliedKey.current === key) {
        return;
      }
      lastAppliedKey.current = key;
      stableOnExtracted(state.data);
    }
  }, [state, stableOnExtracted]);

  useEffect(() => {
    if (state && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        name="receiptImage"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Pilih foto struk"
        disabled={pending}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            e.target.form?.requestSubmit();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="min-h-12 w-full cursor-pointer gap-2 text-base"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="size-5 shrink-0" aria-hidden />
        {pending ? "Memindai struk…" : "Pindai struk dengan AI"}
      </Button>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
