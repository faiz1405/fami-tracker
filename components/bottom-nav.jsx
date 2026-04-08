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
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-card/80"
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
                className={cn(
                  "flex min-h-11 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-xs font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden
                  className={cn("size-6", active && "text-primary")}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
