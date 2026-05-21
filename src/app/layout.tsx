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

// No `viewport` export — Next.js defaults to
// `width=device-width, initial-scale=1`. We deliberately do NOT set
// `viewportFit: "cover"`: with cover, page content renders *behind* the
// iOS status bar, which let the hero "peek" behind it after scrolling.
// Without it, iOS insets the content below the status bar and the peek
// is structurally impossible — matching the Seattle Visitor Guide.
export const metadata: Metadata = {
  title: "Seattle Patio Vibes — Seattle's Best Patios, Ranked",
  description:
    "Seattle's best patios, ranked by sun, food, drinks, and vibe.",
  openGraph: {
    title: "Seattle Patio Vibes — Seattle's Best Patios, Ranked",
    description:
      "Seattle's best patios, ranked by sun, food, drinks, and vibe.",
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
