import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sideBar";
import { ThemeProvider } from "@/contexts/themeContext";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`flex ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Sidebar />
          <Toaster />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
