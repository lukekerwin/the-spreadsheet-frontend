import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Rajdhani } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Navbar from "@/components/shared/navbar/Navbar";
import Footer from "@/components/shared/footer/Footer";
import NotificationContainer from "@/components/shared/notifications/NotificationContainer";
import { ErrorBoundary } from "@/components/shared/error-boundary/ErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Spreadsheet - Advanced Hockey Analytics",
  description: "Custom bespoke esports hockey analytics",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${rajdhani.variable} antialiased`}
      >
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <QueryProvider>
                <div className="app-wrapper">
                  <Navbar />
                  <main className="main-content">
                    {children}
                  </main>
                  <Footer />
                </div>
                <NotificationContainer />
              </QueryProvider>
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
