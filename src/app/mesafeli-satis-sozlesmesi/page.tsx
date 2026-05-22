import Link from "next/link";
import type { Metadata } from "next";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import { ArrowLeft } from "lucide-react";
import { publicAppUrl } from "@/lib/public-app-url";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — RestoPAN",
  description:
    "RestoPAN yazılım hizmeti için mesafeli satış (ön bilgilendirme ve sözleşme metni).",
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
};

const SITE = publicAppUrl();

export default function MesafeliSatisPage() {
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
        <h1 className="text-3xl font-bold mb-2">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-muted-foreground text-sm mb-10">Son güncelleme: 10 Mayıs 2026</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">Ön Bilgilendirme — Genel</h2>
            <p className="text-muted-foreground">
              İşbu metin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde,
              RestoPAN markasıyla sunulan yazılım hizmeti (SaaS) aboneliklerine ilişkin ön bilgilendirme ile mesafeli sözleşmeyi
              düzenlemek amacıyla hazırlanmıştır. Ödeme ve abonelik siparişi tamamlamadan önce bu metnin
              okunması ve onaylanması gerekmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Satıcı (Hizmet Sağlayıcı — Bireysel)</h2>
            <ul className="list-none text-muted-foreground space-y-1.5 pl-0">
              <li>
                <span className="text-foreground font-medium">Nitelik:</span> Tacir sıfatına dayalı tüzel kişi («şirket») sıfatı yoktur;
                yazılım hizmeti gerçek kişi sıfatında <strong>bireysel işletici</strong> tarafından sunulur.
              </li>
              <li>
                <span className="text-foreground font-medium">Marka:</span> RestoPAN (hizmetin ticari görünüm adıdır)
              </li>
              <li>
                <span className="text-foreground font-medium">İnternet Adresi:</span>{" "}
                <a href={SITE} className="text-primary hover:underline">
                  {SITE}
                </a>
              </li>
              <li>
                <span className="text-foreground font-medium">İletişim:</span>{" "}
                <a href="mailto:destek@restopan.com" className="text-primary hover:underline">
                  destek@restopan.com
                </a>
                ,{" "}
                <a href="mailto:satis@restopan.com" className="text-primary hover:underline">
                  satis@restopan.com
                </a>
              </li>
              <li>
                <span className="text-foreground font-medium">Kimlik ve iletişim:</span> İşleticinin{" "}
                <strong>T.C. kimlik numarası</strong>, bildirilmiş ikamet / iş adresi ve yürürlükteki mevzuat gereği gereken diğer
                iletişim bilgileri; gerektiğinde düzenlenecek belgelerde
                ve yazılı talebiniz doğrultusunda <a href="mailto:destek@restopan.com" className="text-primary hover:underline">destek@restopan.com</a> kanalıyla paylaşılır veya bildirilir. İleride tüzel kişiye geçilmesi halinde bu madde uygun şekilde güncellenir.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Alıcı</h2>
            <p className="text-muted-foreground">
              İşbu sözleşmede «Alıcı», RestoPAN hizmetini sipariş eden taraf olup sıklıkla bir işletmeyi temsil eden gerçek veya tüzel kişiyi
              (veya bireysel kullanıcıyı) ifade eder. Kayıtta ve ödemede verilen iletişim ile fatura bilgilerinin doğru ve güncel olması Alıcı&apos;nın sorumluluğundadır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Sözleşmenin Konusu ve Nitelik</h2>
            <p className="text-muted-foreground">
              Mesafeli sözleşmenin konusu; seçilen pakete uygun olarak, bulut üzerinden erişilen RestoPAN yazılım hizmetinin
              süreli olarak sunulması, teknik olarak mümkün olan ölçüde yazılımda yayınlanan güncelleme ve belirlenen süre ile
              sınırlı destek haklarıdır. Hizmetin esaslı nitelikleri; web sitesinde, ücretlendirme sayfasında ve hesap içi materyalde açıklanır.
              Hizmet, fiziksel mal teslimi değildir; dijital içerik / SaaS olarak ifa edilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Toplam Fiyat ve Ödeme</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>İlan edilen liste fiyatı KDV dahil veya ayrı olarak ödeme ekranında belirlenir.</li>
              <li>Ödemeler güvenli ödeme altyapısı üzerinden alınır.</li>
              <li>Aboneliklerde seçilen paket ve döneme göre yinelenen ücret bakiyesi açıkça gösterilir.</li>
              <li>Hizmete erişim, ödemenin onaylanması ve hesabın etkinleşmesinden itibaren sağlanır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Siparişin Kurulması</h2>
            <p className="text-muted-foreground">
              Alıcı, paketi seçtikten sonra ödeme ve onay sürecini tamamladığı anda mesafeli sözleşme kurulmuş sayılır.
              Siparişe ilişkin elektronik kayıt oluşturulur; gerektiğinde e-posta veya sistem içi bildirimlerle doğrulanır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Cayma Hakkı</h2>
            <p className="text-muted-foreground mb-3">
              6502 sayılı Kanunun ve Mesafeli Sözleşmeler Yönetmeliğinin cayma ve istisnalara ilişkin hükümleri saklıdır.
              Kişisel kullanıma yönelik dijital hizmetin, Alıcı&apos;nın açık talebi doğrultusunda ve cayma süresinden önce başlatılması halinde cayma hakkı,
              düzenlemenin özü gereği kullanılmış dönemin ifası ile bağlı olarak sınırlanabilir. RestoPAN hizmeti, kayıt ve ödeme onayıyla
              anında kullanılmaya uygun şekilde açılmakta olduğundan, ilgili mevzuatın izin verdiği ölçüde caymanın kullanılmış kısımlara uygulanmaması
              ve kampanya / paket özelliklerine uygun olarak iade süreçleri <Link href="/iade-politikasi" className="text-primary hover:underline">İade Politikası</Link> ile belirlenir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Teknik Erişim ve Destek</h2>
            <p className="text-muted-foreground">
              Erişimin sağlıklı yapılabilmesi için güncel tarayıcı ve internet bağlantısı Alıcı&apos;nın yükümlülüğündedir.
              Plan kapsamındaki destek kanalları <Link href="/destek" className="text-primary hover:underline">Destek</Link> üzerinden duyurulur.
              Planlı kesintiler önceden duyuru ile yapılır; öngörülemeyen durumlar için yürürlükteki mevzuat ve{" "}
              <Link href="/kullanim-kosullari" className="text-primary hover:underline">Kullanım Koşulları</Link> çerçevesi geçerlidir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Uyuşmazlıkların Çözümü</h2>
            <p className="text-muted-foreground">
              Uyuşmazlıklarda öncelikle müzakere ile çözüm aranır. Tüketici sıfatına sahip olan Alıcı için 6502 sayılı Kanunun ilgili hükümleri saklıdır;
              dava değerine ve mevzuata göre yetkili tüketici hakem heyeti ile tüketici mahkemelerine başvurulabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Ek Metinler</h2>
            <p className="text-muted-foreground">
              <Link href="/gizlilik" className="text-primary hover:underline">Gizlilik Politikası</Link>,{" "}
              <Link href="/kullanim-kosullari" className="text-primary hover:underline">Kullanım Koşulları</Link>{" "}
              ve <Link href="/iade-politikasi" className="text-primary hover:underline">İade Politikası</Link> işbu sözleşmenin ayrılmaz tamamlayıcısı niteliğindedir (çelişki halinde tüketiciye daha avantajlı olan hüküm uygulanır).
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
            <Link href="/iade-politikasi" className="hover:text-foreground">İade Politikası</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
