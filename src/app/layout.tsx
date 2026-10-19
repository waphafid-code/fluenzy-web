import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fluenzy - AI Adaptive English Learning Platform",
  description: "Platform belajar bahasa Inggris adaptif cerdas bergaya Duolingo dengan diagnosis kognitif, maskot interaktif, dan pengulangan berjarak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-300 dark:selection:bg-emerald-800 selection:text-emerald-950 dark:selection:text-emerald-100">
        {children}
      </body>
    </html>
  );
}
