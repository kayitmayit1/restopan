"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  LayoutGrid,
  ChefHat,
  BookOpen,
  Package,
  Users,
  Calendar,
  BarChart3,
  DollarSign,
  Globe,
  Truck,
  Tag,
  Settings,
  ChevronDown,
  Store,
  Bell,
  LogOut,
  Vault,
  ClipboardList,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";

const navigation = [
  {
    title: "Genel Bakış",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Bildirimler", href: "/dashboard/bildirimler", icon: Bell },
    ],
  },
  {
    title: "Operasyon",
    items: [
      { label: "POS Sistemi", href: "/dashboard/pos", icon: ShoppingCart },
      { label: "Siparişler", href: "/dashboard/siparisler", icon: UtensilsCrossed },
      { label: "Masa Planı", href: "/dashboard/masalar", icon: LayoutGrid },
      { label: "Mutfak (KDS)", href: "/dashboard/mutfak", icon: ChefHat },
      { label: "Rezervasyonlar", href: "/dashboard/rezervasyonlar", icon: Calendar },
      { label: "Kasa", href: "/dashboard/kasa", icon: Vault },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { label: "Menü", href: "/dashboard/menu", icon: BookOpen },
      { label: "Stok & Envanter", href: "/dashboard/envanter", icon: Package },
      { label: "Tedarikçiler", href: "/dashboard/tedarikciler", icon: Truck },
      { label: "Personel", href: "/dashboard/personel", icon: Users },
      { label: "Müşteriler", href: "/dashboard/musteriler", icon: Users },
    ],
  },
  {
    title: "Büyüme",
    items: [
      { label: "Online Sipariş", href: "/dashboard/online-siparis", icon: Globe },
      { label: "Kampanyalar", href: "/dashboard/kampanyalar", icon: Tag },
    ],
  },
  {
    title: "Raporlar",
    items: [
      { label: "Analitik", href: "/dashboard/analitik", icon: BarChart3 },
      { label: "Finans", href: "/dashboard/finans", icon: DollarSign },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "İşlem Kaydı", href: "/dashboard/audit", icon: ClipboardList },
      { label: "Fatura & Plan", href: "/dashboard/ayarlar/fatura", icon: DollarSign },
      { label: "Ayarlar", href: "/dashboard/ayarlar", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-4 border-b border-sidebar-border gap-3">
        <RestoPanLogo iconSize={32} dark />
      </div>

      {/* Location Switcher */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
          <Store className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate flex-1 text-left">Ana Şube</span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1">
        {navigation.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-4 py-1 group"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors">
                {section.title}
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-sidebar-foreground/30 transition-transform",
                  collapsed[section.title] && "-rotate-90"
                )}
              />
            </button>

            {!collapsed[section.title] && (
              <div className="mt-0.5 space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-primary text-white font-medium shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left">
            <>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-xs bg-primary text-white">
                  {getInitials(session?.user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
            </>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => router.push("/dashboard/ayarlar/profil")}>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/ayarlar")}>
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/giris" })}
              className="text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
