export interface TemplateItem {
  name: string;
  description?: string;
  price: number;
}

export interface TemplateCategory {
  name: string;
  items: TemplateItem[];
}

export interface Template {
  id: string;
  label: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  tagline: string;
  categories: TemplateCategory[];
}

export const TEMPLATES: Template[] = [
  {
    id: "turk",
    label: "Türk Restoranı",
    subtitle: "Anadolu Mutfağı",
    emoji: "🍖",
    gradient: "from-amber-800 via-amber-700 to-orange-600",
    accentColor: "#92400e",
    bgColor: "#fffbf0",
    borderColor: "#d97706",
    textColor: "#78350f",
    tagline: "Kebaplar · Mezeler · Çorbalar · Tatlılar",
    categories: [
      {
        name: "Çorbalar",
        items: [
          { name: "Mercimek Çorbası", description: "Kırmızı mercimek, tereyağı, nane", price: 85 },
          { name: "Ezogelin Çorbası", description: "Pirinç, kırmızı mercimek, bulgur", price: 85 },
          { name: "İşkembe Çorbası", price: 95 },
          { name: "Paça Çorbası", price: 110 },
        ],
      },
      {
        name: "Mezeler",
        items: [
          { name: "Humus", description: "Tahin, limon, zeytinyağı", price: 120 },
          { name: "Cacık", price: 95 },
          { name: "Patlıcan Salatası", price: 110 },
          { name: "Haydari", price: 95 },
          { name: "Sigara Böreği", description: "4 adet, beyaz peynir", price: 130 },
        ],
      },
      {
        name: "Kebaplar",
        items: [
          { name: "Adana Kebap", description: "Acılı kıyma kebabı, lavaş, közlenmiş sebze", price: 320 },
          { name: "Urfa Kebap", description: "Sade kıyma kebabı", price: 300 },
          { name: "Şiş Kebap", description: "Kuzu şiş, domates, biber", price: 340 },
          { name: "Piliç Şiş", price: 280 },
          { name: "Karışık Izgara", description: "Adana, şiş, kanat, piliç şiş", price: 480 },
        ],
      },
      {
        name: "Ana Yemekler",
        items: [
          { name: "Kuru Fasulye", description: "Pilav ile", price: 180 },
          { name: "İmam Bayıldı", price: 160 },
          { name: "Hünkâr Beğendi", price: 280 },
          { name: "Karnıyarık", price: 220 },
        ],
      },
      {
        name: "Tatlılar",
        items: [
          { name: "Baklava", description: "2 dilim, fıstıklı", price: 150 },
          { name: "Künefe", description: "Antep fıstıklı, kaymak ile", price: 180 },
          { name: "Sütlaç", price: 95 },
          { name: "Kazandibi", price: 90 },
        ],
      },
      {
        name: "İçecekler",
        items: [
          { name: "Ayran", price: 45 },
          { name: "Şalgam", price: 55 },
          { name: "Türk Çayı", price: 35 },
          { name: "Türk Kahvesi", price: 65 },
          { name: "Su", price: 25 },
        ],
      },
    ],
  },
  {
    id: "pizza",
    label: "Pizzacı",
    subtitle: "İtalyan Mutfağı",
    emoji: "🍕",
    gradient: "from-red-800 via-red-600 to-rose-500",
    accentColor: "#991b1b",
    bgColor: "#fff8f8",
    borderColor: "#dc2626",
    textColor: "#7f1d1d",
    tagline: "Pizza · Makarna · Antipasti · Tatlılar",
    categories: [
      {
        name: "Başlangıçlar",
        items: [
          { name: "Bruschetta", description: "Domates, sarımsak, fesleğen", price: 120 },
          { name: "Mozzarella Sticks", description: "5 adet, marinara sos", price: 150 },
          { name: "Sarımsaklı Ekmek", price: 80 },
          { name: "Çeşitli Antipasti", price: 220 },
        ],
      },
      {
        name: "Pizzalar",
        items: [
          { name: "Margherita", description: "Domates sosu, mozzarella, fesleğen", price: 280 },
          { name: "Pepperoni", description: "Domates sosu, mozzarella, pepperoni", price: 320 },
          { name: "Quattro Formaggi", description: "Dört çeşit peynir", price: 360 },
          { name: "BBQ Tavuklu", description: "BBQ sos, tavuk, soğan, mozzarella", price: 340 },
          { name: "Vejetaryen", description: "Izgara sebzeler, mozzarella", price: 300 },
          { name: "Karışık", description: "Sucuk, mantar, biber, zeytin", price: 350 },
        ],
      },
      {
        name: "Makarnaları",
        items: [
          { name: "Spaghetti Bolognese", description: "Kıymalı domates sos", price: 240 },
          { name: "Fettuccine Alfredo", description: "Krema sos, parmesan", price: 260 },
          { name: "Penne Arrabbiata", description: "Acılı domates sos", price: 220 },
          { name: "Carbonara", description: "Guanciale, yumurta, parmesan", price: 270 },
        ],
      },
      {
        name: "Tatlılar",
        items: [
          { name: "Tiramisu", price: 150 },
          { name: "Panna Cotta", description: "Çilek sosu", price: 130 },
          { name: "Çikolatalı Lav Keki", price: 160 },
        ],
      },
      {
        name: "İçecekler",
        items: [
          { name: "Kola", price: 60 },
          { name: "Limonata", price: 75 },
          { name: "Espresso", price: 65 },
          { name: "Cappuccino", price: 90 },
          { name: "Su", price: 25 },
        ],
      },
    ],
  },
  {
    id: "kafe",
    label: "Kafe & Brunch",
    subtitle: "Specialty Coffee",
    emoji: "☕",
    gradient: "from-stone-700 via-stone-600 to-amber-700",
    accentColor: "#44403c",
    bgColor: "#fafaf9",
    borderColor: "#78716c",
    textColor: "#292524",
    tagline: "Kahvaltı · Kahve · Sandviç · Pasta",
    categories: [
      {
        name: "Kahvaltılar",
        items: [
          { name: "Serpme Kahvaltı", description: "2 kişilik, tam Türk kahvaltısı", price: 480 },
          { name: "Avokado Toast", description: "Çavdar ekmeği, poşe yumurta", price: 220 },
          { name: "Eggs Benedict", description: "İngiliz muffin, hollandaise", price: 240 },
          { name: "Granola Tabağı", description: "Yoğurt, mevsim meyveleri", price: 160 },
          { name: "Omlet", description: "İstenilen malzeme ile", price: 180 },
        ],
      },
      {
        name: "Sıcak İçecekler",
        items: [
          { name: "Filtre Kahve", price: 75 },
          { name: "Espresso", price: 65 },
          { name: "Americano", price: 80 },
          { name: "Latte", price: 95 },
          { name: "Cappuccino", price: 95 },
          { name: "Flat White", price: 100 },
          { name: "Türk Kahvesi", price: 65 },
          { name: "Bitki Çayı", price: 55 },
        ],
      },
      {
        name: "Soğuk İçecekler",
        items: [
          { name: "Cold Brew", price: 100 },
          { name: "Iced Latte", price: 100 },
          { name: "Frappe", price: 110 },
          { name: "Limonata", price: 75 },
          { name: "Taze Portakal Suyu", price: 90 },
        ],
      },
      {
        name: "Sandviçler & Hafif",
        items: [
          { name: "Club Sandwich", description: "Tavuk, bacon, domates, marul", price: 195 },
          { name: "Tost", description: "Kaşar peynir, domates", price: 120 },
          { name: "Çeşitli Wrap", price: 180 },
          { name: "Sezar Salata", description: "Marul, crouton, parmesan, sezar sos", price: 170 },
        ],
      },
      {
        name: "Tatlılar & Pastalar",
        items: [
          { name: "Cheesecake", description: "Günün meyvesi ile", price: 140 },
          { name: "Brownie", description: "Fındıklı, dondurma ile", price: 130 },
          { name: "Waffle", description: "Muz, Nutella, dondurma", price: 160 },
          { name: "Dilim Kek", price: 90 },
        ],
      },
    ],
  },
  {
    id: "burger",
    label: "Burger & Fast Food",
    subtitle: "American Style",
    emoji: "🍔",
    gradient: "from-yellow-600 via-orange-500 to-red-500",
    accentColor: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#f59e0b",
    textColor: "#78350f",
    tagline: "Burgerler · Yanlar · Menüler · İçecekler",
    categories: [
      {
        name: "Burgerler",
        items: [
          { name: "Classic Burger", description: "Dana köfte, cheddar, turşu, sos", price: 220 },
          { name: "BBQ Burger", description: "Dana köfte, BBQ sos, soğan halkası", price: 260 },
          { name: "Tavuk Burger", description: "Çıtır tavuk, coleslaw, ranch", price: 230 },
          { name: "Cheese Burger", description: "Çift köfte, çift cheddar", price: 290 },
          { name: "Mushroom Swiss", description: "Mantar, İsviçre peyniri, kremalı sos", price: 270 },
          { name: "Vegan Burger", description: "Nohut köftesi, guacamole", price: 240 },
        ],
      },
      {
        name: "Yanlar",
        items: [
          { name: "Patates Kızartması", price: 80 },
          { name: "Tatlı Patates Kızartması", price: 95 },
          { name: "Soğan Halkası", price: 90 },
          { name: "Coleslaw", price: 65 },
          { name: "Side Salata", price: 70 },
        ],
      },
      {
        name: "Menüler",
        items: [
          { name: "Classic Menü", description: "Classic Burger + Patates + İçecek", price: 320 },
          { name: "BBQ Menü", description: "BBQ Burger + Patates + İçecek", price: 360 },
          { name: "Tavuk Menü", description: "Tavuk Burger + Patates + İçecek", price: 330 },
        ],
      },
      {
        name: "İçecekler",
        items: [
          { name: "Kola", price: 55 },
          { name: "Fanta", price: 55 },
          { name: "Ayran", price: 45 },
          { name: "Milkshake", description: "Çikolata / Vanilya / Çilek", price: 110 },
          { name: "Su", price: 25 },
        ],
      },
    ],
  },
];
