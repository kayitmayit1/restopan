import type { Metadata } from "next";
import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft, Code2, Heart, Rocket, Shield, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "RestoPAN, Türkiye'deki restoranların dijital dönüşümünü kolaylaştırmak için geliştirilmiş yerli bir SaaS ürünüdür.",
  alternates: { canonical: "/hakkimizda" },
  openGraph: {
    title: "Hakkımızda — RestoPAN",
    description: "RestoPAN, Türkiye'deki restoranların dijital dönüşümünü kolaylaştırmak için geliştirilmiş yerli bir SaaS ürünüdür.",
  },
};

const VALUES = [
  {
    icon: Heart,
    title: "Sektörü Bilerek Yapıyoruz",
    desc: "Restoran ortamının hızını, stresini ve gereksinimlerini bilerek tasarladık. Her ekran, gerçek kullanım senaryoları gözetilerek kurgulandı.",
  },
  {
    icon: Zap,
    title: "Basitlik İlke",
    desc: "İşletme sahibinin yazılımcı olmasına gerek yok. Kurulum 15 dakika, öğrenme eğrisi sıfıra yakın.",
  },
  {
    icon: Shield,
    title: "Veri Güvenliği",
    desc: "Tüm veriler Türkiye'de KVKK uyumlu sunucularda tutulur. Şifreler bcrypt ile hashlenir, bağlantılar HTTPS ile şifrelenir.",
  },
  {
    icon: Globe,
    title: "Türkiye'ye Özel",
    desc: "TRY para birimi, %10/%20 KDV desteği, KVKK, Türkçe arayüz ve Türkiye saati — uluslararası araçlarda olmayan detaylar.",
  },
];

const STACK = [
  { label: "Arayüz", value: "Next.js 16 + TypeScript + Tailwind CSS" },
  { label: "Veritabanı", value: "PostgreSQL + Prisma ORM" },
  { label: "Kimlik Doğrulama", value: "NextAuth v5 (JWT)" },
  { label: "E-posta", value: "Resend" },
  { label: "Ödeme", value: "iyzico" },
  { label: "Altyapı", value: "Vercel / Railway" },
];

export default function HakkimizdaPage() {
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
        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Code2 className="w-3.5 h-3.5" /> Yerli Yazılım
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Restoranlar için<br className="hidden sm:block" /> yaptık, seviniz.
          </h1>
          <p className="text-muted-foreground leading-relaxed text-base max-w-xl">
            RestoPAN, Türkiye'deki kafe ve restoranların sipariş, mutfak, stok ve personel
            süreçlerini tek bir ekranda yönetebilmesi için geliştirilmiş yerli bir SaaS platformudur.
          </p>
        </div>

        {/* Values */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold mb-6">Değerlerimiz</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <v.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">{v.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold mb-2">Teknoloji Altyapısı</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Açık kaynak bileşenler ve modern web teknolojileri üzerine inşa edildi.
          </p>
          <div className="border rounded-xl overflow-hidden divide-y text-sm">
            {STACK.map((s) => (
              <div key={s.label} className="flex items-center px-5 py-3 gap-4">
                <span className="w-36 text-muted-foreground shrink-0">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-14 bg-orange-50 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Misyon</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Küçük ve orta ölçekli restoranların, büyük zincirlerin kullandığı profesyonel
            yazılımlara erişebilmesini sağlamak. Kompleks kurulum gerektirmeyen, makul fiyatlı
            ve Türkiye koşullarına uygun bir çözüm sunmak.
          </p>
        </section>

        {/* Contact block */}
        <section>
          <h2 className="text-xl font-semibold mb-4">İletişim</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Genel:{" "}
              <a href="mailto:merhaba@restopan.com" className="text-primary hover:underline">
                merhaba@restopan.com
              </a>
            </p>
            <p>
              Destek:{" "}
              <a href="mailto:destek@restopan.com" className="text-primary hover:underline">
                destek@restopan.com
              </a>
            </p>
            <p>
              Satış &amp; Kurumsal:{" "}
              <a href="mailto:satis@restopan.com" className="text-primary hover:underline">
                satis@restopan.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-4">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/iletisim" className="hover:text-foreground">İletişim</Link>
            <Link href="/destek" className="hover:text-foreground">Destek</Link>
            <Link href="/gizlilik" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
