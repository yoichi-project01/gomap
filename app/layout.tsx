import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Go! Map",
  description: "現在地を表示する地図アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-zinc-50">
        <div className="flex-1 overflow-hidden min-h-0">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
