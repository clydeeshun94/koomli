import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koomli Disease Detection AI - Plant Disease Analysis",
  description: "AI-powered plant disease detection system. Upload plant images to identify diseases and get expert agricultural advice.",
  keywords: ["plant disease", "AI detection", "agriculture", "farming", "disease analysis", "plant health"],
  authors: [{ name: "Clyde at BigInt" }],
  openGraph: {
    title: "Koomli Disease Detection AI",
    description: "AI-powered plant disease detection and agricultural advice",
    url: "https://bigint.onrender.com/about#portfolio",
    siteName: "Koomli",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koomli Disease Detection AI",
    description: "AI-powered plant disease detection and agricultural advice",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
