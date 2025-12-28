import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Testimonial Hub - Collect & Display Customer Testimonials",
  description: "The easiest way to collect, manage, and display customer testimonials. Build trust and convert more customers with authentic social proof.",
  keywords: ["testimonials", "social proof", "customer reviews", "SaaS", "conversion optimization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


