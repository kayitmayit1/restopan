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
  title: "RestoPAN — Restoran Yönetim Sistemi",
  description:
    "Restoranınızı tek bir platformdan yönetin. POS, masa, mutfak, stok, personel ve daha fazlası.",
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