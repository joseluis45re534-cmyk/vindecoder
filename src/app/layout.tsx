import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL('https://vindecoder-391.pages.dev'),
  title: {
    default: "Australian VIN Check – Instant Vehicle History Reports | VINDecoderAU",
    template: "%s | VINDecoderAU",
  },
  description: "Australia's most trusted VIN check service. Get instant PPSR, stolen vehicle, write-off, finance, and registration reports for any Australian car. One-time payment, instant PDF download.",
  keywords: ["VIN check Australia", "vehicle history report", "PPSR check", "stolen car check", "car finance check", "write-off check", "VIN decoder", "Australian vehicle report"],
  authors: [{ name: "VINDecoderAU" }],
  creator: "VINDecoderAU",
  publisher: "VINDecoderAU",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://vindecoder-391.pages.dev",
    siteName: "VINDecoderAU",
    title: "Australian VIN Check – Instant Vehicle History Reports",
    description: "Get instant PPSR, stolen vehicle, write-off, and finance reports for any Australian car. Trusted by thousands of buyers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VINDecoderAU - Australian Vehicle History Reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Australian VIN Check – Instant Vehicle History Reports",
    description: "Get instant PPSR, stolen vehicle, write-off, and finance reports for any Australian car.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://vindecoder-391.pages.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
