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
      {/* Nav */}
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

      {/* Hero */}
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/kayit"
            className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base"
          >
            Ücretsiz Başla
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/giris"
            className="border border-border text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-muted transition-colors text-base"
          >
            Demo İncele
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          500+ restoran tarafından kullanılıyor · Türkiye'de geliştirildi
        </p>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 p-1 shadow-2xl ring-1 ring-white/10">
          <div className="rounded-xl overflow-hidden">
            {/* Browser bar */}
            <div className="h-8 bg-[#1e1e1e] flex items-center gap-1.5 px-4 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="flex-1 mx-4">
                <div className="bg-[#2d2d2d] rounded-md text-[#888] text-[10px] px-3 py-0.5 max-w-52 mx-auto text-center">
                  restopan.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard app shell */}
            <div className="flex overflow-hidden" style={{ height: 500 }}>

              {/* ── Sidebar (exact match) ── */}
              <div className="w-52 flex-shrink-0 flex flex-col" style={{ background: "oklch(0.14 0.01 260)" }}>
                {/* Logo */}
                <div className="h-[60px] flex items-center gap-2 px-4 border-b" style={{ borderColor: "oklch(0.25 0.01 260)" }}>
                  <RestoPanLogo iconSize={28} dark />
                  <p className="text-[9px]" style={{ color: "oklch(0.92 0 0 / 50%)" }}>lezzet-restoran</p>
                </div>
                {/* Location */}
                <div className="px-3 py-1.5 border-b" style={{ borderColor: "oklch(0.25 0.01 260)" }}>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "oklch(0.22 0.01 260)" }}>
                    <Store className="w-3 h-3 flex-shrink-0" style={{ color: "oklch(0.92 0 0 / 60%)" }} />
                    <span className="text-[9px] flex-1" style={{ color: "oklch(0.92 0 0 / 60%)" }}>Ana Şube</span>
                  </div>
                </div>
                {/* Nav */}
                <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-hidden">
                  {[
                    { label: "Dashboard", icon: LayoutGrid, active: true, group: "Genel Bakış" },
                    { label: "POS Sistemi", icon: ShoppingCart, active: false },
                    { label: "Siparişler", icon: UtensilsCrossed, active: false },
                    { label: "Masa Planı", icon: LayoutGrid, active: false },
                    { label: "Mutfak (KDS)", icon: ChefHat, active: false },
                    { label: "Menü", icon: BookOpen, active: false },
                    { label: "Stok & Envanter", icon: Package, active: false },
                    { label: "Personel", icon: Users, active: false },
                    { label: "Raporlar", icon: BarChart3, active: false },
                    { label: "Kampanyalar", icon: Tag, active: false },
                    { label: "Ayarlar", icon: Settings, active: false },
                  ].map(({ label, icon: Icon, active }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] ${active ? "font-semibold text-white" : ""}`}
                      style={{
                        background: active ? "hsl(var(--primary))" : "transparent",
                        color: active ? "white" : "oklch(0.92 0 0 / 55%)",
                      }}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </nav>
              </div>

              {/* ── Main content area ── */}
              <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "oklch(0.972 0.003 60)" }}>

                {/* Topbar */}
                <div className="h-[60px] border-b flex items-center justify-between px-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.9)", borderColor: "oklch(0.895 0.005 60)" }}>
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: "oklch(0.13 0.01 260)" }}>Dashboard</p>
                    <p className="text-[9px]" style={{ color: "oklch(0.50 0.01 260)" }}>Bugün, Pazar 20 Nisan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px]" style={{ background: "oklch(0.955 0.004 60)", borderColor: "oklch(0.895 0.005 60)", color: "oklch(0.50 0.01 260)" }}>
                      <div className="w-2.5 h-2.5 opacity-50">🔍</div>
                      Ara...
                    </div>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.955 0.004 60)" }}>
                      <Bell className="w-3 h-3" style={{ color: "oklch(0.50 0.01 260)" }} />
                    </div>
                  </div>
                </div>

                {/* Page content */}
                <div className="flex-1 p-4 space-y-3 overflow-hidden">

                  {/* Stat cards — exact match */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Bugünkü Ciro", value: "₺4.820", sub: "+12.5% dünden", icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trendColor: "text-emerald-600" },
                      { label: "Toplam Sipariş", value: "37", sub: "+8.3% dünden", icon: ShoppingCart, iconBg: "bg-blue-50", iconColor: "text-blue-600", trendColor: "text-emerald-600" },
                      { label: "Aktif Sipariş", value: "8", sub: null, icon: Clock, iconBg: "bg-orange-50", iconColor: "text-orange-600", trendColor: "" },
                      { label: "Masa Doluluk", value: "12/18", sub: "%67 dolu", icon: LayoutGrid, iconBg: "bg-purple-50", iconColor: "text-purple-600", trendColor: "text-muted-foreground" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border" style={{ borderColor: "oklch(0.895 0.005 60 / 0.7)" }}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-medium" style={{ color: "oklch(0.50 0.01 260)" }}>{s.label}</p>
                            <p className="text-base font-bold tracking-tight" style={{ color: "oklch(0.13 0.01 260)" }}>{s.value}</p>
                            {s.sub && <p className={`text-[7px] font-medium ${s.trendColor}`}>{s.sub}</p>}
                          </div>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                            <s.icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle row: Chart + LiveTables */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Revenue chart */}
                    <div className="col-span-2 bg-white rounded-xl shadow-sm border p-3.5" style={{ borderColor: "oklch(0.895 0.005 60 / 0.7)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[8px] font-medium" style={{ color: "oklch(0.50 0.01 260)" }}>Son 7 Günlük Ciro</p>
                          <p className="text-lg font-bold tracking-tight">₺28.340</p>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-2.5 h-2.5" />
                            <span className="text-[7px] font-medium">+15.2% geçen haftaya göre</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px]" style={{ color: "oklch(0.50 0.01 260)" }}>Günlük ort.</p>
                          <p className="text-[11px] font-semibold">₺4.048</p>
                        </div>
                      </div>
                      {/* Bar chart */}
                      <div className="flex items-end gap-1.5 mt-2" style={{ height: 56 }}>
                        {[
                          { h: 42, day: "Pzt", date: "14 Nis" },
                          { h: 68, day: "Sal", date: "15 Nis" },
                          { h: 51, day: "Çar", date: "16 Nis" },
                          { h: 83, day: "Per", date: "17 Nis" },
                          { h: 60, day: "Cum", date: "18 Nis" },
                          { h: 95, day: "Cmt", date: "19 Nis" },
                          { h: 72, day: "Paz", date: "20 Nis", today: true },
                        ].map((b, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                            <div
                              className="w-full rounded-t-sm"
                              style={{
                                height: `${b.h}%`,
                                background: b.today
                                  ? "hsl(var(--primary))"
                                  : b.h === 95
                                  ? "hsl(var(--primary) / 0.75)"
                                  : "hsl(var(--primary) / 0.25)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex mt-1">
                        {["14 Nis","15 Nis","16 Nis","17 Nis","18 Nis","19 Nis","20 Nis"].map((d, i) => (
                          <span key={i} className={`text-[7px] flex-1 text-center ${i === 6 ? "font-semibold text-primary" : ""}`} style={{ color: i === 6 ? undefined : "oklch(0.50 0.01 260)" }}>{d}</span>
                        ))}
                      </div>
                    </div>

                    {/* Live Tables */}
                    <div className="bg-white rounded-xl shadow-sm border p-3" style={{ borderColor: "oklch(0.895 0.005 60 / 0.7)" }}>
                      <p className="text-[9px] font-semibold mb-1">Canlı Masa Durumu</p>
                      <div className="flex items-center gap-2 mb-2">
                        {[{c:"bg-emerald-500",l:"6 Boş"},{c:"bg-red-500",l:"9 Dolu"},{c:"bg-amber-500",l:"3 Rezerve"}].map(x => (
                          <span key={x.l} className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${x.c}`} />
                            <span className="text-[7px]" style={{ color: "oklch(0.50 0.01 260)" }}>{x.l}</span>
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          {n:"M1",s:"O"},{n:"M2",s:"O"},{n:"M3",s:"A"},{n:"M4",s:"O"},
                          {n:"M5",s:"A"},{n:"M6",s:"R"},{n:"M7",s:"O"},{n:"M8",s:"A"},
                          {n:"M9",s:"O"},{n:"M10",s:"O"},{n:"M11",s:"A"},{n:"M12",s:"R"},
                          {n:"M13",s:"O"},{n:"M14",s:"A"},{n:"M15",s:"R"},{n:"M16",s:"O"},
                          {n:"M17",s:"A"},{n:"M18",s:"O"},{n:"M19",s:"O"},{n:"M20",s:"A"},
                        ].map((t) => (
                          <div
                            key={t.n}
                            className={`rounded-lg flex flex-col items-center justify-center py-1.5 border ${
                              t.s === "O" ? "bg-red-50 border-red-200" :
                              t.s === "R" ? "bg-amber-50 border-amber-200" :
                              "bg-emerald-50 border-emerald-200"
                            }`}
                          >
                            <span className="text-[7px] font-semibold">{t.n}</span>
                            <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${t.s === "O" ? "bg-red-500" : t.s === "R" ? "bg-amber-500" : "bg-emerald-500"}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent orders */}
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: "oklch(0.895 0.005 60 / 0.7)" }}>
                    <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: "oklch(0.895 0.005 60)" }}>
                      <span className="text-[9px] font-semibold">Son Siparişler</span>
                      <span className="text-[8px] text-primary">Tümü →</span>
                    </div>
                    <div className="divide-y divide-border/50">
                      {[
                        { no: "SP-1042", masa: "Masa 5", items: "Adana Kebap, Ayran +1", tutar: "₺285", durum: "Hazır", dCls: "bg-emerald-100 text-emerald-700", time: "14:32" },
                        { no: "SP-1041", masa: "Masa 2", items: "Karışık Izgara, Salata", tutar: "₺520", durum: "Hazırlanıyor", dCls: "bg-primary/10 text-primary", time: "14:28" },
                        { no: "SP-1040", masa: "Masa 9", items: "Lahmacun ×2, İçecek", tutar: "₺140", durum: "Tamamlandı", dCls: "bg-muted text-muted-foreground", time: "14:15" },
                      ].map((o) => (
                        <div key={o.no} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50/50">
                          <div className="flex items-center gap-2.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-semibold">{o.no}</span>
                                <span className="text-[8px]" style={{ color: "oklch(0.50 0.01 260)" }}>{o.masa}</span>
                              </div>
                              <p className="text-[7px]" style={{ color: "oklch(0.50 0.01 260)" }}>{o.items}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${o.dCls}`}>{o.durum}</span>
                            <div className="text-right">
                              <p className="text-[9px] font-semibold">{o.tutar}</p>
                              <p className="text-[7px]" style={{ color: "oklch(0.50 0.01 260)" }}>{o.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Bir restoranın ihtiyacı olan her şey
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Ayrı ayrı yazılım satın almanıza gerek yok. Her şey birbirine bağlı çalışır.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            3 adımda hazır
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Hesap Oluştur", desc: "Restoran adınızı girin, 30 saniyede hesabınız hazır. 14 gün ücretsiz deneyin." },
            { step: "02", title: "Menünüzü Kurun", desc: "Hazır şablonlardan seçin ya da kendi menünüzü ekleyin. Masalarınız otomatik oluşturulur." },
            { step: "03", title: "Çalışmaya Başlayın", desc: "POS'u açın, siparişleri alın. Mutfak anında görür, stok otomatik güncellenir." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-5">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
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
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlar" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Şeffaf fiyatlandırma</h2>
          <p className="text-muted-foreground">Gizli ücret yok. İstediğiniz zaman iptal.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-7 relative border-2 flex flex-col ${
                p.highlight
                  ? "border-primary shadow-xl shadow-primary/10"
                  : "border-gray-100"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {p.badge}
                  </span>
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${p.highlight ? "bg-primary/8 border-primary/20" : "bg-gray-50 border-gray-100"}`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <p className="font-bold text-lg">{p.name}</p>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.sub}</span>
              </div>
              <ul className="space-y-2.5 my-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-colors ${
                  p.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bugün başlayın
          </h2>
          <p className="text-white/70 text-lg mb-8">
            14 günlük ücretsiz deneme. Dilediğiniz zaman iptal edin.
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-base"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">RestoPan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 RestoPan. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-foreground transition-colors">Kullanım Şartları</a>
            <a href="mailto:destek@restopro.app" className="hover:text-foreground transition-colors">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
