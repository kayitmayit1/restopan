import QRCode from "qrcode";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  label?: string;
}

export async function QRCodeDisplay({ url, label }: QRCodeDisplayProps) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: { dark: "#111111", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white rounded-2xl p-4 border shadow-sm inline-flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={label ?? "QR Kod"}
          width={192}
          height={192}
          className="rounded-lg"
        />
      </div>
      <a
        href={dataUrl}
        download={`qr-${label ?? "menu"}.png`}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 text-sm rounded-md border border-border bg-background hover:bg-muted transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        İndir
      </a>
    </div>
  );
}
