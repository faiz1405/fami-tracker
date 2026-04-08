"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

/**
 * Dialog Base UI dengan gaya kartu terpusat (backdrop + viewport + popup).
 * z-index di atas bottom nav (z-50).
 */
function Backdrop({ className = "", ...props }) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-100 bg-black/45 backdrop-blur-[3px]",
        "transition-[opacity,backdrop-filter] duration-200",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
        "dark:bg-black/60",
        className,
      )}
      {...props}
    />
  );
}

function Viewport({ className = "", ...props }) {
  return (
    <DialogPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-101 flex items-center justify-center",
        "p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
        className,
      )}
      {...props}
    />
  );
}

function Popup({ className = "", ...props }) {
  return (
    <DialogPrimitive.Popup
      className={cn(
        "max-h-[min(90dvh,32rem)] w-full max-w-[min(100%,22rem)] overflow-y-auto overflow-x-hidden",
        "rounded-2xl border border-border/90 bg-card p-6 shadow-2xl",
        "ring-1 ring-black/5 dark:border-border dark:bg-card dark:ring-white/10",
        "sm:p-7",
        "transition-[opacity,transform] duration-200",
        "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
        "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export const Dialog = {
  Root: DialogPrimitive.Root,
  Portal: DialogPrimitive.Portal,
  Title: DialogPrimitive.Title,
  Description: DialogPrimitive.Description,
  Close: DialogPrimitive.Close,
  Backdrop,
  Viewport,
  Popup,
};
