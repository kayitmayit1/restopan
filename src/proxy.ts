import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/giris", "/kayit", "/davet", "/menu", "/siparis", "/onboarding", "/hakkimizda", "/iletisim", "/destek", "/gizlilik", "/kullanim-kosullari", "/sss"];
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "ince.htce@gmail.com";

// Routes that require at least MANAGEMENT role (OWNER, ADMIN, MANAGER)
const managementRoutes = [
  "/dashboard/menu",
  "/dashboard/envanter",
  "/dashboard/tedarikciler",
  "/dashboard/personel",
  "/dashboard/analitik",
  "/dashboard/finans",
  "/dashboard/online-siparis",
  "/dashboard/kampanyalar",
];

// Routes that require OWNER or ADMIN only
const ownerRoutes = [
  "/dashboard/ayarlar",
  "/dashboard/audit",
];

// Routes only for billing (OWNER only)
const ownerBillingRoutes = ["/dashboard/ayarlar/fatura"];

const MANAGEMENT_ROLES = ["OWNER", "ADMIN", "MANAGER"];
const OWNER_ROLES = ["OWNER", "ADMIN"];

const handler = auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  if (req.auth && pathname === "/giris") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!req.auth || req.auth.user?.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (req.auth && pathname.startsWith("/dashboard")) {
    const role = (req.auth as { user?: { role?: string } }).user?.role;

    const isOwnerBilling = ownerBillingRoutes.some((r) => pathname.startsWith(r));
    if (isOwnerBilling && !OWNER_ROLES.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isOwnerRoute = ownerRoutes.some((r) => pathname.startsWith(r));
    if (isOwnerRoute && !OWNER_ROLES.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isManagementRoute = managementRoutes.some((r) => pathname.startsWith(r));
    if (isManagementRoute && !MANAGEMENT_ROLES.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard/siparisler", req.url));
    }

    // KITCHEN role: only mutfak + siparisler
    if (role === "KITCHEN") {
      const allowed = ["/dashboard/mutfak", "/dashboard/siparisler", "/dashboard/bildirimler", "/dashboard/ayarlar/profil"];
      const isAllowed = allowed.some((r) => pathname === r || pathname.startsWith(r + "/"));
      if (!isAllowed && pathname !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/mutfak", req.url));
      }
    }
  }

  return NextResponse.next();
});

export { handler as proxy };

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
