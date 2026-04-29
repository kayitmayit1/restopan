import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kullanım Koşulları — RestoPAN",
};

export default function KullanimKosullariPage() {
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
        <h1 className="text-3xl font-bold mb-2">Kullanım Koşulları</h1>
        <p className="text-muted-foreground text-sm mb-10">Son güncelleme: Nisan 2025</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Hizmet</h2>
            <p className="text-muted-foreground">
              RestoPAN, restoran ve kafe işletmelerine yönelik bir yönetim yazılımı hizmetidir.
              Hizmeti kullanarak bu koşulları kabul etmiş sayılırsınız.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Hesap</h2>
            <p className="text-muted-foreground">
              Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın.
              Yetkisiz erişim tespitinde derhal destek ekibimizle iletişime geçin.
              Hesap başına birden fazla organizasyon oluşturulabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Abonelik ve Ödeme</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Ücretsiz plan sonsuza kadar ücretsiz kalır, plan limitleri geçerlidir.</li>
              <li>Ücretli planlar aylık olarak iyzico üzerinden tahsil edilir.</li>
              <li>İptal, mevcut dönem sonunda geçerli olur. Kısmi iade yapılmaz.</li>
              <li>Fiyat değişiklikleri 30 gün öncesinden bildirilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Veriler</h2>
            <p className="text-muted-foreground">
              Platforma yüklediğiniz menü, sipariş ve müşteri verileri size aittir. Hesabı sildiğinizde
              tüm veriler 30 gün içinde kalıcı olarak silinir. Bu süre zarfında dışa aktarma
              talep edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Kabul Edilemez Kullanım</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Sisteme yetkisiz erişim denemesi</li>
              <li>Başka kullanıcıların verilerine erişim girişimi</li>
              <li>Hizmetin yeniden satışı veya kiralanması</li>
              <li>Yasal dışı içerik paylaşımı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Hizmet Sürekliliği</h2>
            <p className="text-muted-foreground">
              %99.5 uptime hedeflenmektedir. Planlı bakım öncesinde bildirim yapılır.
              Öngörülemeyen kesintiler için sorumluluk sınırı, o aya ait abonelik ücretiyle sınırlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Değişiklikler ve Fesih</h2>
            <p className="text-muted-foreground">
              Koşullar güncellenebilir; önemli değişiklikler e-posta ile bildirilir.
              Kural ihlali tespitinde hesabınız askıya alınabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. İletişim</h2>
            <p className="text-muted-foreground">
              Sorularınız için: <a href="mailto:destek@restopan.com" className="text-primary hover:underline">destek@restopan.com</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır. ·{" "}
          <Link href="/gizlilik" className="hover:text-foreground">Gizlilik Politikası</Link>
        </div>
      </footer>
    </div>
  );
}
