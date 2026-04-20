"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const nav = [
  { label: "Genel Bakış", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Organizasyonlar", href: "/admin/organizasyonlar", icon: Building2 },
  { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: Users },
  { label: "Abonelikler", href: "/admin/abonelikler", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-zinc-950 text-zinc-100 flex flex-col h-screen sticky top-0">
      <div className="h-[60px] flex items-center gap-2.5 px-4 border-b border-zinc-800">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-[13px] text-white">RestoPan Admin</p>
          <p className="text-[10px] text-zinc-500">Süper Yönetici</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {nav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors mb-1"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard'a Dön
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/giris" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
