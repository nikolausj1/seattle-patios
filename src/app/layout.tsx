import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seattle Patios - The Best Outdoor Dining in Seattle",
  description:
    "A scored and curated guide to Seattle's best patios — ranked by sun, food & drink, and the space itself.",
  openGraph: {
    title: "Seattle Patios - The Best Outdoor Dining in Seattle",
    description:
      "A scored and curated guide to Seattle's best patios — ranked by sun, food & drink, and the space itself.",
    type: "website",
    url: "https://seattlepatiovibes.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
