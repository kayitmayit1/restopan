"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, LayoutGrid, ChefHat,
  BookOpen, Package, Users, Calendar, BarChart3, DollarSign, Globe,
  Truck, Tag, Settings, ChevronDown, Store, Bell, LogOut, Vault, ClipboardList, Lock,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { hasFeature, type PlanType } from "@/lib/plan-limits";

type Role = "OWNER" | "ADMIN" | "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN" | "STAFF";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
  feature?: string; // undefined = available on all plans
}

interface NavSection {
  title: string;
  roles?: Role[];
  items: NavItem[];
}

const ALL: Role[] = ["OWNER", "ADMIN", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "STAFF"];
const MANAGEMENT: Role[] = ["OWNER", "ADMIN", "MANAGER"];
const SENIOR: Role[] = ["OWNER", "ADMIN", "MANAGER", "CASHIER"];
const FLOOR: Role[] = ["OWNER", "ADMIN", "MANAGER", "CASHIER", "WAITER", "STAFF"];

const navigation: NavSection[] = [
  {
    title: "Genel Bakış",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: MANAGEMENT },
      { label: "Bildirimler", href: "/dashboard/bildirimler", icon: Bell, roles: ALL, feature: "notifications" },
    ],
  },
  {
    title: "Operasyon",
    items: [
      { label: "POS Sistemi", href: "/dashboard/pos", icon: ShoppingCart, roles: FLOOR, feature: "pos" },
      { label: "Siparişler", href: "/dashboard/siparisler", icon: UtensilsCrossed, roles: ALL, feature: "orders" },
      { label: "Masa Planı", href: "/dashboard/masalar", icon: LayoutGrid, roles: FLOOR, feature: "tables" },
      { label: "Mutfak (KDS)", href: "/dashboard/mutfak", icon: ChefHat, roles: ["OWNER", "ADMIN", "MANAGER", "KITCHEN"], feature: "kds" },
      { label: "Rezervasyonlar", href: "/dashboard/rezervasyonlar", icon: Calendar, roles: FLOOR, feature: "reservations" },
      { label: "Kasa", href: "/dashboard/kasa", icon: Vault, roles: SENIOR, feature: "kasa" },
    ],
  },
  {
    title: "Yönetim",
    roles: MANAGEMENT,
    items: [
      { label: "Menü", href: "/dashboard/menu", icon: BookOpen, roles: MANAGEMENT, feature: "menu" },
      { label: "Stok & Envanter", href: "/dashboard/envanter", icon: Package, roles: MANAGEMENT, feature: "inventory" },
      { label: "Tedarikçiler", href: "/dashboard/tedarikciler", icon: Truck, roles: MANAGEMENT, feature: "suppliers" },
      { label: "Personel", href: "/dashboard/personel", icon: Users, roles: MANAGEMENT, feature: "staff" },
      { label: "Müşteriler", href: "/dashboard/musteriler", icon: Users, roles: SENIOR, feature: "customers" },
    ],
  },
  {
    title: "Büyüme",
    roles: MANAGEMENT,
    items: [
      { label: "Online Sipariş", href: "/dashboard/online-siparis", icon: Globe, roles: MANAGEMENT, feature: "online-order" },
      { label: "Kampanyalar", href: "/dashboard/kampanyalar", icon: Tag, roles: MANAGEMENT, feature: "campaigns" },
    ],
  },
  {
    title: "Raporlar",
    roles: MANAGEMENT,
    items: [
      { label: "Analitik", href: "/dashboard/analitik", icon: BarChart3, roles: MANAGEMENT, feature: "analytics" },
      { label: "Finans", href: "/dashboard/finans", icon: DollarSign, roles: MANAGEMENT, feature: "finance" },
    ],
  },
  {
    title: "Sistem",
    roles: ["OWNER", "ADMIN"],
    items: [
      { label: "İşlem Kaydı", href: "/dashboard/audit", icon: ClipboardList, roles: ["OWNER", "ADMIN"] },
      { label: "Fatura & Plan", href: "/dashboard/ayarlar/fatura", icon: DollarSign, roles: ["OWNER"] },
      { label: "Ayarlar", href: "/dashboard/ayarlar", icon: Settings, roles: ["OWNER", "ADMIN"] },
    ],
  },
];

function hasRole(role: Role | undefined, allowed: Role[] | undefined): boolean {
  if (!allowed) return true;
  if (!role) return false;
  return allowed.includes(role);
}

export function AppSidebar({ plan = "STARTER" }: { plan?: PlanType }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const role = session?.user?.role as Role | undefined;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?unread=1")
      .then((r) => r.json())
      .then((data: unknown[]) => setUnreadCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  const visibleSections = navigation
    .filter((s) => hasRole(role, s.roles))
    .map((s) => ({ ...s, items: s.items.filter((i) => hasRole(role, i.roles)) }))
    .filter((s) => s.items.length > 0);

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="h-[60px] flex items-center px-4 border-b border-sidebar-border gap-3">
        <RestoPanLogo iconSize={32} dark />
      </div>

      <div className="px-3 py-2 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
          <Store className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate flex-1 text-left">Ana Şube</span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-1">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-4 py-1 group"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors">
                {section.title}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-sidebar-foreground/30 transition-transform", collapsed[section.title] && "-rotate-90")} />
            </button>

            {!collapsed[section.title] && (
              <div className="mt-0.5 space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const locked = item.feature ? !hasFeature(plan, item.feature) : false;

                  if (locked) {
                    return (
                      <Link
                        key={item.href}
                        href="/dashboard/ayarlar/fatura"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/30 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/50 transition-all group"
                        title="Bu özellik Professional plana dahildir"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <Lock className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-80" />
                      </Link>
                    );
                  }

                  return (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-primary text-white font-medium shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/dashboard/bildirimler" && unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

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
                <p className="text-sm font-medium text-sidebar-foreground truncate">{session?.user?.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{role ?? session?.user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
            </>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => router.push("/dashboard/ayarlar/profil")}>Profil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/giris" })} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
