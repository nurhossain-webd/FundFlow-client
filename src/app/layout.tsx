import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "FundFlow — Fund ideas. Move impact forward.",
    template: "%s | FundFlow",
  },
  description: "Fund ideas. Move impact forward.",
  applicationName: "FundFlow",
  keywords: [
    "crowdfunding",
    "fundraising",
    "creative projects",
    "community support",
  ],
  openGraph: {
    type: "website",
    siteName: "FundFlow",
    title: "FundFlow — Fund ideas. Move impact forward.",
    description:
      "Discover credible campaigns and help meaningful ideas gain momentum.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#062F35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AppProviders>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
