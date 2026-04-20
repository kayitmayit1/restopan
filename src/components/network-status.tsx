"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
        isOnline
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Bağlantı yeniden kuruldu
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          İnternet bağlantısı yok — önbellekten çalışıyorsunuz
        </>
      )}
    </div>
  );
}
