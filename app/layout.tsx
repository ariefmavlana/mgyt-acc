import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "Mgyt Account",
  description: "Accounting System for small and medium businesses",
};

import { AuthProvider } from "@/hooks/use-auth";
import { CompanyProvider } from "@/hooks/use-company";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={ubuntu.variable} suppressHydrationWarning>
      <body className={`${ubuntu.className} antialiased`}>
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
