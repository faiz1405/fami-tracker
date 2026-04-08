"use client";

import {
  BarChart3,
  History,
  Home,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/consultant", label: "Tanya", icon: MessageSquare },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/transactions/new", label: "Tambah", icon: PlusCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-backdrop-filter:bg-card/80"
    >
      <ul className="flex h-16 items-stretch justify-around gap-1 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex min-w-0 flex-1">
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "box-border flex min-h-11 w-full cursor-pointer flex-col items-center justify-center gap-0.5 border-t-2 border-transparent px-1.5 pt-2 pb-1.5 text-xs transition-colors duration-200 touch-manipulation",
                  active
                    ? "border-t-primary font-semibold text-primary"
                    : cn(
                        "font-medium text-muted-foreground",
                        "hover:text-foreground active:text-foreground",
                      ),
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "size-6 shrink-0 transition-colors duration-200",
                    active ? "text-primary" : "opacity-90",
                  )}
                />
                <span className="leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
