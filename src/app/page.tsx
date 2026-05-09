import Link from "next/link";
import { auth } from "@/lib/auth";
import { publicAppUrl } from "@/lib/public-app-url";
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
  TrendingDown,
  Utensils,
  Coffee,
  Circle,
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
    sub: " / süresiz",
    icon: Zap,
    color: "text-slate-600",
    features: [
      "10 masa, 2 kullanıcı, 1 şube",
      "Temel POS & siparişler",
      "Görsellli dijital QR menü",
      "Günün menüsü duyuru bandı",
      "Wi-Fi şifresi & sosyal medya menüde",
      "E-posta destek (1 iş günü)",
    ],
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
    features: [
      "50 masa, 10 kullanıcı, 3 şube",
      "Starter'daki tüm özellikler",
      "Garson çağır & hesap iste",
      "Online & paket sipariş sayfası",
      "Stok & envanter yönetimi",
      "Gelişmiş raporlar & analitik",
      "Kampanyalar & müşteri yönetimi",
      "WhatsApp destek — 1 saat yanıt (09:00–22:00)",
    ],
    cta: "14 Gün Ücretsiz Dene",
    href: "/kayit/pro",
    buyHref: "/kayit?plan=pro&mode=buy",
    highlight: true,
    badge: "En Popüler",
  },
  {
    name: "Enterprise",
    price: "Size özel",
    sub: "",
    icon: Building2,
    color: "text-violet-600",
    features: [
      "Sınırsız masa, kullanıcı & şube",
      "Professional'daki tüm özellikler",
      "Özel entegrasyon & API erişimi",
      "WhatsApp/telefon — 30 dk yanıt (09:00–22:00)",
      "Sistem kesintisinde mesai dışı bildirim",
      "Yerinde kurulum & eğitim",
    ],
    cta: "Fiyat Teklifi Alın",
    href: "mailto:satis@restopan.com",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Hilmi Kırgız", role: "İşletme Sahibi · İstanbul", quote: "POS'tan mutfağa kadar her şey bağlı, garsonlarımız artık kağıt almıyor teknolojiye adapte olduk memnunuz. ", stars: 5 },
  { name: "Serdar Keskin", role: "Müdür · Ankara", quote: "Stok takibi sayesinde fire %30 kadar azaldı, raporlar da çok net takip etmesi kolay", stars: 5 },
  { name: "Mevlüt Toraman", role: "Kafe Sahibi · İzmir", quote: "Kurulum kısa sürdü zaten yönlendiriyor sistem, hazır menü şablonu işimi çok kolaylaştırdı kendi ürünlerimi hazır menü şablonuna ekledim", stars: 5 },
];

export default async function LandingPage() {
  const session = await auth();
  const authHref = session ? "/dashboard" : "/giris";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RestoPAN",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: "Türkiye'nin restoran yönetim yazılımı. POS, masa planı, mutfak ekranı, stok, personel ve QR menü.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "TRY", name: "Starter" },
      { "@type": "Offer", price: "999", priceCurrency: "TRY", name: "Professional" },
    ],
    url: publicAppUrl(),
    inLanguage: "tr",
    author: { "@type": "Organization", name: "RestoPAN", url: publicAppUrl() },
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <RestoPanLogo iconSize={40} />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a>
            <a href="#fiyatlar" className="hover:text-foreground transition-colors">Fiyatlar</a>
            <a href="#yorumlar" className="hover:text-foreground transition-colors">Yorumlar</a>
            <Link href="/sss" className="hover:text-foreground transition-colors">SSS</Link>
            <Link href="/hakkimizda" className="hover:text-foreground transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-foreground transition-colors">İletişim</Link>
            <Link href="/destek" className="hover:text-foreground transition-colors">Destek</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={authHref} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
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
          Starter plan tamamen ücretsiz
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/kayit" className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
            Ücretsiz Başla <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={authHref} className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Giriş Yap
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Türkiye&apos;de geliştirildi · Türk restoranları için tasarlandı
        </p>
      </section>

      {/* App Preview */}
      <section className="pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Browser chrome */}
          <div className="relative rounded-2xl shadow-2xl shadow-primary/10 border border-gray-200 bg-white overflow-hidden">
            {/* Browser top bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-lg px-4 py-1 text-xs text-gray-400 border border-gray-200 min-w-[200px] text-center">
                  app.restopan.com/dashboard
                </div>
              </div>
            </div>

            {/* App UI */}
            <div className="flex h-[360px] md:h-[480px] overflow-hidden select-none">

              {/* Sidebar */}
              <aside className="hidden md:flex w-52 bg-gray-950 flex-shrink-0 flex-col py-4 px-3 gap-1">
                {/* Logo */}
                <div className="flex items-center gap-2 px-2 pb-4 mb-1 border-b border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white font-bold text-sm">RestoPAN</span>
                </div>
                {[
                  { icon: BarChart3, label: "Dashboard", active: true },
                  { icon: ShoppingCart, label: "POS", active: false },
                  { icon: LayoutGrid, label: "Masalar", active: false },
                  { icon: ChefHat, label: "Mutfak", active: false },
                  { icon: UtensilsCrossed, label: "Menü", active: false },
                  { icon: Package, label: "Envanter", active: false },
                  { icon: Users, label: "Personel", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.label}
                  </div>
                ))}
              </aside>

              {/* Main content */}
              <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col">

                {/* Topbar */}
                <div className="bg-white border-b px-5 py-3 flex items-center justify-between flex-shrink-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Dashboard</p>
                    <p className="text-xs text-gray-400">Bugün, Salı 29 Nisan</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">A</div>
                  </div>
                </div>

                <div className="flex-1 p-3 md:p-4 overflow-hidden flex flex-col gap-2 md:gap-3">

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { label: "Bugünkü Ciro", value: "₺8.240", change: "+12%", up: true, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Toplam Sipariş", value: "47", change: "+8%", up: true, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Aktif Sipariş", value: "6", change: null, up: null, color: "text-orange-600", bg: "bg-orange-50" },
                      { label: "Masa Doluluk", value: "8/12", change: null, up: null, color: "text-violet-600", bg: "bg-violet-50", extra: "%67" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-medium mb-1">{s.label}</p>
                        <p className="text-base font-bold text-gray-900">{s.value}</p>
                        {s.change && (
                          <div className={`flex items-center gap-0.5 text-[10px] font-medium mt-0.5 ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                            {s.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {s.change} dünden
                          </div>
                        )}
                        {s.extra && <p className="text-[10px] text-gray-400 mt-0.5">{s.extra} dolu</p>}
                      </div>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="flex gap-2.5 flex-1 min-h-0">

                    {/* Revenue chart mock */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-800">Haftalık Ciro</p>
                        <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">+18% bu hafta</span>
                      </div>
                      {/* Fake bar chart */}
                      <div className="flex-1 flex items-end gap-1.5 px-1">
                        {[
                          { day: "Pzt", h: 45, prev: 38 },
                          { day: "Sal", h: 62, prev: 55 },
                          { day: "Çar", h: 38, prev: 42 },
                          { day: "Per", h: 71, prev: 60 },
                          { day: "Cum", h: 85, prev: 70 },
                          { day: "Cmt", h: 92, prev: 80 },
                          { day: "Paz", h: 78, prev: 65 },
                        ].map((bar) => (
                          <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end gap-0.5" style={{ height: 80 }}>
                              <div
                                className="flex-1 rounded-t-sm bg-gray-100"
                                style={{ height: `${bar.prev}%` }}
                              />
                              <div
                                className="flex-1 rounded-t-sm bg-primary"
                                style={{ height: `${bar.h}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-gray-400">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live tables */}
                    <div className="hidden md:flex w-44 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex-col">
                      <p className="text-xs font-semibold text-gray-800 mb-2">Canlı Masalar</p>
                      <div className="grid grid-cols-3 gap-1.5 flex-1">
                        {[
                          { n: "M1", s: "occ" }, { n: "M2", s: "occ" }, { n: "M3", s: "free" },
                          { n: "M4", s: "occ" }, { n: "M5", s: "res" }, { n: "M6", s: "free" },
                          { n: "M7", s: "occ" }, { n: "M8", s: "occ" }, { n: "M9", s: "free" },
                          { n: "T1", s: "occ" }, { n: "T2", s: "free" }, { n: "T3", s: "res" },
                        ].map((t) => (
                          <div
                            key={t.n}
                            className={`rounded-lg flex items-center justify-center text-[10px] font-bold h-8 ${
                              t.s === "occ" ? "bg-primary/10 text-primary" :
                              t.s === "res" ? "bg-amber-50 text-amber-600" :
                              "bg-gray-50 text-gray-300 border border-dashed border-gray-200"
                            }`}
                          >
                            {t.n}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        {[["bg-primary/10 border-primary/30", "Dolu"], ["bg-amber-50 border-amber-200", "Rezerve"], ["bg-gray-50 border-dashed border-gray-200", "Boş"]].map(([cls, lbl]) => (
                          <div key={lbl} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-sm border ${cls}`} />
                            <span className="text-[9px] text-gray-400">{lbl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent orders */}
                    <div className="hidden md:flex w-48 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex-col">
                      <p className="text-xs font-semibold text-gray-800 mb-2">Son Siparişler</p>
                      <div className="space-y-1.5 flex-1">
                        {[
                          { table: "Masa 4", items: "Köfte, Ayran", status: "READY", amount: "₺185" },
                          { table: "Masa 7", items: "Pizza, Kola", status: "PREPARING", amount: "₺220" },
                          { table: "Masa 2", items: "Burger ×2", status: "PENDING", amount: "₺310" },
                          { table: "Paket", items: "Tavuk Döner", status: "READY", amount: "₺95" },
                        ].map((o, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-2.5 h-2.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-800 truncate">{o.table}</p>
                              <p className="text-[9px] text-gray-400 truncate">{o.items}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`block text-[9px] font-bold px-1 py-0.5 rounded ${
                                o.status === "READY" ? "bg-emerald-50 text-emerald-600" :
                                o.status === "PREPARING" ? "bg-amber-50 text-amber-600" :
                                "bg-blue-50 text-blue-600"
                              }`}>
                                {o.status === "READY" ? "Hazır" : o.status === "PREPARING" ? "Yapılıyor" : "Yeni"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* Floating feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: ShoppingCart, text: "POS & Sipariş" },
              { icon: ChefHat, text: "Mutfak Ekranı" },
              { icon: BarChart3, text: "Gerçek Zamanlı Analitik" },
              { icon: Globe, text: "QR Menü" },
              { icon: Package, text: "Stok Takibi" },
              { icon: Bell, text: "Anlık Bildirim" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                <b.icon className="w-3.5 h-3.5 text-primary" />
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Her şey bir arada</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Restoranınızı yönetmek için ihtiyacınız olan tüm araçlar tek platformda.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "Türkiye", label: "Yerli & Milli Yazılım" },
            { value: "15 dk", label: "Ortalama Kurulum" },
            { value: "09–22", label: "Destek Saatleri" },
            { value: "≤1 saat", label: "Yanıt Süresi" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

  
      {/* Pricing */}
      <section id="fiyatlar" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Şeffaf fiyatlandırma</h2>
            <p className="text-muted-foreground">Starter sonsuza kadar ücretsiz. Professional için 14 gün ücretsiz deneme.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 border ${plan.highlight ? "border-primary shadow-lg shadow-primary/10 bg-white relative" : "border-gray-200 bg-white"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                  <span className="font-bold text-lg">{plan.name}</span>
                </div>
                <div className="mb-6">
                  <span className={plan.price === "Size özel" ? "text-2xl font-bold text-violet-600" : "text-3xl font-bold"}>{plan.price}</span>
                  {plan.sub && <span className="text-muted-foreground text-sm ml-1">{plan.sub}</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.buyHref ? (
                  <div className="space-y-2">
                    <Link
                      href={plan.href}
                      className="block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors bg-primary text-white hover:bg-primary/90"
                    >
                      {plan.cta}
                    </Link>
                    <Link
                      href={plan.buyHref}
                      className="block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors border border-primary/25 text-primary hover:bg-primary/5"
                    >
                      Satın Al
                    </Link>
                  </div>
                ) : plan.href.startsWith("mailto:") ? (
                  <a
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-200 hover:bg-gray-50"}`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-200 hover:bg-gray-50"}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Hemen başlayın</h2>
          <p className="text-muted-foreground mb-8">Professional planı ister 14 gün ücretsiz deneyin, ister hesabınızı oluşturup doğrudan ödeme adımına geçin.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/kayit/pro" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors">
              14 Gün Ücretsiz Dene <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/kayit?plan=pro&mode=buy" className="inline-flex items-center gap-2 border border-primary/25 text-primary font-semibold px-8 py-4 rounded-xl hover:bg-primary/5 transition-colors">
              Satın Al <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


    {/* Testimonials */}
      <section id="yorumlar" className="py-24">
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
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>






      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <RestoPanLogo iconSize={32} dark />
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
            <Link href="/destek" className="hover:text-white transition-colors">Destek</Link>
            <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</Link>
            <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">Mesafeli Satış</Link>
            <Link href="/iade-politikasi" className="hover:text-white transition-colors">İade Politikası</Link>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} RestoPAN. Tüm hakları saklıdır.</p>
        </div>
      </footer>

    </div>
  );
}
