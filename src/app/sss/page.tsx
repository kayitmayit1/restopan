import type { Metadata } from "next";
import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description: "RestoPAN hakkında en çok sorulan sorular ve cevapları. Fiyatlandırma, kurulum, destek ve veri güvenliği hakkında bilgi alın.",
  alternates: { canonical: "/sss" },
  openGraph: {
    title: "Sık Sorulan Sorular — RestoPAN",
    description: "RestoPAN hakkında en çok sorulan sorular ve cevapları.",
  },
};

const FAQS = [
  {
    category: "Fiyatlandırma & Plan",
    items: [
      {
        q: "Starter plan gerçekten sonsuza kadar ücretsiz mi?",
        a: "Evet. Starter plan herhangi bir süre kısıtlaması olmaksızın tamamen ücretsizdir. Kredi kartı bilgisi, deneme süresi veya otomatik ücretlendirme söz konusu değildir.",
      },
      {
        q: "Professional planı 14 günlük deneme sonrasında ne olur?",
        a: "14 günlük deneme süresinin ardından Professional plan özellikleri askıya alınır ve hesabınız Starter plana geçer. Verileriniz silinmez. Dilediğiniz zaman Professional plana abone olarak kaldığınız yerden devam edebilirsiniz.",
      },
      {
        q: "Planımı istediğim zaman değiştirebilir miyim?",
        a: "Evet. Starter'dan Professional'a yükseltme veya Professional'dan Starter'a geçiş her zaman yapılabilir. Plan değişikliği anlık olarak uygulanır.",
      },
      {
        q: "Professional plan faturası nasıl kesilir?",
        a: "Professional plan aylık ₺799 olarak faturalandırılır. Ödeme iyzico altyapısı üzerinden güvenli şekilde gerçekleştirilir. Fatura her ay otomatik olarak e-posta adresinize iletilir.",
      },
    ],
  },
  {
    category: "Kurulum & Kullanım",
    items: [
      {
        q: "Kurulum ne kadar sürer?",
        a: "Hesap oluşturma ve temel yapılandırma ortalama 15 dakika içinde tamamlanır. Menü tanımları ve masa planı gibi işletmeye özgü ayarlar kullanıcıya göre değişmekle birlikte çoğu işletme ilk günün sonunda sistemi aktif olarak kullanmaya başlamaktadır.",
      },
      {
        q: "Teknik bilgi veya yazılım deneyimi gerekiyor mu?",
        a: "Hayır. RestoPAN, teknik ön bilgi gerektirmeden kullanılabilecek şekilde tasarlanmıştır. Yönlendirmeli kurulum sihirbazı ve sezgisel arayüz sayesinde tüm modüller kolayca yapılandırılabilir.",
      },
      {
        q: "Mevcut POS sistemimden veri aktarımı yapabilir miyim?",
        a: "Menü ve ürün listeleri Excel/CSV formatında toplu olarak içe aktarılabilir. Tarihsel sipariş verilerinin aktarımı için destek ekibimizle iletişime geçebilirsiniz.",
      },
      {
        q: "İnternet bağlantısı olmadan çalışır mı?",
        a: "RestoPAN bulut tabanlı bir platformdur ve internet bağlantısı gerektirir. Kısa süreli bağlantı kesintilerinde mevcut ekran içerikleri görüntülenmeye devam eder; ancak yeni sipariş ve veri girişi için bağlantı gerekmektedir.",
      },
    ],
  },
  {
    category: "Kullanıcı & Şube Yönetimi",
    items: [
      {
        q: "Kaç kullanıcı ekleyebilirim?",
        a: "Starter planda 2, Professional planda 10 kullanıcı eklenebilir. Her kullanıcıya rol tabanlı erişim izni atanır: Sahip, Yönetici, Kasiyer, Garson veya Mutfak Personeli.",
      },
      {
        q: "Birden fazla şube yönetebilir miyim?",
        a: "Starter planda 1, Professional planda 3 şube tanımlanabilir. Sınırsız şube ve özel kurumsal gereksinimler için Enterprise planı hakkında satış ekibimizle görüşebilirsiniz.",
      },
      {
        q: "Personeli sisteme nasıl davet edebilirim?",
        a: "Personel Yönetimi ekranından e-posta adresi girilerek davet gönderilebilir. Davet edilen personel, e-postasındaki bağlantı üzerinden şifresini belirleyerek sisteme dahil olur.",
      },
    ],
  },
  {
    category: "Güvenlik & Veri",
    items: [
      {
        q: "Verilerim güvende mi?",
        a: "Tüm veriler Türkiye'de barındırılan, KVKK uyumlu sunucularda işlenir ve saklanır. Şifreler bcrypt algoritmasıyla hashlenir, tüm bağlantılar HTTPS protokolüyle şifrelenir. Rol tabanlı erişim kontrolü sayesinde her kullanıcı yalnızca yetkili olduğu alanlara erişebilir.",
      },
      {
        q: "Hesabımı kapattığımda verilerime ne olur?",
        a: "Hesap kapatma talebinin ardından verileriniz 30 gün süreyle saklanır. Bu süre içinde destek ekibimizden verilerinizin dışa aktarımını talep edebilirsiniz. 30 günün sonunda tüm veriler kalıcı olarak silinir.",
      },
    ],
  },
  {
    category: "Destek",
    items: [
      {
        q: "Teknik destek nasıl alınır?",
        a: "Starter planda e-posta desteği (1 iş günü yanıt süresi) sunulmaktadır. Professional planda WhatsApp üzerinden 09:00–22:00 saatleri arasında 1 saat içinde yanıt garantisi verilmektedir. Enterprise plan sahiplerine telefon ve yerinde destek hizmeti sağlanmaktadır.",
      },
      {
        q: "Sorun bildirimi için ne yapmalıyım?",
        a: "destek@restopan.com adresine e-posta göndererek veya Destek sayfasındaki formu doldurarak talep oluşturabilirsiniz. Acil durumlar için Professional ve Enterprise plan sahipleri WhatsApp hattımıza doğrudan ulaşabilir.",
      },
    ],
  },
];

export default function SSSPage() {
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Sık Sorulan Sorular</h1>
          <p className="text-muted-foreground text-base">
            Aradığınız yanıtı bulamazsanız{" "}
            <Link href="/destek" className="text-primary hover:underline">destek ekibimize</Link>{" "}
            ulaşabilirsiniz.
          </p>
        </div>

        <div className="space-y-10">
          {FAQS.map((section) => (
            <section key={section.category}>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                {section.category}
              </h2>
              <div className="divide-y border rounded-xl overflow-hidden">
                {section.items.map((item) => (
                  <details key={item.q} className="group px-5 py-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                      <span className="font-medium text-sm text-gray-900">{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 bg-orange-50 rounded-2xl p-8 text-center">
          <h2 className="font-semibold mb-2">Başka sorunuz mu var?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Destek ekibimiz hafta içi ve hafta sonu 09:00–22:00 saatleri arasında hizmetinizdedir.
          </p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Bize Ulaşın
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 mt-4">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/iletisim" className="hover:text-foreground">İletişim</Link>
            <Link href="/destek" className="hover:text-foreground">Destek</Link>
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
