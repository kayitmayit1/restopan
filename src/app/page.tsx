import Link from "next/link";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import {
  ChefHat,
  ShoppingCart,
  LayoutGrid,
  Package,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Building2,
  Rocket,
  Globe,
  Calendar,
  CreditCard,
  ChevronRight,
  DollarSign,
  Clock,
  TrendingUp,
  UtensilsCrossed,
  BookOpen,
  Tag,
  Settings,
  Store,
} from "lucide-react";

const FEATURES = [
  { icon: ShoppingCart, title: "POS & Siparişler", desc: "Hızlı sipariş alma, ödeme ve fiş. Masa bazlı veya paket." },
  { icon: LayoutGrid, title: "Masa & Salon Yönetimi", desc: "Görsel kat planı, gerçek zamanlı masa durumu ve transfer." },
  { icon: ChefHat, title: "Mutfak Ekranı (KDS)", desc: "Siparişler otomatik mutfağa düşer. Hazır olunca bildirim." },
  { icon: Package, title: "Stok & Envanter", desc: "Sipariş tamamlandığında stok otomatik düşer. Kritik uyarı." },
  { icon: Calendar, title: "Rezervasyonlar", desc: "Online rezervasyon alın, onay e-postası otomatik gider." },
  { icon: Users, title: "Personel Yönetimi", desc: "Rol tabanlı erişim, vardiya takibi, e-posta ile davet." },
  { icon: BarChart3, title: "Raporlar & Analitik", desc: "Günlük ciro, en çok satan ürünler, kar marjı analizi." },
  { icon: Globe, title: "Online Sipariş", desc: "QR kod ile masadan sipariş veya paket sipariş sayfası." },
  { icon: Bell, title: "Anlık Bildirimler", desc: "Yeni sipariş ve mutfak hazır bildirimleri gerçek zamanlı." },
  { icon: CreditCard, title: "Kasa & Finans", desc: "Günlük kasa kapanışı, gider takibi, ödeme dökümü." },
];

const PLANS = [
  {
    name: "Starter",
    price: "Ücretsiz",
    sub: "Sonsuza kadar",
    icon: Zap,
    color: "text-slate-600",
    features: ["10 masa", "2 kullanıcı", "1 şube", "Temel POS & siparişler"],
    cta: "Ücretsiz Başla",
    href: "/kayit",
    highlight: false,
  },
  {
    name: "Professional",
    price: "₺999",
    sub: "/ ay",
    icon: Rocket,
    color: "text-primary",
    features: ["50 masa", "10 kullanıcı", "3 şube", "Tüm özellikler", "Online sipariş", "E-posta bildirimleri"],
    cta: "14 Gün Ücretsiz Dene",
    href: "/kayit",
    highlight: true,
    badge: "En Popüler",
  },
  {
    name: "Enterprise",
    price: "₺2.499",
    sub: "/ ay",
    icon: Building2,
    color: "text-violet-600",
    features: ["Sınırsız masa & kullanıcı", "Sınırsız şube", "Öncelikli destek", "Özel entegrasyon", "Özel eğitim"],
    cta: "Satış Ekibiyle Görüş",
    href: "mailto:satis@restopro.app",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Ahmet Kaya", role: "İşletme Sahibi · İstanbul", quote: "POS'tan mutfağa kadar her şey bağlı. Garsonlarımız artık kağıt almıyor.", stars: 5 },
  { name: "Selin Arslan", role: "Müdür · Ankara", quote: "Stok takibi sayesinde fire %30 azaldı. Raporlar da çok net.", stars: 5 },
  { name: "Murat Demir", role: "Kafe Sahibi · İzmir", quote: "Kurulum 15 dakika sürdü. Hazır menü şablonu işimi çok kolaylaştırdı.", stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <RestoPanLogo iconSize={40} />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a>
            <a href="#fiyatlar" className="hover:text-foreground transition-colors">Fiyatlar</a>
            <a href="#yorumlar" className="hover:text-foreground transition-colors">Yorumlar</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              Ücretsiz Başla
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3 h-3" />
          14 gün ücretsiz — kredi kartı gerekmez
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08] mb-6">
          Restoranınızı{" "}
          <span className="text-primary">tek platformdan</span>
          <br />yönetin
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          POS, masa planı, mutfak ekranı, stok, personel ve raporlar — hepsi bir arada.
          Kurulum 15 dakika, öğrenmesi 1 gün.
        </p>

        <p className="mt-4 text-xs text-muted-foreground">
          500+ restoran tarafından kullanılıyor · Türkiye&apos;de geliştirildi
        </p>
      </section>

      <section id="yorumlar" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Müşterilerimiz ne diyor?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  &quot;{t.quote}&quot;
                </p>

                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}