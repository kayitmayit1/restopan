import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/giris", "/kayit", "/davet", "/menu", "/onboarding"];
const SUPER_ADMIN_EMAIL = "ince.htce@gmail.com";

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

  return NextResponse.next();
});

export { handler as proxy };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
