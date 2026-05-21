"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Wifi, Instagram, Facebook, Clock, Flame, ChevronUp } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  calories: number | null;
  preparationTime: number | null;
  allergens: string[];
  isFeatured: boolean;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  items: Item[];
}

interface Org {
  name: string;
  logo: string | null;
  currency: string;
  dailySpecial: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

interface Props {
  org: Org;
  categories: Category[];
  tableName: string | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function MenuUI({ org, categories, tableName }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Hangi kategorinin görünür olduğunu belirle
      let current = categories[0]?.id ?? "";
      for (const cat of categories) {
        const el = categoryRefs.current[cat.id];
        if (el && el.getBoundingClientRect().top <= 100) {
          current = cat.id;
        }
      }
      setActiveCategory(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories]);

  function scrollToCategory(id: string) {
    const el = categoryRefs.current[id];
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveCategory(id);

    // Tab'ı ortala
    const tab = tabsRef.current?.querySelector(`[data-cat="${id}"]`) as HTMLElement | null;
    tab?.scrollIntoView({ inline: "center", behavior: "smooth" });
  }

  const hasSocial = org.instagramUrl || org.facebookUrl || org.twitterUrl;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {org.logo && (
            <Image
              src={org.logo}
              alt={org.name}
              width={32}
              height={32}
              className="rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{org.name}</p>
            {tableName && (
              <p className="text-xs text-muted-foreground">{tableName}</p>
            )}
          </div>
        </div>
      </header>

      {/* Daily Special Banner */}
      {org.dailySpecial && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-start gap-2">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">{org.dailySpecial}</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="bg-white border-b sticky top-14 z-10">
          <div
            ref={tabsRef}
            className="max-w-2xl mx-auto flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-8">
        {categories.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => { categoryRefs.current[cat.id] = el; }}
          >
            <div className="mb-3">
              <h2 className="text-base font-bold">{cat.name}</h2>
              {cat.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
              )}
              {(cat.availableFrom || cat.availableTo) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {cat.availableFrom} – {cat.availableTo}
                </p>
              )}
            </div>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <MenuItemCard key={item.id} item={item} currency={org.currency} />
              ))}
            </div>
          </section>
        ))}

        {/* Wi-Fi Card */}
        {(org.wifiName || org.wifiPassword) && (
          <div className="bg-white rounded-2xl border p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Wi-Fi</p>
              {org.wifiName && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Ağ:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded select-all">{org.wifiName}</span>
                </div>
              )}
              {org.wifiPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground w-12">Şifre:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded select-all">{org.wifiPassword}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media */}
        {hasSocial && (
          <div className="flex items-center justify-center gap-4 py-2">
            {org.instagramUrl && (
              <a
                href={org.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
              </a>
            )}
            {org.facebookUrl && (
              <a
                href={org.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
            )}
            {org.twitterUrl && (
              <a
                href={org.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="X / Twitter"
              >
                <span className="text-sm font-bold text-gray-700">𝕏</span>
              </a>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-2">
          restoPAN ile hazırlandı
        </p>
      </main>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 w-10 h-10 bg-white border shadow-md rounded-full flex items-center justify-center z-30 hover:bg-gray-50 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function MenuItemCard({ item, currency }: { item: Item; currency: string }) {
  const [expanded, setExpanded] = useState(false);
  const minPrice = item.variants.length > 0
    ? Math.min(...item.variants.map((v) => v.price))
    : null;

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden ${item.isFeatured ? "border-amber-200" : ""}`}
      onClick={() => item.description || item.variants.length > 0 ? setExpanded((v) => !v) : null}
    >
      <div className="flex gap-3 p-3">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            width={72}
            height={72}
            className="rounded-lg object-cover shrink-0 w-[72px] h-[72px]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug flex items-center gap-1.5 flex-wrap">
                {item.isFeatured && (
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                {item.name}
              </p>
              {item.description && !expanded && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">
                {minPrice !== null ? `${formatPrice(minPrice, currency)}'den` : formatPrice(item.price, currency)}
              </p>
              {(item.calories || item.preparationTime) && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {item.calories ? `${item.calories} kcal` : ""}
                  {item.calories && item.preparationTime ? " · " : ""}
                  {item.preparationTime ? `${item.preparationTime} dk` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t pt-2">
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
          {item.variants.length > 0 && (
            <div className="space-y-1">
              {item.variants.map((v) => (
                <div key={v.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{v.name}</span>
                  <span className="font-semibold">{formatPrice(v.price, currency)}</span>
                </div>
              ))}
            </div>
          )}
          {item.allergens.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              Alerjenler: {item.allergens.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
