import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LogFo - 学習ロードマップ",
  description:
    "AIが最適な学習ロードマップを自動生成。あなたのスキルと目標に合わせた計画で、効率的にスキルアップしよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
