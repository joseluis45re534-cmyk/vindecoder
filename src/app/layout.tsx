import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Australian VIN Check - Instant Vehicle History Reports",
  description: "Get detailed vehicle history reports for any Australian car. Check for finance, stolen status, write-offs and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "min-h-screen bg-background font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
