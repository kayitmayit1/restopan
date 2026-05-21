import { NextRequest, NextResponse } from "next/server";

// LemonSqueezy checkout tamamlandığında kullanıcıyı buraya yönlendirir.
// Abonelik aktivasyonu webhook üzerinden asenkron gerçekleşir.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/ayarlar/fatura?success=1", req.url));
}
