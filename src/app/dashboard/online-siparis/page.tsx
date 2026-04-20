import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { QRCodeDisplay } from "@/components/menu/qr-code";

export default async function OnlineSiparisPage() {
  const session = await auth();
  if (!session?.user.organizationId) return null;

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { name: true, slug: true },
  });

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${org?.slug}`;

  return (
    <div>
      <Topbar title="Online Sipariş & QR Menü" subtitle="Dijital menü ve online sipariş yönetimi" />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />QR Kod Menü
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Masalara QR kod koyarak müşterilerinizin telefonlarından menüyü görüntülemesini ve sipariş vermesini sağlayın.
              </p>
              <QRCodeDisplay url={menuUrl} />
              <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-lg break-all">{menuUrl}</p>
              <div className="flex gap-2">
                <Link href={menuUrl} target="_blank"
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 text-sm rounded-md border border-border bg-background hover:bg-muted transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />Önizle
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />Online Sipariş
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Müşterileriniz web tarayıcısından menüyü görüntüleyip sipariş verebilir.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Masada Sipariş", desc: "QR kod ile masa başından sipariş" },
                  { label: "Paket Sipariş", desc: "Online paket siparişi alın" },
                  { label: "Teslimat", desc: "Kurye entegrasyonu (yakında)" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
