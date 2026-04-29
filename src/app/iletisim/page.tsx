import type { Metadata } from "next";
import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft, Mail, MessageSquare, Clock, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim",
  description: "RestoPAN destek ve satış ekibiyle iletişime geçin. Sorularınızı e-posta veya WhatsApp üzerinden iletebilirsiniz.",
  alternates: { canonical: "/iletisim" },
  openGraph: {
    title: "İletişim — RestoPAN",
    description: "RestoPAN destek ve satış ekibiyle iletişime geçin.",
  },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "E-posta Destek",
    desc: "Tüm planlar için e-posta desteği sunuyoruz.",
    detail: "destek@restopan.com",
    href: "mailto:destek@restopan.com",
    badge: "1 iş günü yanıt",
    badgeColor: "bg-slate-100 text-slate-600",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Destek",
    desc: "Professional ve Enterprise kullanıcılara hızlı destek.",
    detail: "+90 (xxx) xxx xx xx",
    href: "https://wa.me/90",
    badge: "≤1 saat yanıt (09–22)",
    badgeColor: "bg-green-50 text-green-700",
  },
  {
    icon: Building2,
    title: "Satış & Kurumsal",
    desc: "Enterprise teklif, toplu lisans ve entegrasyon görüşmeleri.",
    detail: "satis@restopan.com",
    href: "mailto:satis@restopan.com",
    badge: "1 iş günü yanıt",
    badgeColor: "bg-violet-50 text-violet-700",
  },
];

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <RestoPanLogo iconSize={36} />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold tracking-tight mb-3">İletişim</h1>
        <p className="text-muted-foreground mb-12 text-base max-w-xl">
          Soru, öneri veya teknik destek için aşağıdaki kanallardan bize ulaşabilirsiniz.
        </p>

        {/* Channels */}
        <div className="space-y-4 mb-14">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="flex items-start gap-4 border rounded-xl p-5 hover:border-primary/40 hover:bg-orange-50/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="font-semibold text-sm">{c.title}</h2>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{c.desc}</p>
                <p className="text-sm font-medium text-primary group-hover:underline">{c.detail}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Business hours */}
        <section className="border rounded-xl p-6 mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Destek Saatleri</h2>
          </div>
          <div className="text-sm space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>Pazartesi – Cuma</span>
              <span className="font-medium text-foreground">09:00 – 22:00</span>
            </div>
            <div className="flex justify-between">
              <span>Cumartesi</span>
              <span className="font-medium text-foreground">10:00 – 18:00</span>
            </div>
            <div className="flex justify-between">
              <span>Pazar</span>
              <span className="font-medium text-foreground">Sadece e-posta</span>
            </div>
            <p className="text-xs pt-2 border-t mt-3">
              * Enterprise müşterilere mesai dışı acil hat sağlanır. Detay için satış ekibimizle görüşün.
            </p>
          </div>
        </section>

        {/* FAQ shortcut */}
        <div className="bg-orange-50 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Sık sorulan sorular</h3>
            <p className="text-sm text-muted-foreground">Cevabını hemen bulabilirsin.</p>
          </div>
          <Link
            href="/destek"
            className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Destek Merkezi
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 mt-4">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/hakkimizda" className="hover:text-foreground">Hakkımızda</Link>
            <Link href="/destek" className="hover:text-foreground">Destek</Link>
            <Link href="/gizlilik" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
