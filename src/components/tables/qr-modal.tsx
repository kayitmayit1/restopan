"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface Props {
  tableName: string;
  url: string;
  onClose: () => void;
}

export function QrModal({ tableName, url, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
    });
  }, [url]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${tableName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">QR Kod — {tableName}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div className="p-3 bg-white border rounded-2xl shadow-sm">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-muted-foreground text-center break-all px-2">{url}</p>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(url, "_blank")}>
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Aç
          </Button>
          <Button size="sm" className="flex-1" onClick={download}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            İndir
          </Button>
        </div>
      </div>
    </div>
  );
}
