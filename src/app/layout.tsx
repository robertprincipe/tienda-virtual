import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@pheralb/toast";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S&P Soluciones Integrales",
  description:
    "Tienda virtual de productos orgánicos de alta calidad. Miel, quinua, café, leche, queso y más productos naturales para tu bienestar y el de tu familia.",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://www.spsolucionesintegrales.com",
    siteName: "S&P Soluciones Integrales",
    title: "S&P Soluciones Integrales - Productos Orgánicos de Alta Calidad",
    description:
      "Tienda virtual de productos orgánicos de alta calidad. Miel, quinua, café, leche, queso y más productos naturales para tu bienestar y el de tu familia.",
    images: [
      {
        url: "/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "S&P Soluciones Integrales - Productos Orgánicos",
      },
    ],
  },
  metadataBase: new URL("https://www.spsolucionesintegrales.com"),
  twitter: {
    card: "summary_large_image",
    title: "S&P Soluciones Integrales - Productos Orgánicos de Alta Calidad",
    description:
      "Tienda virtual de productos orgánicos de alta calidad. Miel, quinua, café, leche, queso y más productos naturales para tu bienestar y el de tu familia.",
    images: ["/hero-image.webp"],
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
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
