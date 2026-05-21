import type { Metadata } from "next";
import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Destek Merkezi",
  description: "RestoPAN sık sorulan sorular, kurulum rehberi ve teknik destek bilgileri.",
  alternates: { canonical: "/destek" },
  openGraph: {
    title: "Destek Merkezi — RestoPAN",
    description: "RestoPAN sık sorulan sorular, kurulum rehberi ve teknik destek bilgileri.",
  },
};

const FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Başlarken",
    items: [
      {
        q: "Kayıt olduktan sonra ne yapmam gerekiyor?",
        a: "Kayıt olduktan sonra kısa bir kurulum sihirbazı sizi karşılar. İşletme türünü, şube adını, para birimini ve vergi oranını belirleyin. Ardından masaları ekleyip menünüzü oluşturabilirsiniz. Tüm bu adımlar dashboard anasayfasındaki rehber kartlarla da takip edilebilir.",
      },
      {
        q: "Kurulum ne kadar sürer?",
        a: "Temel kurulum (onboarding sihirbazı + menü oluşturma + masa planı) ortalama 15–30 dakika alır. İlk siparişi almaya bu sürede hazır olabilirsiniz.",
      },
      {
        q: "Deneme süresi var mı?",
        a: "Starter plan tamamen ücretsiz ve süresizdir (10 masa, 2 kullanıcı). Professional planı 14 gün boyunca ücretsiz deneyebilirsiniz; kredi kartı gerekmez.",
      },
    ],
  },
  {
    category: "POS & Siparişler",
    items: [
      {
        q: "İnternet kesilirse POS çalışmaya devam eder mi?",
        a: "Mevcut sürümde aktif internet bağlantısı gereklidir. Bağlantı kesilirse açık siparişler görüntülenebilir ancak yeni sipariş oluşturulamaz. Çevrimdışı mod geliştirme planlarımızda yer almaktadır.",
      },
      {
        q: "Birden fazla cihazdan aynı anda kullanabilir miyim?",
        a: "Evet. POS ekranı tablet, telefon ve masaüstü tarayıcıda aynı anda çalışır. Siparişler anlık olarak tüm cihazlara yansır.",
      },
      {
        q: "Fiş/adisyon yazdırabilir miyim?",
        a: "Tarayıcı yazdırma diyaloğu üzerinden herhangi bir yazıcıya fiş gönderebilirsiniz. Termal yazıcı entegrasyonu (ESC/POS) yol haritasında yer almaktadır.",
      },
    ],
  },
  {
    category: "Mutfak Ekranı (KDS)",
    items: [
      {
        q: "Mutfak ekranına hangi cihazdan erişebilirim?",
        a: "KDS, /dashboard/kds adresine giren herhangi bir tarayıcıda çalışır. Duvara monte edilmiş eski bir tablet veya televizyon yeterlidir. Tam ekran modunu öneririz.",
      },
      {
        q: "Sipariş sesli bildirim veriyor mu?",
        a: "Evet. Yeni sipariş geldiğinde tarayıcı bildirimi ve sesli uyarı tetiklenir. Bunun için tarayıcı bildirim izninin verilmiş olması gerekir.",
      },
    ],
  },
  {
    category: "Personel & Roller",
    items: [
      {
        q: "Personele nasıl davet gönderebilirim?",
        a: "Dashboard > Personel > 'Personel Davet Et' butonuna tıklayın, e-posta adresini ve rolü girin. Sistem bir davet bağlantısı oluşturur. E-posta otomatik gider; eğer ulaşmazsa bağlantıyı kopyalayıp WhatsApp ile iletebilirsiniz.",
      },
      {
        q: "Roller arasındaki fark nedir?",
        a: "Admin: tüm ayarlara erişir. Kasiyer: POS ve siparişler. Garson: sipariş alma ve masa durumu. Şef: yalnızca mutfak ekranı. Her rolün erişebildiği sayfalar farklıdır.",
      },
    ],
  },
  {
    category: "Abonelik & Ödeme",
    items: [
      {
        q: "Ödeme yöntemi olarak ne kullanılıyor?",
        a: "Abonelik ödemeleri Lemon Squeezy altyapısı üzerinden gerçekleştirilir. Kredi kartı ve banka kartı desteklenmektedir.",
      },
      {
        q: "Planımı istediğim zaman iptal edebilir miyim?",
        a: "Evet. Dashboard > Fatura menüsünden aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Kalan süre aktif kalır, ücret iadesi yapılmaz.",
      },
      {
        q: "Starter planını kullanırken verilerim silinir mi?",
        a: "Hayır. Starter plana geçiş veya devam etme durumunda verileriniz korunur. Sadece Professional özelliklere erişim kısıtlanır.",
      },
    ],
  },
  {
    category: "QR Menü & Online Sipariş",
    items: [
      {
        q: "QR kod nasıl oluşturuyorum?",
        a: "Dashboard > Masalar sayfasında her masanın QR kodunu indirebilirsiniz. QR kodu okutan müşteriler masa bazlı dijital menüye ulaşır.",
      },
      {
        q: "Müşteri kendi telefonundan sipariş verebilir mi?",
        a: "Evet. Online Sipariş modülü aktif olduğunda müşteriler QR menü üzerinden sipariş oluşturabilir. Sipariş doğrudan mutfak ekranına düşer.",
      },
    ],
  },
];

export default function DestekPage() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Destek Merkezi</h1>
        <p className="text-muted-foreground text-base mb-12 max-w-xl">
          Sık sorulan soruları aşağıda bulabilirsiniz. Cevap bulamazsanız destek ekibimizle iletişime geçin.
        </p>

        {/* FAQ Sections */}
        <div className="space-y-10 mb-16">
          {FAQS.map((section) => (
            <section key={section.category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {section.category}
              </h2>
              <div className="border rounded-xl overflow-hidden divide-y">
                {section.items.map((item) => (
                  <details key={item.q} className="group">
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium">{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 pt-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="border rounded-2xl p-8 text-center">
          <h2 className="font-semibold text-lg mb-2">Cevabını bulamadın mı?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Destek ekibimiz haftanın 6 günü size yardım etmeye hazır.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:destek@restopan.com"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              E-posta Gönder
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 border text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Tüm İletişim Kanalları
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-4">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/hakkimizda" className="hover:text-foreground">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-foreground">İletişim</Link>
            <Link href="/gizlilik" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım Koşulları</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-foreground">Mesafeli Satış</Link>
            <Link href="/iade-politikasi" className="hover:text-foreground">İade Politikası</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
