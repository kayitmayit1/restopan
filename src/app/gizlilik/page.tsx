import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası — RestoPAN",
};

export default function GizlilikPage() {
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
        <h1 className="text-3xl font-bold mb-2">Gizlilik Politikası</h1>
        <p className="text-muted-foreground text-sm mb-10">Son güncelleme: Nisan 2025</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Veri Sorumlusu</h2>
            <p className="text-muted-foreground">
              RestoPAN, Türkiye merkezli bir restoran yönetim yazılımıdır. Kişisel verilerin işlenmesinden sorumlu taraf, bu hizmeti
              hukukça tanınan sıfatlarıyla sürdüren <strong>bireysel işletici</strong> sıfatında veri sorumlusudur ve 6698 sayılı Kişisel Verilerin
              Korunması Kanunu (KVKK) uyarınca verilerinizi işlemektedir. Şirkete geçilmesi halinde bu bildirim güncellenir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Toplanan Kişisel Veriler</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Hesap bilgileri: ad, e-posta adresi, şifre (şifrelenmiş)</li>
              <li>İletişim bilgileri: telefon numarası (isteğe bağlı)</li>
              <li>İşletme bilgileri: restoran adı, konum, işletme türü</li>
              <li>Ödeme bilgileri: fatura adresi (ödeme aracı bilgileri iyzico tarafından saklanır)</li>
              <li>Kullanım verileri: oturum açma zamanları, sayfa görüntülemeleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Verilerin Kullanım Amacı</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Hizmetin sağlanması ve geliştirilmesi</li>
              <li>Hesap yönetimi ve kimlik doğrulama</li>
              <li>Abonelik ve fatura işlemleri</li>
              <li>Teknik destek ve iletişim</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Veri Paylaşımı</h2>
            <p className="text-muted-foreground">
              Kişisel verileriniz, hizmetin sunulması için zorunlu olan üçüncü taraf hizmet sağlayıcılarla
              (e-posta gönderimi, ödeme altyapısı, bulut altyapısı) paylaşılabilir. Bu taraflar,
              verilerinizi yalnızca belirtilen amaç doğrultusunda işlemekle yükümlüdür.
              Verileriniz pazarlama amacıyla üçüncü taraflarla paylaşılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Veri Güvenliği</h2>
            <p className="text-muted-foreground">
              Verileriniz HTTPS ile şifreli olarak iletilmekte, şifreler bcrypt ile hashlenmekte ve
              veritabanı erişimi kısıtlı sunucularda tutulmaktadır. Düzenli güvenlik güncellemeleri
              ve yedeklemeler yapılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Haklarınız (KVKK Madde 11)</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen verilere ilişkin bilgi talep etme</li>
              <li>Verilerin düzeltilmesini veya silinmesini talep etme</li>
              <li>Otomatik sistemler aracılığıyla aleyhinize sonuç doğuran kararara itiraz etme</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Talepleriniz için: <a href="mailto:destek@restopan.com" className="text-primary hover:underline">destek@restopan.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Çerezler</h2>
            <p className="text-muted-foreground">
              Yalnızca oturum yönetimi için zorunlu çerezler kullanılmaktadır. Üçüncü taraf
              izleme veya reklam çerezi kullanılmamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Değişiklikler</h2>
            <p className="text-muted-foreground">
              Bu politika güncellenebilir. Önemli değişiklikler e-posta ile bildirilecektir.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</span>
          <div className="flex gap-4">
            <Link href="/hakkimizda" className="hover:text-foreground">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-foreground">İletişim</Link>
            <Link href="/destek" className="hover:text-foreground">Destek</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım Koşulları</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-foreground">Mesafeli Satış</Link>
            <Link href="/iade-politikasi" className="hover:text-foreground">İade Politikası</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
