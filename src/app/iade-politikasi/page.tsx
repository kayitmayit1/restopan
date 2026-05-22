import Link from "next/link";
import type { Metadata } from "next";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "İade Politikası — RestoPAN",
  description: "RestoPAN ücretli abonelik iptali, cayma hakkı ve ödeme iadelerine ilişkin kurallar.",
  alternates: { canonical: "/iade-politikasi" },
};

export default function IadePolitikasiPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">İade Politikası</h1>
        <p className="text-muted-foreground text-sm mb-10">Son güncelleme: 10 Mayıs 2026</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Kapsam</h2>
            <p className="text-muted-foreground">
              Bu politika, RestoPAN markasıyla sunulan bulut yazılım hizmeti için ücret tahsilatını, iptal ve iade süreçlerini düzenler. Tahsilât,
              uygun ödeme kuruluşu kanalıyla yapılır. Ayrıntılı
              hukuki çerçeve{" "}
              <Link href="/mesafeli-satis-sozlesmesi" className="text-primary hover:underline">
                Mesafeli Satış Sözleşmesi
              </Link>{" "}
              ve{" "}
              <Link href="/kullanim-kosullari" className="text-primary hover:underline">
                Kullanım Koşulları
              </Link>{" "}
              ile birlikte değerlendirilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Ücretsiz (Starter) Plan</h2>
            <p className="text-muted-foreground">
              Liste fiyatı ücretsiz olan Starter planında ödeme alınmadığı için iade söz konusu değildir. İstediğiniz zaman veya yükseltme sonrasında plan değişikliği yapılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Ücretli Abonelik ve Yinelenen Ödemeler</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Ücretli planlar seçilen süre doğrultusunda (ör. aylık) otomatik yenilenebilir.</li>
              <li>Yenilenmiş veya süresi işleyen bir fatura dönemi için yapılmış ödemelerde «kısmi dönem iadesi» uygulanmaz; hak edilmiş dönemin bedeli saklıdır.</li>
              <li>İptal talebi, iptal bildirildiği tarihten itibaren ilgili sözleşme ve yazılı ön bilgilendirme koşullarına göre yürürlüğe girer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Cayma Hakkı ve Yasal Çerçeve</h2>
            <p className="text-muted-foreground mb-3">
              Tüketiciler için 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamındaki cayma hakları saklıdır.
              Dijital hizmetin, talep üzerine anında kullanılmaya başlanması ve Alıcı&apos;nın açıkça onayı ile cayma süresi dolmadan ifaya başlanması durumlarında cayma hakının sonuçları mevzuatla sınırlanabilir.
            </p>
            <p className="text-muted-foreground">
              Hizmet, hesabınızın etkinleşmesiyle beraber doğası gereği kullanıma açılmaktadır. Bu bağlamda, yasaların gerektirdiği istisnalara riayet edilir; cayma bildiriminiz olduğunda yürürlükte olan mevzuat ve banka süreleri çerçevesinde uygun ise iade değerlendirilir,
              aksi yazılı bildirilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Teknik Çift Tahsil ve Hatalı Çekim</h2>
            <p className="text-muted-foreground">
              Aynı döneme ilişkin teknik aksaklık sonucu mükerrer tahsilât tespit edilir veya yanlış tutar işlenmişse düzeltme ve iade süreci{" "}
              <a href="mailto:destek@restopan.com" className="text-primary hover:underline">destek@restopan.com</a> kanalıyla başlatılır.
              Kart ve banka süreleri ödeme kuruluşunun prosedürlerine tabidir (genelde 5–14 iş günü aralığı bildirilebilir).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Hizmete Erişilememesi (İfa Engeli)</h2>
            <p className="text-muted-foreground">
              RestoPAN kaynaklı, planlı bildirilmiş bakım süreleri haricinde hizmete makul süre boyunca sürekli olarak erişilememesi halinde,
              bildirilen mücbir veya üçüncü taraf kesintileri hariç, destek bileşeninde kayıtlı bildiriminiz doğrulanarak ücret ile orantılı veya hakkaniyet gereği telafi seçenekleri değerlendirilir.
              Somut süreç bire bir olay yazımına bağlıdır ve yazılı bildiriminizi saklarız.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. İletişim</h2>
            <p className="text-muted-foreground">
              İptal talepleri için hesap içi Ayarlar ve Fatura bölümünü veya{" "}
              <Link href="/destek" className="text-primary hover:underline">Destek</Link>{" "}
              sayfasını kullanın. İade ve cayma bildirimi için{" "}
              <a href="mailto:destek@restopan.com" className="text-primary hover:underline">destek@restopan.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/hakkimizda" className="hover:text-foreground">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-foreground">İletişim</Link>
            <Link href="/destek" className="hover:text-foreground">Destek</Link>
            <Link href="/gizlilik" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım Koşulları</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-foreground">Mesafeli Satış</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
