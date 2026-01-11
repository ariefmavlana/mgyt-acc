import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mgyt Account",
  description: "Accounting System for small and medium businesses",
};

import { AuthProvider } from "@/hooks/use-auth";
import { CompanyProvider } from '@/hooks/use-company';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/components/providers/query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <CompanyProvider>
              {children}
              <Toaster position="top-center" expand={false} richColors />
            </CompanyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
