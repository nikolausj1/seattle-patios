import type { Metadata, Viewport } from "next";
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

// iOS Safari edge-to-edge:
// - viewportFit=cover lets the page render under the status bar / URL bar
//   instead of being inset into the safe area (so cards bleed off the bottom
//   and the photo bleeds behind the top).
// - themeColor sets the tint Safari uses for the chrome behind the URL bar /
//   status bar so it matches the light-blue page background and doesn't show
//   as a distracting blue strip.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#DDEEF5",
};

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
