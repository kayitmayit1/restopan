import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { NetworkStatus } from "@/components/network-status";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RestoPAN — Restoran Yönetim Sistemi",
    template: "%s | RestoPAN",
  },
  description:
    "Türkiye'nin restoran yönetim yazılımı. POS, masa planı, mutfak ekranı (KDS), stok, personel, QR menü ve raporlar — hepsi tek platformda. 15 dakikada kurulum.",
  keywords: [
    "restoran yazılımı", "restoran yönetim sistemi", "pos sistemi", "kafe yazılımı",
    "adisyon programı", "kds mutfak ekranı", "qr menü", "masa yönetimi",
    "restoran otomasyon", "türkiye restoran pos",
  ],
  authors: [{ name: "RestoPAN" }],
  creator: "RestoPAN",
  publisher: "RestoPAN",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "RestoPAN",
    title: "RestoPAN — Restoran Yönetim Sistemi",
    description: "POS, masa, mutfak, stok, personel ve QR menü — hepsi bir arada. Türkiye'de geliştirildi.",
    images: [{ url: "/api/pwa/icon?size=512", width: 512, height: 512, alt: "RestoPAN" }],
  },
  twitter: {
    card: "summary",
    title: "RestoPAN — Restoran Yönetim Sistemi",
    description: "POS, masa, mutfak, stok, personel ve QR menü — hepsi bir arada.",
    images: ["/api/pwa/icon?size=512"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RestoPAN",
    startupImage: [
      { url: "/api/pwa/icon?size=512", media: "(device-width: 375px)" },
    ],
  },
  icons: {
    icon: [
      { url: "/api/pwa/icon?size=32", sizes: "32x32", type: "image/png" },
      { url: "/api/pwa/icon?size=96", sizes: "96x96", type: "image/png" },
      { url: "/api/pwa/icon?size=192", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/api/pwa/icon?size=180", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/api/pwa/icon?size=192",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e85d04" },
    { media: "(prefers-color-scheme: dark)", color: "#e85d04" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${roboto.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <NetworkStatus />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}