import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sideBar";
import { ThemeProvider } from "@/contexts/themeContext";
import { AuthProvider } from "@/contexts/authContext";
import GlobalPlayerBar from "@/components/player/GlobalPlayerBar";
import { Toaster } from "@/components/ui/sonner";
import { SongProvider } from "@/contexts/songContext";
import { FavoriteProvider } from "@/contexts/favoriteContext";
import { PlayListProvider } from "@/contexts/playListContext";
import { FollowProvider } from "@/contexts/followContext";

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
          <AuthProvider>
            <SongProvider>
              <FavoriteProvider>
                <PlayListProvider>
                  <FollowProvider>
                    <Sidebar />
                    <Toaster />
                    <main className="flex-1 overflow-y-auto">{children}</main>
                  </FollowProvider>
                </PlayListProvider>
              </FavoriteProvider>
            </SongProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
