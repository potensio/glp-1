import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Daily Health Journal - Health Tracking Dashboard",
  description:
    "Track weight, blood pressure, blood sugar, medications, and more — designed for GLP‑1 users, diabetics, and anyone committed to better health. My Daily Health Journal is a web-based health dashboard — no app required.",
  keywords: [
    "my daily health journal",
    "health tracking",
    "daily health tracker",
    "health journal",
    "GLP-1 tracker",
    "diabetes tracker",
    "weight tracker",
    "blood pressure monitor",
    "health dashboard",
    "medication tracker"
  ],
  authors: [{ name: "My Daily Health Journal" }],
  creator: "My Daily Health Journal",
  publisher: "My Daily Health Journal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        data-theme="light"
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
