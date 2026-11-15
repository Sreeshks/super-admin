import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Super Admin Console | Multi-Tenant Platform",
  description: "Centralized administration console for multi-tenant business website management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <QueryProvider>
          <Suspense fallback={null}>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
