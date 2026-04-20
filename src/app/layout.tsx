import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { NetworkStatus } from "@/components/network-status";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RestoPan — Restoran Yönetim Sistemi",
  description:
    "Restoranınızı tek bir platformdan yönetin. POS, masa, mutfak, stok, personel ve daha fazlası.",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "RestoPan" },
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
        </Providers>
      </body>
    </html>
  );
}
