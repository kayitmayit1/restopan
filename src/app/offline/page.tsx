"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-full bg-orange-100 p-6 dark:bg-orange-950">
        <WifiOff className="h-12 w-12 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">İnternet Bağlantısı Yok</h1>
        <p className="text-muted-foreground max-w-sm">
          Bağlantınız kesildi. Önbelleğe alınan verilerle çalışmaya devam edebilirsiniz.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        Tekrar Dene
      </button>
    </div>
  );
}
