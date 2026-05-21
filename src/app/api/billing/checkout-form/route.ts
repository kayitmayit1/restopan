import { NextRequest, NextResponse } from "next/server";

// LemonSqueezy hosted checkout kullanıldığından bu route artık gerekli değil.
// Eski bağlantılar için fatura sayfasına yönlendir.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/ayarlar/fatura", req.url));
}
