"use client";

import { useEffect, useRef } from "react";

export function QRCodeDisplay({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">
        <div className="text-center space-y-2">
          <div className="w-32 h-32 bg-foreground/10 rounded-lg mx-auto grid grid-cols-3 gap-1 p-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${[0,1,3,5,7,8,4].includes(i) ? "bg-foreground" : "bg-transparent"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">QR Kod</p>
        </div>
      </div>
    </div>
  );
}
