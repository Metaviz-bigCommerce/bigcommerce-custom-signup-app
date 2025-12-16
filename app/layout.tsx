import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/context/session";
import { ToastProvider } from "@/components/common/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signup Flow Customization - BigCommerce",
  description: "Customize and manage your BigCommerce store signup forms with advanced form builder, email templates, and request management.",
  keywords: ["BigCommerce", "Signup Forms", "Form Builder", "E-commerce"],
  openGraph: {
    title: "Signup Flow Customization - BigCommerce",
    description: "Customize and manage your BigCommerce store signup forms",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
