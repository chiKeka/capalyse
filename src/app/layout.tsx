
import QueryProvider from "@/hooks/QueryProvider";
import { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const queryClient = new QueryClient();
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capalyse - Empowering Growth",
  description: "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
  keywords: ["Capalyse", "Empowering Growth", "Investment", "SMEs", "Investors", "Africa"],
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "Capalyse",
  openGraph: {
    title: "Capalyse - Empowering Growth",
    description: "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
    type: "website",
    locale: "en_US",
    siteName: "Capalyse",
    url: "https://capalyse.com",
    images: [
      {
        url: "https://capalyse.com/images/landing-hero.png",
        width: 1200,
        height: 630,
        alt: "Capalyse - Empowering Growth",
      },
    ],
  },
  twitter: {
    title: "Capalyse - Empowering Growth",
    description: "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
    card: "summary_large_image",
    site: "@capalyse",
    creator: "@capalyse",
    images: [
      {
        url: "https://capalyse.com/images/landing-hero.png",
        width: 1200,
        height: 630,
        alt: "Capalyse - Empowering Growth",
      },
    ],
  },  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
