import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRANDING_CONFIG } from "@/config/branding";

export const metadata: Metadata = {
  title: `${BRANDING_CONFIG.brandName} · ${BRANDING_CONFIG.brandSubtitle}`,
  description: BRANDING_CONFIG.slogan,
  openGraph: {
    title: `${BRANDING_CONFIG.brandName} · 街坊每日鮮菜直通車`,
    description: "源頭直供 · 晨採午達 · 點擊登記並加入大廈專屬 WhatsApp 訂菜群",
    siteName: BRANDING_CONFIG.brandName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className="min-h-screen bg-slate-50 antialiased flex flex-col items-center">
        <div className="w-full max-w-md min-h-screen bg-white shadow-xl flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
