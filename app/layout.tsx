import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "./(frontend)/context/AuthProvider";

import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speedyo",
  description: "Speedyo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
          <Script
          // src="https://sandbox.web.squarecdn.com/v1/square.js"  for devlopment
          src = ' https://web.squarecdn.com/v1/square.js '  
          strategy="beforeInteractive"
        />
      </body>
        </AuthProvider>
    </html>
  );
}
