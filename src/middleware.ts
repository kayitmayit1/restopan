import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fonksiyon adının tam olarak 'middleware' olduğundan emin olun
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Next.js'in hangi yollarda bu middleware'i çalıştıracağını belirler
export const config = {
  matcher: [
    /*
     * Aşağıdaki dosyaları kontrol dışı bırakır:
     * - _next/static (statik dosyalar)
     * - _next/image (resimler)
     * - favicon.ico, manifest.json, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
}