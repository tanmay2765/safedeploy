import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "SafeDeploy — DevSecOps Deployment Platform",
  description:
    "Enterprise DevSecOps Delivery Platform featuring Progressive Canary Rollouts, Automated Health Analysis, and Rollback Protection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

