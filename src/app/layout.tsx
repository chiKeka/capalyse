import QueryProvider from "@/hooks/QueryProvider";
import { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import RoleSelectionModal from "@/components/auth/RoleSelectionModal";
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
  title: "Capalyse - Empowering Growth, Investor Readiness for African MSMEs",
  description:
    "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
  keywords: [
    "Capalyse",
    "Empowering Growth",
    "Investment Platform",
    "SMEs",
    "Investors",
    "Africa",
    "Capital Access",
    "Business Growth",
    "Funding",
    "Investment Readiness",
    "Vetted SMEs",
    "Deal Flow",
    "African Business",
    "Venture Capital",
    "Impact Investing",
    "Startup Funding",
    "Financial Analysis",
    "SME Support",
    "Capital Allocation",
    "Emerging Markets",
    "SME Ecosystem",
    "Strategic Support",
    "Data-Backed Decisions",
    "Sustainable Impact",
    "Business Readiness",
    "African MSMEs",
    "Investor Readiness",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "Capalyse",
  openGraph: {
    title: "Capalyse - Empowering Growth, Investor Readiness for African MSMEs",
    description:
      "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
    type: "website",
    locale: "en_US",
    siteName: "Capalyse",
    url: "https://capalyse.com",
    images: [
      {
        url: "https://capalyse.com/images/landing-hero.png",
        width: 1200,
        height: 630,
        alt: "Capalyse - Empowering Growth, Investor Readiness for African MSMEs",
      },
    ],
  },
  twitter: {
    title: "Capalyse - Empowering Growth, Investor Readiness for African MSMEs",
    description:
      "Capalyse bridges the gap between investment-ready SMEs and value-driven investors across Africa.",
    card: "summary_large_image",
    site: "@capalyse",
    creator: "@capalyse",
    images: [
      {
        url: "https://capalyse.com/images/landing-hero.png",
        width: 1200,
        height: 630,
        alt: "Capalyse - Empowering Growth, Investor Readiness for African MSMEs",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
          <RoleSelectionModal />
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
