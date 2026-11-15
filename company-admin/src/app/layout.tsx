import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Company Admin Panel | Business Portal",
  description: "Independent business and website management interface for multi-tenant companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
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
