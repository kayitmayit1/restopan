"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <RestoPanLogo iconSize={48} className="mx-auto" />

        <div>
          <p className="text-8xl font-bold text-red-200 leading-none">500</p>
          <h1 className="text-2xl font-bold mt-2">Bir Hata Oluştu</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Beklenmedik bir hata ile karşılaştık. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono">Hata Kodu: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
