import type { Metadata, Viewport } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Como Acolher Pessoas com Autismo — Um Livro Digital",
  description:
    "Um livro digital com 25 capítulos sobre como compreender, respeitar e apoiar pessoas com Transtorno do Espectro Autista (TEA).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a1a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${literata.variable} ${sourceSans.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
