import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { logoutUser } from './login/actions';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simatrix LMS",
  description: "Modern Learning Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 flex h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
